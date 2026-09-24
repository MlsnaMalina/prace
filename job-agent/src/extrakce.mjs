/**
 * Vytažení údajů z textu inzerátu. Čisté funkce, žádná síť, žádný model.
 *
 * Tohle je ta část, která dřív stála tokeny. Všechno, co jde poznat ze vzoru
 * v textu, se pozná tady zadarmo. Modelu (viz model.mjs) zůstávají jen tři
 * pole, která jsou skutečně úsudkem: je_financni_pozice, naplne_prace, seniorita.
 *
 * Dvě pravidla, která platí všude v tomhle souboru:
 *   1. Nenajde-li se údaj, vrací se null nebo false — NIKDY odhad (sekce 10.3).
 *   2. Ke každému nalezenému údaji se vrací doslovná citace (sekce 10.2).
 */

import { najdiVety, bezDiakritiky } from './text.mjs';

const V = {
  plat: [/\b\d{2}[\s.,]?\d{3}\s*(?:–|-|až)?[^.]{0,20}K[čc]/i, /\bmzd|\bplat|\bodm[ěe]n|\bsalary|\bK[čc]\s*\/\s*m[ěe]s/i],
  homeOffice: [/home\s*-?\s*office/i, /pr[áa]c[ei]\s+z\s+domova/i, /\bremote\b/i, /hybridn[íi]/i, /z\s+domov[ау]/i],
  pruznaDoba: [/pru[žz]n[áa]\s+(?:pracovn[íi]\s+)?doba/i, /flexibiln[íi]\s+(?:pracovn[íi]\s+)?dob/i, /klouzav[áa]\s+(?:pracovn[íi]\s+)?doba/i, /pru[žz]nou\s+pracovn[íi]\s+dobu/i],
  cesty: [/slu[žz]ebn\S*\s+cest/i, /pracovn\S*\s+cest/i, /cestov[áa]n[íi]/i],
  adresa: [/m[íi]sto\s+v[ýy]konu\s+pr[áa]ce/i, /pracovi[šs]t[ěe]/i, /adresa/i],
};

// Věta o penězích nemusí být věta o platu. „Minimálně 34 000 Kč ročně na nákup
// benefitů" je rozpočet na cafeterii — vzato jako plat by inzerát propadl první
// bránou (sekce 6) jako podlimitní. Doloženo na skutečném inzerátu Siemensu.
const NENI_PLAT = /benefit|cafeteri|cafeteri|p[řr][íi]sp[ěe]v|strav|flexi\s*pass|multisport|penzijn|[žz]ivotn[íi]\s+pojist|dovolen|ro[čc]n[ěe]|za\s+rok|ro[čc]n[íi]\s+bonus/i;
const JE_PLAT = /\bmzd|\bplat\b|\bplatu|\bplatov|ohodnocen|salary|m[ěe]s[íi][čc]n|\/\s*m[ěe]s|nab[íi]z[íi]me\s+(?:a[žz]\s+)?\d/i;

/** Plat ze štítku ve výpisu („60 000 – 70 000 Kč"). Nejspolehlivější zdroj. */
export function platZeStitku(stitky = []) {
  for (const s of stitky) {
    if (!/K[čc]/.test(s)) continue;
    const cisla = [...String(s).replace(/ /g, ' ').matchAll(/\b(\d{2,3})[\s.](\d{3})\b|\b(\d{5,6})\b/g)]
      .map((m) => Number(m[3] ?? `${m[1]}${m[2]}`))
      .filter((c) => c >= 15000 && c <= 400000)
      .sort((a, b) => a - b);
    if (cisla.length) {
      return { plat_uveden: true, plat_od: cisla[0], plat_do: cisla.length > 1 ? cisla[cisla.length - 1] : null, citace: [s] };
    }
  }
  return null;
}

