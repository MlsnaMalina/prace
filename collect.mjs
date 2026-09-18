/**
 * Denní sběr. Běží v GitHub Actions, netýká se Supabase a nestojí žádné tokeny.
 *
 *   1. načte seznam firem (data/firmy.json)
 *   2. stáhne kariérní stránku každé firmy
 *   3. vytáhne odkazy na inzeráty
 *   4. uloží snapshot na firmu do data/snapshots/
 *   5. porovná s předchozím snapshotem a zapíše data/nove.json
 *
 * Agent pak čte JEN data/nove.json. Když je prázdný, nemá co dělat a skončí.
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { vytahniInzeraty, odhadniPlatformu } from './extract.mjs';

const KOREN = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const VYCHOZI_DATA = path.join(KOREN, 'data');

const PAUZA_MS = 1500;   // slušnost k cizím serverům
const TIMEOUT_MS = 20000;

const pauza = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

async function stahni(url) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const odpoved = await fetch(url, {
      signal: ac.signal,
      redirect: 'follow',
      headers: {
        // Slušné a pravdivé představení. Žádné obcházení ochran (sekce 5.3).
        'User-Agent': 'job-agent/1.0 (osobni hledani prace; kontakt v repozitari)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'cs,en;q=0.8',
      },
    });
    if (!odpoved.ok) return { ok: false, stav: odpoved.status, html: '' };
    return { ok: true, stav: odpoved.status, html: await odpoved.text() };
  } catch (e) {
    return { ok: false, stav: null, chyba: String(e.message || e), html: '' };
  } finally {
    clearTimeout(t);
  }
}

async function nactiPredchozi(snapshoty, souborovyNazev) {
  const p = path.join(snapshoty, souborovyNazev);
  if (!existsSync(p)) return null;
  try { return JSON.parse(await readFile(p, 'utf8')); } catch { return null; }
}

/**
 * @param {{ dataDir?: string }} volby  dataDir se dá přesměrovat v testech,
 *   aby testovací běh nikdy nesáhl na skutečné data/firmy.json.
 */
export async function sber({ dataDir = VYCHOZI_DATA } = {}) {
  const DATA = dataDir;
  const SNAPSHOTY = path.join(DATA, 'snapshots');
  await mkdir(SNAPSHOTY, { recursive: true });

  const firmy = JSON.parse(await readFile(path.join(DATA, 'firmy.json'), 'utf8'));
  const kSledovani = firmy.filter((f) => f.stav === 'navrzeno' || f.stav === 'schvaleno');

  const nove = [];
  const zpravaOBehu = [];

  for (const firma of kSledovani) {
    if (!firma.karierni_url) {
      zpravaOBehu.push({ firma: firma.nazev, stav: 'chybi_url', nacitani_funguje: null });
      continue;
    }

    const soubor = `${slug(firma.nazev)}.json`;
    const predchozi = await nactiPredchozi(SNAPSHOTY, soubor);
    const vysledek = await stahni(firma.karierni_url);
    await pauza(PAUZA_MS);

    if (!vysledek.ok) {
      // Nenačtená stránka se zapíše a jde se dál. Obsah se nedohaduje (sekce 5.3, 10.3).
      zpravaOBehu.push({
        firma: firma.nazev,
        stav: 'nenacteno',
        http: vysledek.stav,
        chyba: vysledek.chyba ?? null,
        nacitani_funguje: false,
      });
      continue;
    }

    const inzeraty = vytahniInzeraty(vysledek.html, firma.karierni_url);
    const platforma = odhadniPlatformu(firma.karierni_url, vysledek.html);

    const snapshot = {
      firma: firma.nazev,
      karierni_url: firma.karierni_url,
      ats_platforma: platforma ?? firma.ats_platforma ?? null,
      porizeno: new Date().toISOString(),
      pocet: inzeraty.length,
      inzeraty,
    };
    await writeFile(path.join(SNAPSHOTY, soubor), JSON.stringify(snapshot, null, 2) + '\n');

    const znameUrl = new Set((predchozi?.inzeraty ?? []).map((i) => i.url));
    const pribylo = predchozi === null ? [] : inzeraty.filter((i) => !znameUrl.has(i.url));

    for (const i of pribylo) {
      nove.push({ firma: firma.nazev, lokalita: firma.lokalita ?? null, zdroj: 'karierni_stranka', ...i });
    }

    zpravaOBehu.push({
      firma: firma.nazev,
      stav: predchozi === null ? 'prvni_snapshot' : 'ok',
      pocet: inzeraty.length,
      pribylo: pribylo.length,
      ats_platforma: platforma,
      nacitani_funguje: inzeraty.length > 0,
    });
  }

  await writeFile(
    path.join(DATA, 'nove.json'),
    JSON.stringify({ vygenerovano: new Date().toISOString(), pocet: nove.length, inzeraty: nove }, null, 2) + '\n',
  );
  await writeFile(
    path.join(DATA, 'posledni-beh.json'),
    JSON.stringify({ kdy: new Date().toISOString(), firem: kSledovani.length, novych: nove.length, firmy: zpravaOBehu }, null, 2) + '\n',
  );

  return { novych: nove.length, firem: kSledovani.length, zprava: zpravaOBehu };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const v = await sber();
  console.log(`Firem: ${v.firem}   Nových inzerátů: ${v.novych}`);
  const problemy = v.zprava.filter((z) => z.stav === 'nenacteno' || z.stav === 'chybi_url' || z.nacitani_funguje === false);
  if (problemy.length) {
    console.log('\nProblémy:');
    for (const p of problemy) console.log(`  - ${p.firma}: ${p.stav}${p.http ? ` (HTTP ${p.http})` : ''}`);
  }
}
