/**
 * Diagnostika, ne sběr. Spustí se jednou ručně (nebo v Actions přes workflow_dispatch)
 * a řekne, co která kariérní stránka skutečně vrací.
 *
 * Existuje kvůli otevřené položce ze sekce 13 briefingu: "Kariérní stránky přes
 * Workday, SmartRecruiters a Teamio — neověřeno, jestli se dají načíst."
 * Obecný extraktor je záměrně hloupý; teprve podle výstupu probe se dá rozhodnout,
 * pro které platformy se vyplatí napsat pořádný adaptér.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { vytahniInzeraty, odhadniPlatformu } from './extract.mjs';

const KOREN = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DATA = path.join(KOREN, 'data');
const VZORKY = path.join(DATA, 'probe');

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

const firmy = JSON.parse(await readFile(path.join(DATA, 'firmy.json'), 'utf8'));
const vybrane = process.argv[2]
  ? firmy.filter((f) => f.nazev.toLowerCase().includes(process.argv[2].toLowerCase()))
  : firmy.filter((f) => f.karierni_url);

await mkdir(VZORKY, { recursive: true });
const zprava = [];

for (const f of vybrane) {
  process.stdout.write(`${f.nazev} ... `);
  let radek = { firma: f.nazev, url: f.karierni_url };

  try {
    const o = await fetch(f.karierni_url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'job-agent/1.0 (probe)', 'Accept-Language': 'cs,en;q=0.8' },
      signal: AbortSignal.timeout(20000),
    });
    const html = await o.text();
    const inzeraty = vytahniInzeraty(html, f.karierni_url);

    radek = {
      ...radek,
      http: o.status,
      velikost_kb: Math.round(html.length / 1024),
      platforma: odhadniPlatformu(f.karierni_url, html),
      nalezeno_odkazu: inzeraty.length,
      // Když je stránka velká, ale odkazů nula, je skoro jistě vykreslená JavaScriptem
      // a potřebuje buď JSON endpoint, nebo headless prohlížeč.
      podezreni_na_js: html.length > 50000 && inzeraty.length === 0,
      ukazka: inzeraty.slice(0, 3).map((i) => i.nazev),
    };

    await writeFile(path.join(VZORKY, `${slug(f.nazev)}.html`), html);
    console.log(`HTTP ${o.status}, ${radek.nalezeno_odkazu} odkazů${radek.podezreni_na_js ? ', PODEZŘENÍ NA JS' : ''}`);
  } catch (e) {
    radek = { ...radek, chyba: String(e.message || e) };
    console.log(`CHYBA: ${radek.chyba}`);
  }

  zprava.push(radek);
  await new Promise((r) => setTimeout(r, 1500));
}

await writeFile(path.join(DATA, 'probe-vysledek.json'), JSON.stringify(zprava, null, 2) + '\n');

const ok = zprava.filter((z) => z.nalezeno_odkazu > 0).length;
const js = zprava.filter((z) => z.podezreni_na_js).length;
const chyby = zprava.filter((z) => z.chyba || (z.http && z.http >= 400)).length;

console.log(`\n${ok}/${zprava.length} stránek dalo odkazy obecným extraktorem.`);
console.log(`${js} vypadá na vykreslení JavaScriptem (potřebují adaptér).`);
console.log(`${chyby} se nenačetlo vůbec.`);
console.log(`Detail: data/probe-vysledek.json, syrové HTML v data/probe/`);
