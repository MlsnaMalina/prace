/**
 * Brány (sekce 6) a bodovací model (sekce 7) briefingu.
 *
 * Čistá logika, žádné závislosti, žádná síť. Běží v GitHub Actions zadarmo.
 * Model do toho vstupuje jen třemi poli, která spočítat nejde:
 *   je_financni_pozice, naplne_prace, seniorita
 * Všechno ostatní je aritmetika.
 */

/** Vstupní tvar normalizované nabídky. Chybějící údaj je vždy null, nikdy odhad. */
export const PRAZDNA_NABIDKA = {
  url: null,
  pozice: null,
  firma: null,
  lokalita: null,
  adresa: null,

  // brány
  je_financni_pozice: null,   // bool  — úsudek modelu (brána 2)

  // bodovaná kritéria
  plat_uveden: false,
  plat_od: null,
  plat_do: null,
  home_office_dny: null,      // 0..5 | null = neuvedeno
  pruzna_doba: null,          // true = v inzerátu zmíněna
  naplne_prace: null,         // 'jadro' | 'pribuzna' | 'vzdalena'  — úsudek modelu
  seniorita: null,            // 'seniorni' | 'medior' | 'juniorni' — úsudek modelu
  dojezd_min: null,           // minuty | null = neověřeno
  pevna_doba_pres_rani_spicku: false,

  // přirážky a srážky navíc
  zminuje_procesy_automatizaci_bi: false,
  firma_ze_vzorku: false,
  prevazne_administrativa: false,
  pracovni_cesty: 'neuvedeno', // 'zadne'|'bez_prespani'|'s_prespanim'|'opakovane'|'neuvedeno'

  // podklady pro štítky
  vedeni_tymu: null,
  inzerat_stari_dny: null,
  ho_az_po_zapracovani: false,
  vypsano_agenturou: false,
  rozpor_benefity_popis: false,
  teambuilding_v_benefitech: false,
};

/**
 * Sekce 6. Vrací { prosel, duvod }.
 * Vyřazený inzerát se ZAPISUJE se zdůvodněním, nemizí beze stopy.
 */
export function brany(n, cfg) {
  if (n.plat_uveden && n.plat_od != null && n.plat_od < cfg.brany.plat_minimum) {
    return {
      prosel: false,
      duvod: `uvedený plat ${n.plat_od} Kč je pod hranicí ${cfg.brany.plat_minimum} Kč`,
    };
  }
  if (n.je_financni_pozice === false) {
    return { prosel: false, duvod: 'není finanční, controllingová ani ekonomická pozice' };
  }
  if (n.je_financni_pozice == null) {
    // Nejednoznačné se nevyhazuje. Projde dál a dostane štítek.
    return { prosel: true, duvod: null, nejiste: true };
  }
  return { prosel: true, duvod: null };
}

function srazkaHomeOffice(dny, cfg) {
  if (dny == null) return cfg.home_office.neuvedeno;
  const klic = String(Math.min(dny, 4));
  return cfg.home_office.stupnice[klic] ?? cfg.home_office.stupnice['4'];
}

function srazkaPlat(n, cfg) {
  if (!n.plat_uveden) return cfg.plat.neuveden;
  const hodnota = cfg.plat.ktera_hodnota === 'plat_do' ? (n.plat_do ?? n.plat_od) : (n.plat_od ?? n.plat_do);
  if (hodnota == null) return cfg.plat.neuveden;
  for (const p of cfg.plat.pasma) {
    if (hodnota >= p.od) return p.srazka;
  }
  return cfg.plat.pasma[cfg.plat.pasma.length - 1].srazka;
}

function srazkaDojezd(n, cfg) {
  if (n.dojezd_min == null) return cfg.dojezd.neznamy_dojezd;

  let zaklad = 0;
  for (const p of cfg.dojezd.zaklad_podle_casu) {
    if (p.do_minut == null || n.dojezd_min <= p.do_minut) { zaklad = p.srazka; break; }
  }

  // Dny v kanceláři = 5 minus dny home officu. Neuvedený HO se počítá jako 0 dní doma.
  const hoDny = n.home_office_dny == null ? 0 : Math.min(n.home_office_dny, 5);
  const dnyVKancelari = Math.max(0, 5 - hoDny);
  const koef = cfg.dojezd.koeficient_podle_dnu_v_kancelari[String(dnyVKancelari)] ?? 1.0;

  return Math.round(zaklad * koef * 100) / 100;
}

function srazkaCesty(n, cfg) {
  switch (n.pracovni_cesty) {
    case 'bez_prespani': return cfg.srazky_navic.cesty_bez_prespani;
    case 's_prespanim': return cfg.srazky_navic.cesty_s_prespanim;
    case 'opakovane': return cfg.srazky_navic.cesty_opakovane;
    default: return 0; // 'zadne' i 'neuvedeno'
  }
}

