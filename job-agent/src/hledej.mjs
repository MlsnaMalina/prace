/**
 * Hlavní běh. Dva režimy:
 *
 *   sber  — jen posbírá, co je nového, a uloží do fronty. Zadarmo, bez modelu.
 *           Běží každý den na pozadí, aby nic neuteklo mezi dvěma stisky tlačítka.
 *   plny  — posbírá a rovnou frontu vyhodnotí a zapíše. Tohle spouští tlačítko
 *           HLEDEJ PRÁCI v appce. Jediný režim, který stojí peníze.
 *
 * Pořadí kroků je navržené tak, aby se model volal až úplně na konci a jen na
 * to, co všechny bezplatné filtry přežilo:
 *
 *   1. výpis jobs.cz + kariérní stránky   → zadarmo
 *   2. odstranění duplicit proti databázi → zadarmo (sekce 9.1)
 *   3. platová brána ze štítku ve výpisu  → zadarmo (sekce 6, brána 1)
 *   4. stažení textu inzerátu             → zadarmo
 *   5. vytažení údajů z textu             → zadarmo
 *   6. posudek modelu                     → JEDINÝ placený krok
 *   7. bodování a zápis                   → zadarmo
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { vytahniInzeraty, odhadniPlatformu } from './extract.mjs';
import { adresaVypisu, vytahniKarty, pocetVysledku } from './jobscz.mjs';
import { stahniHtml, stahniText, pauza } from './stahni.mjs';
import { vytahniVse, platZeStitku } from './extrakce.mjs';
import { slozUryvek, bezDiakritiky } from './text.mjs';
import { posudInzerat, sluc, MODEL } from './model.mjs';
import { brany, skoruj, PRAZDNA_NABIDKA } from './scoring.mjs';
import { proAppku } from './hodnoceni-app.mjs';
import * as db from './supabase.mjs';

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VYCHOZI_DATA = path.join(KOREN, 'data');

const nactiJson = async (p, vychozi) => (existsSync(p) ? JSON.parse(await readFile(p, 'utf8')) : vychozi);
const ulozJson = (p, data) => writeFile(p, JSON.stringify(data, null, 2) + '\n');
const slug = (s) => bezDiakritiky(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const dnesISO = () => new Date().toISOString().slice(0, 10);

/** Kolik dní visí inzerát vypsaný daného dne. null = datum neznáme. */
function stariDny(vypsano) {
  if (!vypsano) return null;
  return Math.max(0, Math.round((Date.now() - new Date(vypsano).getTime()) / 86400000));
}

// ---------------------------------------------------------------- sběr

/** Výpis nabídek na jobs.cz. Nahrazuje e-mailové alerty (sekce 5.1). */
export async function sberJobsCz(zdroje, { log = () => {} } = {}) {
  const { lokality, klicova_slova, max_stranek } = zdroje.jobscz;
  const nalezene = new Map();
  const problemy = [];

  for (const lokalita of lokality) {
    for (const slovo of klicova_slova) {
      for (let stranka = 1; stranka <= max_stranek; stranka += 1) {
        const url = adresaVypisu(lokalita, slovo, stranka);
        const r = await stahniHtml(url);
        await pauza(zdroje.cesty.pauza_ms);

        if (!r.ok) {
          problemy.push({ kde: `jobs.cz ${lokalita}/${slovo} s.${stranka}`, http: r.http, chyba: r.chyba });
          break;
        }

        const karty = vytahniKarty(r.html);
        for (const k of karty) if (!nalezene.has(k.url)) nalezene.set(k.url, { ...k, zdroj: 'portal' });

        const celkem = pocetVysledku(r.html);
        log(`jobs.cz ${lokalita} / ${slovo} — strana ${stranka}: ${karty.length} (hlášeno ${celkem ?? '?'})`);
        if (!karty.length || (celkem != null && stranka * 30 >= celkem)) break;
      }
    }
  }

  return { nalezene: [...nalezene.values()], problemy };
}

