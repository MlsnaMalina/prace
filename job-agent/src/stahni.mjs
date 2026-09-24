/**
 * Stahování stránek. Dvě úrovně, obě zadarmo a bez modelu.
 *
 *   1. Obyčejný fetch. Zvládne asi polovinu inzerátů na jobs.cz.
 *   2. Když je výsledek podezřele krátký, dokreslí stránku Chrome v headless
 *      režimu (`--dump-dom`). Druhá polovina inzerátů sedí na firemních
 *      mikrostránkách typu siemens.jobs.cz, které obsah vykreslují JavaScriptem.
 *
 * Proč zrovna Chrome a ne Playwright: GitHub runner ubuntu-latest má Chrome
 * předinstalovaný, takže `job-agent` zůstává úplně bez npm závislostí — tak,
 * jak to má v package.json popsané od začátku.
 *
 * Bez druhé úrovně dostal Siemens skóre 40 jen proto, že se text nenačetl
 * a home office se bodoval jako neuvedený. Přesně takhle utíkaly dobré nabídky.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { naText } from './text.mjs';

export const UA = 'job-agent/2.0 (osobni hledani prace; kontakt v repozitari https://github.com/MlsnaMalina/prace)';

const TIMEOUT_MS = 20000;
const CHROME_TIMEOUT_MS = 45000;

/** Pod touhle délkou textu se předpokládá, že stránku vykresluje JavaScript. */
export const PRAH_KRATKEHO_TEXTU = 2500;

export const pauza = (ms) => new Promise((r) => setTimeout(r, ms));

/** Obyčejné stažení. Nikdy nevyhazuje — chyba je návratová hodnota. */
export async function stahniHtml(url, { timeout = TIMEOUT_MS } = {}) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeout);
  try {
    const odpoved = await fetch(url, {
      signal: ac.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'cs,en;q=0.8',
      },
    });
    const html = odpoved.ok ? await odpoved.text() : '';
    return { ok: odpoved.ok, http: odpoved.status, url: odpoved.url, html, chyba: null };
  } catch (e) {
    return { ok: false, http: null, url, html: '', chyba: String(e?.message ?? e) };
  } finally {
    clearTimeout(t);
  }
}

const KANDIDATI_CHROME = [
  process.env.CHROME_PATH,
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].filter(Boolean);

let chromeCache;

/**
 * Kandidáti na spustitelný Chrome, v pořadí. Cesty se ověří na disku, holé
 * názvy nechá vyřešit PATH — jestli tam opravdu jsou, se pozná až pokusem
 * o spuštění, proto se první úspěšný zapamatuje.
 */
export function kandidatiChrome() {
  if (chromeCache) return [chromeCache];
  return KANDIDATI_CHROME.filter((k) => !(k.includes('/') || k.includes('\\')) || existsSync(k));
}

/** Vykreslí stránku Chrome a vrátí hotové DOM. null = nepovedlo se. */
export async function vykresli(url, { timeout = CHROME_TIMEOUT_MS } = {}) {
  for (const chrome of kandidatiChrome()) {
    const dom = await spustChrome(chrome, url, timeout);
    if (dom) {
      chromeCache = chrome;
      return dom;
    }
  }
  return null;
}

async function spustChrome(chrome, url, timeout) {
  const profil = await mkdtemp(path.join(tmpdir(), 'job-agent-chrome-'));
  try {
    return await new Promise((resolve) => {
      const p = spawn(chrome, [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--dump-dom',
        '--virtual-time-budget=10000',
        `--user-agent=${UA}`,
        `--user-data-dir=${profil}`,
        url,
      ], { stdio: ['ignore', 'pipe', 'ignore'] });

      let out = '';
      const casovac = setTimeout(() => p.kill('SIGKILL'), timeout);

      p.stdout.on('data', (d) => { out += d; });
      p.on('error', () => { clearTimeout(casovac); resolve(null); });
      p.on('close', () => { clearTimeout(casovac); resolve(out.length > 200 ? out : null); });
    });
  } finally {
    await rm(profil, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Text inzerátu. Vrací { text, zdroj: 'fetch'|'chrome', http, chyba }.
 * `zdroj` se propisuje do hlášení o běhu, ať je vidět, kolik stránek potřebuje
 * vykreslení — podle toho půjde poznat, kdyby druhá úroveň přestala fungovat.
 */
export async function stahniText(url) {
  const r = await stahniHtml(url);
  if (!r.ok) return { text: '', zdroj: 'fetch', http: r.http, chyba: r.chyba, konecnaUrl: r.url };

  const text = naText(r.html);
  if (text.length >= PRAH_KRATKEHO_TEXTU) {
    return { text, zdroj: 'fetch', http: r.http, chyba: null, konecnaUrl: r.url };
  }

  const dom = await vykresli(r.url);
  if (!dom) return { text, zdroj: 'fetch', http: r.http, chyba: 'kratky text, vykresleni se nepovedlo', konecnaUrl: r.url };

  const vykreslenyText = naText(dom);
  return vykreslenyText.length > text.length
    ? { text: vykreslenyText, zdroj: 'chrome', http: r.http, chyba: null, konecnaUrl: r.url }
    : { text, zdroj: 'fetch', http: r.http, chyba: null, konecnaUrl: r.url };
}
