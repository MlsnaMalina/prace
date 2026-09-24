import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { proAppku, KRITERIA } from '../src/hodnoceni-app.mjs';
import { skoruj, PRAZDNA_NABIDKA } from '../src/scoring.mjs';

const cfg = JSON.parse(await readFile(new URL('../config.json', import.meta.url), 'utf8'));

function obodujA(nabidka) {
  const n = { ...PRAZDNA_NABIDKA, ...nabidka };
  const v = skoruj(n, cfg);
  return { n, v, polozky: proAppku(n, v.polozky) };
}

test('vždycky přesně šest kritérií v daném pořadí', () => {
  const { polozky } = obodujA({ naplne_prace: 'jadro', seniorita: 'seniorni' });
  assert.deepEqual(polozky.map((p) => p.kriterium), KRITERIA);
});

test('součet šesti položek dává skóre', () => {
  const { v, polozky } = obodujA({
    naplne_prace: 'jadro', seniorita: 'seniorni', home_office_dny: 1,
    pruzna_doba: true, plat_uveden: true, plat_od: 68000, dojezd_min: 40,
    pracovni_cesty: 'bez_prespani', zminuje_procesy_automatizaci_bi: true,
  });
  const soucet = polozky.reduce((s, p) => s + (p.stav === 'lepsi' ? p.srazka : -p.srazka), 0);
  assert.equal(100 + soucet, v.raw);
});

test('srážka je nezáporná, znaménko nese stav', () => {
  const { polozky } = obodujA({ naplne_prace: 'jadro', seniorita: 'seniorni', home_office_dny: 0 });
  const ho = polozky.find((p) => p.kriterium === 'Home office');
  assert.equal(ho.stav, 'horsi');
  assert.equal(ho.srazka, 24);
});

test('víc home officu než dnes je lepší, ne horší', () => {
  const { polozky } = obodujA({ naplne_prace: 'jadro', seniorita: 'seniorni', home_office_dny: 4 });
  const ho = polozky.find((p) => p.kriterium === 'Home office');
  assert.equal(ho.stav, 'lepsi');
  assert.equal(ho.srazka, 6);
});

test('dva dny home officu jsou stejné jako dnes', () => {
  const { polozky } = obodujA({ naplne_prace: 'jadro', seniorita: 'seniorni', home_office_dny: 2 });
  assert.equal(polozky.find((p) => p.kriterium === 'Home office').stav, 'stejne');
});

test('přirážky a srážky navíc se skládají do Náplně práce', () => {
  const { polozky } = obodujA({
    naplne_prace: 'jadro', seniorita: 'seniorni',
    zminuje_procesy_automatizaci_bi: true, firma_ze_vzorku: true,
  });
  const np = polozky.find((p) => p.kriterium === 'Náplň práce');
  assert.equal(np.stav, 'lepsi');
  assert.equal(np.srazka, 13);
  assert.match(np.poznamka, /automatizaci nebo BI/);
});

test('kombinační pravidlo i pracovní cesty se počítají do Dojezdu', () => {
  const { polozky } = obodujA({
    naplne_prace: 'jadro', seniorita: 'seniorni',
    dojezd_min: 45, home_office_dny: 1, pevna_doba_pres_rani_spicku: true,
    pracovni_cesty: 's_prespanim',
  });
  const d = polozky.find((p) => p.kriterium === 'Dojezd');
  // dojezd −4 × koeficient 0,8 = −3,2; kombinační −20; cesty −15
  assert.equal(d.stav, 'horsi');
  assert.ok(d.srazka > 20, `čekáno přes 20, dostal ${d.srazka}`);
  assert.match(d.poznamka, /kolona|ranní špičku/i);
});

test('poznámky uvádějí konkrétní nález, ne dojem', () => {
  const { polozky } = obodujA({
    naplne_prace: 'pribuzna', seniorita: 'medior',
    plat_uveden: true, plat_od: 60000, plat_do: 80000, home_office_dny: 3,
  });
  // cs-CZ formátuje tisíce pevnou mezerou (U+00A0), proto \s a ne obyčejná mezera.
  assert.match(polozky.find((p) => p.kriterium === 'Plat').poznamka, /60\s000–80\s000 Kč/);
  assert.match(polozky.find((p) => p.kriterium === 'Home office').poznamka, /3 dny týdně/);
});

test('neuvedené údaje se popíšou jako neuvedené', () => {
  const { polozky } = obodujA({ naplne_prace: 'jadro', seniorita: 'seniorni' });
  assert.match(polozky.find((p) => p.kriterium === 'Plat').poznamka, /uveden není/);
  assert.match(polozky.find((p) => p.kriterium === 'Dojezd').poznamka, /neověřen/);
});