function plati_kombinacni_pravidlo(n, cfg) {
  const p = cfg.kombinacni_pravidlo.podminky;
  const hoDny = n.home_office_dny == null ? 0 : n.home_office_dny;
  return (
    n.pevna_doba_pres_rani_spicku === p.pevna_doba_pres_rani_spicku &&
    n.dojezd_min != null && n.dojezd_min > p.dojezd_nad_minut &&
    hoDny < p.home_office_dny_pod
  );
}

function stitky(n, cfg, kombinace) {
  const s = [];
  const P = cfg.stitky.pocitane;
  const T = cfg.stitky.z_textu;

  if (!n.plat_uveden) s.push(P.plat_neuveden);
  if (n.dojezd_min == null) s.push(P.dojezd_neoveren);
  if (n.pracovni_cesty === 'neuvedeno') s.push(P.cesty_neuvedeny);
  if (kombinace) s.push(P.kolona);
  if (n.inzerat_stari_dny != null && n.inzerat_stari_dny > cfg.stitky.stari_inzeratu_dny) s.push(P.inzerat_stary);
  if (n.vedeni_tymu === false) s.push(P.bez_vedeni_tymu);

  if (n.ho_az_po_zapracovani) s.push(T.ho_az_po_zapracovani);
  if (n.vypsano_agenturou) s.push(T.vypsano_agenturou);
  if (n.rozpor_benefity_popis) s.push(T.rozpor_benefity_popis);
  if (n.teambuilding_v_benefitech) s.push(T.teambuilding);

  return s;
}

function pasmo(skore, cfg) {
  if (skore >= cfg.pasma.reagovat) return 'reagovat';
  if (skore >= cfg.pasma.zvazit) return 'zvazit';
  if (skore >= cfg.pasma.prehled_trhu) return 'prehled_trhu';
  return 'statistika';
}

/**
 * Sekce 7. Vrací { skore, raw, pasmo, polozky, stitky }.
 * `polozky` je rozpad po kritériích — kvůli tomu, aby šlo kdykoliv doložit, odkud se skóre vzalo.
 */
export function skoruj(n, cfg) {
  const polozky = [];
  const pridej = (nazev, body) => { polozky.push({ nazev, body }); return body; };

  let soucet = cfg.start;

  soucet += pridej('home_office', srazkaHomeOffice(n.home_office_dny, cfg));
  soucet += pridej('pruzna_doba', n.pruzna_doba ? cfg.pruzna_doba.zminena : cfg.pruzna_doba.nezminena);
  soucet += pridej('plat', srazkaPlat(n, cfg));
  soucet += pridej('naplne_prace', cfg.naplne_prace[n.naplne_prace] ?? cfg.naplne_prace.vzdalena);
  soucet += pridej('seniorita', cfg.seniorita[n.seniorita] ?? cfg.seniorita.juniorni);
  soucet += pridej('dojezd', srazkaDojezd(n, cfg));

  const kombinace = plati_kombinacni_pravidlo(n, cfg);
  if (kombinace) soucet += pridej('kombinacni_pravidlo', cfg.kombinacni_pravidlo.srazka);

  if (n.zminuje_procesy_automatizaci_bi) soucet += pridej('prirazka_procesy', cfg.prirazky.procesy_automatizace_bi);
  if (n.firma_ze_vzorku) soucet += pridej('prirazka_firma', cfg.prirazky.firma_ze_vzorku_nebo_vzorce);
  if (n.prevazne_administrativa) soucet += pridej('administrativa', cfg.srazky_navic.prevazne_administrativa);

  const cesty = srazkaCesty(n, cfg);
  if (cesty !== 0) soucet += pridej('pracovni_cesty', cesty);

  const raw = Math.round(soucet * 100) / 100;
  const skore = Math.max(cfg.clamp.min, Math.min(cfg.clamp.max, Math.round(raw)));

  return { skore, raw, pasmo: pasmo(skore, cfg), polozky, stitky: stitky(n, cfg, kombinace) };
}

/** Jeden průchod: brány, pak bodování. Vyřazené dostanou skóre 0 a důvod. */
export function vyhodnot(nabidka, cfg) {
  const n = { ...PRAZDNA_NABIDKA, ...nabidka };
  const b = brany(n, cfg);

  if (!b.prosel) {
    return {
      url: n.url,
      skore: 0,
      stitky: [],
      hodnoceni: { vyrazeno: true, duvod: b.duvod, brana: true, briefing_verze: cfg.briefing_verze },
    };
  }

  const v = skoruj(n, cfg);
  const st = [...v.stitky];
  if (b.nejiste) st.push('⚠ typ pozice neurčen');

  return {
    url: n.url,
    skore: v.skore,
    stitky: st,
    hodnoceni: {
      vyrazeno: false,
      raw: v.raw,
      pasmo: v.pasmo,
      polozky: v.polozky,
      briefing_verze: cfg.briefing_verze,
    },
  };
}
