import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, rm, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { vytahniInzeraty, odhadniPlatformu } from '../src/extract.mjs';

// Testy si drží vlastní dočasnou složku. Skutečné data/firmy.json se nikdy nedotknou —
// jinak by pád testu uprostřed mohl nechat v repozitáři zkrácený seznam firem.
let DATA;

const STRANKA_V1 = `
<html><body>
  <a href="/o-nas">O nás</a>
  <a href="/detail/?id=101">Finanční controller</a>
  <a href="/detail/?id=102">Skladník</a>
  <a href="/prospekt.pdf">Leták</a>
  <a href="https://facebook.com/firma">Facebook</a>
</body></html>`;

const STRANKA_V2 = STRANKA_V1.replace(
  '<a href="/detail/?id=102">Skladník</a>',
  '<a href="/detail/?id=102">Skladník</a>\n  <a href="/detail/?id=103">Senior finanční analytik</a>',
);

// ---------- extrakce ----------

test('vytáhne jen odkazy, které vypadají jako detail pozice', () => {
  const i = vytahniInzeraty(STRANKA_V1, 'https://firma.jobs.cz/');
  assert.equal(i.length, 2);
  assert.deepEqual(i.map((x) => x.nazev).sort(), ['Finanční controller', 'Skladník']);
});

test('odkazy jsou absolutní', () => {
  const i = vytahniInzeraty(STRANKA_V1, 'https://firma.jobs.cz/');
  assert.ok(i.every((x) => x.url.startsWith('https://firma.jobs.cz/')));
});

test('vyhodí PDF, sociální sítě a navigaci', () => {
  const i = vytahniInzeraty(STRANKA_V1, 'https://firma.jobs.cz/');
  assert.ok(!i.some((x) => x.url.includes('.pdf')));
  assert.ok(!i.some((x) => x.url.includes('facebook')));
  assert.ok(!i.some((x) => x.nazev === 'O nás'));
});

test('sbírá i nefinanční pozice — skladník je informace o tom, že tam firma má provoz', () => {
  const i = vytahniInzeraty(STRANKA_V1, 'https://firma.jobs.cz/');
  assert.ok(i.some((x) => x.nazev === 'Skladník'));
});

test('odhad platformy', () => {
  assert.equal(odhadniPlatformu('https://asekol.jobs.cz/'), 'Alma Career');
  assert.equal(odhadniPlatformu('https://x.myworkdayjobs.com/cz'), 'Workday');
  assert.equal(odhadniPlatformu('https://neznama.cz/kariera'), null);
});

// ---------- diff přes celý sběr, bez sítě ----------

let puvodniFetch, stranka;

before(async () => {
  puvodniFetch = globalThis.fetch;
  DATA = await mkdtemp(path.join(tmpdir(), 'job-agent-test-'));
  await mkdir(DATA, { recursive: true });
  await writeFile(path.join(DATA, 'firmy.json'), JSON.stringify([
    { nazev: 'Testovací firma', lokalita: 'Praha 4', karierni_url: 'https://firma.jobs.cz/', ats_platforma: null, stav: 'schvaleno' },
    { nazev: 'Firma bez URL', lokalita: null, karierni_url: null, ats_platforma: null, stav: 'navrzeno' },
    { nazev: 'Odmítnutá firma', lokalita: null, karierni_url: 'https://jina.cz/', ats_platforma: null, stav: 'odmitnuto' },
  ]));
  stranka = STRANKA_V1;
  globalThis.fetch = async () => ({ ok: true, status: 200, text: async () => stranka });
});

after(async () => {
  globalThis.fetch = puvodniFetch;
  await rm(DATA, { recursive: true, force: true });
});

test('první běh nehlásí nic jako nové — nemá s čím porovnávat', async () => {
  const { sber } = await import('../src/collect.mjs');
  const v = await sber({ dataDir: DATA });
  assert.equal(v.novych, 0);
  assert.equal(v.firem, 2, 'odmítnutá firma se přeskakuje');
  assert.ok(v.zprava.some((z) => z.stav === 'chybi_url'));
});

test('druhý běh beze změny nehlásí nic', async () => {
  const { sber } = await import('../src/collect.mjs');
  const v = await sber({ dataDir: DATA });
  assert.equal(v.novych, 0);
});

test('nová pozice na stránce se objeví v nove.json', async () => {
  stranka = STRANKA_V2;
  const { sber } = await import('../src/collect.mjs');
  const v = await sber({ dataDir: DATA });
  assert.equal(v.novych, 1);

  const nove = JSON.parse(await readFile(path.join(DATA, 'nove.json'), 'utf8'));
  assert.equal(nove.inzeraty[0].nazev, 'Senior finanční analytik');
  assert.equal(nove.inzeraty[0].firma, 'Testovací firma');
  assert.equal(nove.inzeraty[0].zdroj, 'karierni_stranka');
});

test('nenačtená stránka se zapíše a běh pokračuje', async () => {
  globalThis.fetch = async () => ({ ok: false, status: 503, text: async () => '' });
  const { sber } = await import('../src/collect.mjs');
  const v = await sber({ dataDir: DATA });
  const zaznam = v.zprava.find((z) => z.firma === 'Testovací firma');
  assert.equal(zaznam.stav, 'nenacteno');
  assert.equal(zaznam.http, 503);
  assert.equal(zaznam.nacitani_funguje, false);
});