/**
 * Kariérní stránky firem (sekce 5.2). Seznam se bere z tabulky `firmy`, ne ze
 * souboru — data/firmy.json se rozešlo s databází (64 firem a 8 URL proti
 * 80 a 79) a denní sběr kvůli tomu kontroloval osminu toho, co měl.
 */
export async function sberKarierni(firmy, zdroje, { dataDir = VYCHOZI_DATA, log = () => {} } = {}) {
  const snapshoty = path.join(dataDir, 'snapshots');
  await mkdir(snapshoty, { recursive: true });

  const nalezene = [];
  const zprava = [];

  for (const firma of firmy) {
    if (!firma.karierni_url) {
      zprava.push({ firma: firma.nazev, id: firma.id, stav: 'chybi_url' });
      continue;
    }

    const soubor = path.join(snapshoty, `${slug(firma.nazev)}.json`);
    const predchozi = await nactiJson(soubor, null);
    const r = await stahniHtml(firma.karierni_url);
    await pauza(zdroje.cesty.pauza_ms);

    if (!r.ok) {
      // Nenačtená stránka se zapíše a jde se dál. Obsah se nedohaduje (sekce 5.3, 10.3).
      zprava.push({ firma: firma.nazev, id: firma.id, stav: 'nenacteno', http: r.http, nacitani_funguje: false });
      continue;
    }

    const inzeraty = vytahniInzeraty(r.html, firma.karierni_url);
    const platforma = odhadniPlatformu(firma.karierni_url, r.html);

    await ulozJson(soubor, {
      firma: firma.nazev,
      karierni_url: firma.karierni_url,
      ats_platforma: platforma ?? firma.ats_platforma ?? null,
      porizeno: new Date().toISOString(),
      pocet: inzeraty.length,
      inzeraty,
    });

    const zname = new Set((predchozi?.inzeraty ?? []).map((i) => i.url));
    const pribylo = predchozi === null ? [] : inzeraty.filter((i) => !zname.has(i.url));

    for (const i of pribylo) {
      nalezene.push({
        url: i.url,
        pozice: i.nazev,
        firma: firma.nazev,
        lokalita: firma.lokalita ?? null,
        vypsano: null,
        stitky_portalu: [],
        zdroj: 'karierni_stranka',
      });
    }

    zprava.push({
      firma: firma.nazev,
      id: firma.id,
      stav: predchozi === null ? 'prvni_snapshot' : 'ok',
      pocet: inzeraty.length,
      pribylo: pribylo.length,
      ats_platforma: platforma,
      nacitani_funguje: inzeraty.length > 0,
    });
    log(`${firma.nazev}: ${inzeraty.length} pozic, z toho nových ${pribylo.length}`);
  }

  return { nalezene, zprava };
}

/** Hrubý filtr podle názvu — jen pro kariérní stránky, kde se sbírá všechno. */
export function zajimavyNazev(nazev, zdroje) {
  const b = bezDiakritiky(nazev ?? '');
  return zdroje.titulni_filtr.klicova_slova.some((k) => b.includes(bezDiakritiky(k)));
}

// ---------------------------------------------------- vyhodnocení jedné nabídky

/**
 * Jedna nabídka od stažení po hotový řádek do databáze.
 * Vrací { radek, posouzeno, naklady } nebo { chyba } — nikdy nevyhazuje, aby
 * jeden nepovedený inzerát nezastavil celý běh.
 */