/** „60 000 – 80 000 Kč" i „od 55 000 Kč" i „80 tis. Kč". Vrací {od, do} v Kč. */
export function platZTextu(text, { stitkyPortalu = [] } = {}) {
  const zeStitku = platZeStitku(stitkyPortalu);
  if (zeStitku) return zeStitku;

  const vsechny = najdiVety(text, V.plat, { max: 6 });
  // Věty o benefitech se zahodí; ze zbytku mají přednost ty, které o platu
  // mluví výslovně. Když žádná taková není, plat se považuje za neuvedený —
  // radši štítek „plat neuveden" než špatné číslo.
  const citace = vsechny.filter((v) => !NENI_PLAT.test(v) && JE_PLAT.test(v)).slice(0, 2);
  if (!citace.length) return { plat_uveden: false, plat_od: null, plat_do: null, citace: [] };

  const cisla = [];
  for (const veta of citace) {
    const hrubá = veta.replace(/ /g, ' ');

    // „80 tis." / „80 tisíc"
    for (const m of hrubá.matchAll(/(\d{2,3})\s*tis(?:\.|[íi]c\w*)?/gi)) {
      cisla.push(Number(m[1]) * 1000);
    }
    // „60 000", „60.000", „60000"
    for (const m of hrubá.matchAll(/\b(\d{2,3})[\s.](\d{3})\b|\b(\d{5,6})\b/g)) {
      cisla.push(Number(m[3] ?? `${m[1]}${m[2]}`));
    }
  }

  // Platem může být jen částka v rozumném měsíčním rozsahu. Ostatní čísla
  // (IČO, PSČ, rok založení) se takhle odfiltrují samy.
  const platy = [...new Set(cisla)].filter((c) => c >= 15000 && c <= 400000).sort((a, b) => a - b);
  if (!platy.length) return { plat_uveden: false, plat_od: null, plat_do: null, citace };

  return {
    plat_uveden: true,
    plat_od: platy[0],
    plat_do: platy.length > 1 ? platy[platy.length - 1] : null,
    citace,
  };
}

/** Počet dní home officu TÝDNĚ, 0–5. null = v inzerátu není číslo. */
export function homeOfficeZTextu(text) {
  const citace = najdiVety(text, V.homeOffice, { max: 3 });
  if (!citace.length) return { home_office_dny: null, ho_az_po_zapracovani: false, citace: [] };

  const spojene = citace.join(' ');
  const b = bezDiakritiky(spojene);
  const ho_az_po_zapracovani = /po\s+zapracovani|po\s+zkusebni|po\s+ukonceni\s+zkusebni|az\s+po\s+zauceni/.test(b);

  let dny = null;
  const cislo = (s) => ({ jeden: 1, jednoho: 1, dva: 2, dvou: 2, tri: 3, trech: 3, ctyri: 4, ctyr: 4, pet: 5 })[s] ?? Number(s);

  // „2 dny v týdnu", „až 3 dny týdně", „dva dny z domova"
  let m = b.match(/(\d|jeden|jednoho|dva|dvou|tri|trech|ctyri|ctyr|pet)\s*(?:dny|dnu|den|dni|dnech)\s*(?:v\s*)?(tydnu|tydne|mesici|mesicne)?/);
  if (m) {
    const n = cislo(m[1]);
    // „4 dny v měsíci" není 4 dny týdně — přepočet na týden, zaokrouhleno dolů.
    dny = /mesic/.test(m[2] ?? '') ? Math.floor(n / 4) : n;
  }

  // Procentní zápis („50 % home office")
  if (dny == null && (m = b.match(/(\d{2,3})\s*%/))) {
    dny = Math.round((Number(m[1]) / 100) * 5);
  }

  // Plně vzdálená práce
  if (dny == null && /plne\s+vzdalen|100\s*%|zcela\s+z\s+domova|fully\s+remote/.test(b)) dny = 5;

  // Výslovné odmítnutí
  if (dny == null && /bez\s+moznosti\s+(?:home|prace\s+z\s+domova)|home\s*office\s+neni|pouze\s+z\s+kancelare/.test(b)) dny = 0;

  if (dny != null) dny = Math.max(0, Math.min(5, dny));
  return { home_office_dny: dny, ho_az_po_zapracovani, citace };
}

/** Sekce 7: pružná doba se boduje jen podle toho, jestli je v inzerátu ZMÍNĚNÁ. */
export function pruznaDobaZTextu(text) {
  const citace = najdiVety(text, V.pruznaDoba, { max: 2 });
  return { pruzna_doba: citace.length > 0 ? true : null, citace };
}