export async function vyhodnotJednu(polozka, cfg, { klient, znameFirmy = new Set() } = {}) {
  const naklady = { vstup: 0, vystup: 0, cache: 0 };

  // Brána 1 se dá u velké části inzerátů rozhodnout ještě před stažením —
  // štítek s platem je přímo ve výpisu. Ušetří to stažení i posudek.
  const zeStitku = platZeStitku(polozka.stitky_portalu ?? []);
  if (zeStitku?.plat_uveden && zeStitku.plat_od < cfg.brany.plat_minimum) {
    return {
      radek: radekVyrazeny(polozka, `uvedený plat ${zeStitku.plat_od} Kč je pod hranicí ${cfg.brany.plat_minimum} Kč`, zeStitku),
      posouzeno: false,
      naklady,
    };
  }

  const stazeno = await stahniText(polozka.url);
  if (!stazeno.text) {
    return { chyba: `nenačteno (HTTP ${stazeno.http ?? '-'}): ${stazeno.chyba ?? 'prázdná stránka'}` };
  }

  const { pole, citace } = vytahniVse(stazeno.text, {
    firma: polozka.firma ?? '',
    stitkyPortalu: polozka.stitky_portalu ?? [],
  });

  let posudek;
  try {
    const v = await posudInzerat(
      { pozice: polozka.pozice, firma: polozka.firma, lokalita: polozka.lokalita, text: stazeno.text },
      { klient },
    );
    posudek = v.posudek;
    naklady.vstup = v.naklady?.input_tokens ?? 0;
    naklady.vystup = v.naklady?.output_tokens ?? 0;
    naklady.cache = v.naklady?.cache_read_input_tokens ?? 0;
  } catch (e) {
    return { chyba: `posudek selhal: ${String(e?.message ?? e)}` };
  }

  // Základ je PRAZDNA_NABIDKA, ne prázdný objekt — jinak by chybějící pole byla
  // undefined a bodování by se spoléhalo na to, že se undefined chová jako false.
  const { pole: uplne, doplnene } = sluc({ ...PRAZDNA_NABIDKA, ...pole }, posudek);
  uplne.url = polozka.url;
  uplne.firma = polozka.firma;
  uplne.inzerat_stari_dny = stariDny(polozka.vypsano);
  // +5 podle sekce 7: firma ze vzorku nebo odpovídající vzorci. V tabulce `firmy`
  // je firma právě tehdy, když vzorcem ze sekce 5.2 prošla.
  uplne.firma_ze_vzorku = znameFirmy.has(bezDiakritiky(polozka.firma ?? ''));

  const b = brany(uplne, cfg);
  if (!b.prosel) {
    return { radek: radekVyrazeny(polozka, b.duvod, uplne, citace), posouzeno: true, naklady };
  }

  const v = skoruj(uplne, cfg);
  const stitky = [...v.stitky];
  if (b.nejiste) stitky.push('⚠ typ pozice neurčen');
  if (stazeno.zdroj === 'chrome') stitky.push('ℹ text inzerátu získán vykreslením stránky');

  return {
    radek: {
      url: polozka.url,
      nalezeno_dne: dnesISO(),
      zdroj: polozka.zdroj === 'portal' ? 'portal' : polozka.zdroj,
      pozice: polozka.pozice,
      firma: polozka.firma,
      lokalita: polozka.lokalita ?? null,
      adresa: uplne.adresa ?? null,
      skore: v.skore,
      hodnoceni: proAppku(uplne, v.polozky),
      stitky,
      plat_od: uplne.plat_od ?? null,
      plat_do: uplne.plat_do ?? null,
      plat_uveden: uplne.plat_uveden === true,
      home_office_dny: uplne.home_office_dny ?? null,
      pruzna_doba: uplne.pruzna_doba ?? null,
      pracovni_cesty: uplne.pracovni_cesty ?? 'neuvedeno',
      inzerat_uryvek: slozUryvek({
        ...citace,
        ...(Object.keys(doplnene).length ? { 'DOPLNĚNO MODELEM': Object.values(doplnene) } : {}),
        POSUDEK: [posudek.duvod ?? ''],
      }).slice(0, 4000),
    },
    posouzeno: true,
    naklady,
    pasmo: v.pasmo,
  };
}