/** 'zadne' | 'bez_prespani' | 's_prespanim' | 'opakovane' | 'neuvedeno' */
export function cestyZTextu(text) {
  const citace = najdiVety(text, V.cesty, { max: 2 });
  if (!citace.length) return { pracovni_cesty: 'neuvedeno', citace: [] };

  const b = bezDiakritiky(citace.join(' '));
  if (/bez\s+(?:sluzebnich\s+)?cest|zadne\s+(?:sluzebni\s+)?cest|cestovani\s+neni/.test(b)) {
    return { pracovni_cesty: 'zadne', citace };
  }
  if (/pravidel|casté|caste|opakovan|mesicne|tydne\s+cest/.test(b)) {
    return { pracovni_cesty: 'opakovane', citace };
  }
  if (/prespan|vicedenn|nocleh|zahranic|nekolikadenn/.test(b)) {
    return { pracovni_cesty: 's_prespanim', citace };
  }
  return { pracovni_cesty: 'bez_prespani', citace };
}

/** Adresa pracoviště — jen když je v textu výslovně uvedená. */
export function adresaZTextu(text) {
  const citace = najdiVety(text, V.adresa, { max: 1, delka: 160 });
  if (!citace.length) return { adresa: null, citace: [] };
  const m = citace[0].match(/(?:pr[áa]ce|pracovi[šs]t[ěe]|adresa)\s*:?\s*(.{5,120})$/i);
  return { adresa: m ? m[1].trim() : citace[0], citace };
}

/** Příznaky pro štítky a přirážky (sekce 7 a 8). Jen jednoznačné vzory. */
export function priznakyZTextu(text, { firma = '' } = {}) {
  const b = bezDiakritiky(text);
  const bf = bezDiakritiky(firma);

  return {
    zminuje_procesy_automatizaci_bi:
      /automatizac|nastaven[íi]\s+proces|zmen[ay]\s+proces|optimalizac[ei]\s+proces|power\s*bi|\bbi\s+n[áa]stroj|digitalizac/.test(bezDiakritiky(text)) ||
      /power\s*bi|tableau|qlik|digitalizace\s+financ/.test(b),
    vedeni_tymu: /vedeni\s+tymu|povedete\s+tym|rizeni\s+tymu|team\s*lead|vede\s+tym|podrizen/.test(b) ? true : null,
    vypsano_agenturou:
      /personaln[íi]\s+agentur|recruitment\s+agency|na[šs]eho\s+klienta|pro\s+na[šs]eho\s+klienta|hled[áa]me\s+pro\s+klienta/.test(b) ||
      /grafton|hays|manpower|randstad|adecco|reed|robert\s*half|talentor|predictive/.test(bf),
    teambuilding_v_benefitech: /teambuilding|firemn[íi]\s+akc|firemn[íi]\s+ve[čc][íi]rek/.test(b),
  };
}

/** Všechno dohromady. Vrací pole pro scoring.mjs + doslovné citace pro úryvek. */
export function vytahniVse(text, { firma = '', stitkyPortalu = [] } = {}) {
  const plat = platZTextu(text, { stitkyPortalu });
  const ho = homeOfficeZTextu(text);
  const pd = pruznaDobaZTextu(text);
  const ce = cestyZTextu(text);
  const ad = adresaZTextu(text);
  const pr = priznakyZTextu(text, { firma });

  return {
    pole: {
      plat_uveden: plat.plat_uveden,
      plat_od: plat.plat_od,
      plat_do: plat.plat_do,
      home_office_dny: ho.home_office_dny,
      pruzna_doba: pd.pruzna_doba,
      pracovni_cesty: ce.pracovni_cesty,
      adresa: ad.adresa,
      ho_az_po_zapracovani: ho.ho_az_po_zapracovani,
      ...pr,
    },
    citace: {
      PLAT: plat.citace,
      'HOME OFFICE': ho.citace,
      'PRACOVNÍ DOBA': pd.citace,
      CESTY: ce.citace,
      ADRESA: ad.citace,
    },
  };
}