/** Vyřazený inzerát se zapisuje se zdůvodněním, nemizí beze stopy (sekce 6). */
function radekVyrazeny(polozka, duvod, pole = {}, citace = null) {
  return {
    url: polozka.url,
    nalezeno_dne: dnesISO(),
    zdroj: polozka.zdroj === 'portal' ? 'portal' : polozka.zdroj,
    pozice: polozka.pozice,
    firma: polozka.firma,
    lokalita: polozka.lokalita ?? null,
    adresa: pole.adresa ?? null,
    skore: 0,
    hodnoceni: [
      { kriterium: 'Home office', stav: 'stejne', srazka: 0, poznamka: 'Nebodováno — inzerát vyřazen branou.' },
      { kriterium: 'Pružná doba', stav: 'stejne', srazka: 0, poznamka: 'Nebodováno — inzerát vyřazen branou.' },
      { kriterium: 'Plat', stav: 'stejne', srazka: 0, poznamka: `Vyřazeno: ${duvod}` },
      { kriterium: 'Náplň práce', stav: 'stejne', srazka: 0, poznamka: `Vyřazeno: ${duvod}` },
      { kriterium: 'Seniorita a tým', stav: 'stejne', srazka: 0, poznamka: 'Nebodováno — inzerát vyřazen branou.' },
      { kriterium: 'Dojezd', stav: 'stejne', srazka: 0, poznamka: 'Nebodováno — inzerát vyřazen branou.' },
    ],
    stitky: ['⚠ vyřazeno branou'],
    plat_od: pole.plat_od ?? null,
    plat_do: pole.plat_do ?? null,
    plat_uveden: pole.plat_uveden === true,
    home_office_dny: pole.home_office_dny ?? null,
    pruzna_doba: pole.pruzna_doba ?? null,
    pracovni_cesty: pole.pracovni_cesty ?? 'neuvedeno',
    inzerat_uryvek: citace ? slozUryvek({ ...citace, 'DŮVOD VYŘAZENÍ': [duvod] }).slice(0, 4000) : `DŮVOD VYŘAZENÍ: ${duvod}`,
  };
}

// ---------------------------------------------------------------- celý běh

export async function hledej({
  rezim = 'plny',
  zdroj = 'tlacitko',
  githubRunId = null,
  dataDir = VYCHOZI_DATA,
  log = console.log,
} = {}) {
  const cfg = JSON.parse(await readFile(path.join(KOREN, 'config.json'), 'utf8'));
  const zdroje = JSON.parse(await readFile(path.join(KOREN, 'zdroje.json'), 'utf8'));
  const frontaSoubor = path.join(dataDir, 'fronta.json');

  const beh = await db.zalozBeh({ zdroj, github_run_id: githubRunId });
  const staty = { nalezeno: 0, novych: 0, vyhodnoceno: 0, zapsano: 0, k_reakci: 0, zbyva: 0 };
  const problemy = [];

  try {
    // 1. sběr
    const firmy = await db.nactiFirmy();
    log(`Firem ke sledování: ${firmy.length}`);

    const portal = await sberJobsCz(zdroje, { log });
    const kariera = await sberKarierni(firmy, zdroje, { dataDir, log });
    problemy.push(...portal.problemy);

    const vse = [
      ...portal.nalezene,
      ...kariera.nalezene.filter((i) => zajimavyNazev(i.pozice, zdroje)),
    ];
    staty.nalezeno = vse.length;

    // 2. duplicity proti databázi i proti sobě navzájem
    const podleUrl = new Map(vse.map((i) => [i.url, i]));
    const zname = await db.jizZname([...podleUrl.keys()]);
    const fronta = await nactiJson(frontaSoubor, []);
    const veFronte = new Set(fronta.map((i) => i.url));

    for (const [url, polozka] of podleUrl) {
      if (zname.has(url) || veFronte.has(url)) continue;
      fronta.push(polozka);
      veFronte.add(url);
    }
    staty.novych = fronta.length;
    staty.zbyva = fronta.length;
    await ulozJson(frontaSoubor, fronta);
    log(`Nalezeno ${staty.nalezeno}, ve frontě k vyhodnocení ${fronta.length}`);

    // technické sloupce firem
    for (const z of kariera.zprava) {
      if (!z.id) continue;
      await db.aktualizujFirmu(z.id, {
        posledni_kontrola: new Date().toISOString(),
        nacitani_funguje: z.nacitani_funguje ?? null,
        ats_platforma: z.ats_platforma ?? undefined,
      }).catch((e) => problemy.push({ kde: `firma ${z.firma}`, chyba: String(e.message) }));
    }

    if (rezim === 'sber') {
      await db.dokonciBeh(beh.id, { stav: 'hotovo', ...staty, poznamka: shrnProblemy(problemy) });
      return { beh, staty, fronta: fronta.length, problemy };
    }

    // 3.–7. vyhodnocení fronty
    const limit = zdroje.limity.max_posudku_na_beh;
    const kzpracovani = fronta.slice(0, limit);
    const zbytek = fronta.slice(limit);
    const radky = [];
    const neuspesne = [];
    const naklady = { vstup: 0, vystup: 0, cache: 0 };

    const znameFirmy = new Set(firmy.map((f) => bezDiakritiky(f.nazev)));

    for (const polozka of kzpracovani) {
      const v = await vyhodnotJednu(polozka, cfg, { znameFirmy });
      await pauza(zdroje.cesty.pauza_detail_ms);

      if (v.chyba) {
        // Nepovedlo se — zůstává ve frontě na příště. Radši znovu než ztratit.
        neuspesne.push({ ...polozka, posledni_chyba: v.chyba });
        problemy.push({ kde: polozka.url, chyba: v.chyba });
        continue;
      }

      radky.push(v.radek);
      if (v.posouzeno) staty.vyhodnoceno += 1;
      if (v.pasmo === 'reagovat') staty.k_reakci += 1;
      naklady.vstup += v.naklady.vstup;
      naklady.vystup += v.naklady.vystup;
      naklady.cache += v.naklady.cache;
      log(`  ${v.radek.skore} b. — ${v.radek.pozice} (${v.radek.firma})`);
    }

    const zapsane = await db.zapisNabidky(radky);
    staty.zapsano = Array.isArray(zapsane) ? zapsane.length : radky.length;
    staty.zbyva = neuspesne.length + zbytek.length;

    await ulozJson(frontaSoubor, [...neuspesne, ...zbytek]);
    await db.dokonciBeh(beh.id, {
      stav: 'hotovo',
      ...staty,
      poznamka: [
        `model ${MODEL}: ${naklady.vstup} vstupních, ${naklady.vystup} výstupních tokenů`,
        shrnProblemy(problemy),
      ].filter(Boolean).join(' | ').slice(0, 2000),
    });

    return { beh, staty, naklady, problemy };
  } catch (e) {
    await db.dokonciBeh(beh?.id, { stav: 'chyba', ...staty, chyba: String(e?.message ?? e).slice(0, 1000) })
      .catch(() => {});
    throw e;
  }
}

function shrnProblemy(problemy) {
  if (!problemy.length) return null;
  return `${problemy.length} problémů: ${problemy.slice(0, 5).map((p) => `${p.kde}: ${p.chyba ?? p.http}`).join('; ')}`;
}

// ---------------------------------------------------------------- spuštění

if (process.argv[1]?.endsWith('hledej.mjs')) {
  // Přepínač, ne proměnná prostředí — `REZIM=sber node …` je POSIX zápis,
  // který na Windows v PowerShellu nefunguje a ladí se to pak blbě.
  const rezim = process.argv.includes('--sber') ? 'sber' : 'plny';
  const v = await hledej({
    rezim,
    zdroj: rezim === 'sber' ? 'plan' : 'tlacitko',
    githubRunId: process.env.GITHUB_RUN_ID ?? null,
  });
  console.log(`\nRežim ${rezim}: nalezeno ${v.staty.nalezeno}, nových ${v.staty.novych}, zapsáno ${v.staty.zapsano}, k reakci ${v.staty.k_reakci}`);
  if (v.problemy?.length) {
    console.log('\nProblémy:');
    for (const p of v.problemy.slice(0, 20)) console.log(`  - ${p.kde}: ${p.chyba ?? p.http}`);
  }
}
