import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  platZTextu, homeOfficeZTextu, pruznaDobaZTextu, cestyZTextu, priznakyZTextu, vytahniVse,
  platZeStitku,
} from '../src/extrakce.mjs';
import { naText, vety, najdiVety, slozUryvek } from '../src/text.mjs';

test('naText: blokové značky dělají hranici věty', () => {
  const t = naText('<div>Plat 60 000 Kč</div><li>Home office 2 dny</li>');
  assert.equal(t.split('\n').length, 2);
});

test('naText: skripty a styly se zahazují', () => {
  assert.equal(naText('<p>Ano</p><script>var x = "Ne";</script>'), 'Ano');
});

test('naText: entity', () => {
  assert.equal(naText('<p>60&nbsp;000&ndash;80&nbsp;000 K&#269;</p>'), '60 000–80 000 Kč');
});

test('vety: rozpad podle tečky i zalomení', () => {
  assert.equal(vety('První věta. Druhá věta.\nTřetí').length, 3);
});

test('najdiVety: vrací doslovné znění', () => {
  const v = najdiVety('Nabízíme pružnou pracovní dobu.', [/pru[žz]nou/i]);
  assert.deepEqual(v, ['Nabízíme pružnou pracovní dobu.']);
});

test('plat: rozpětí se dvěma mezerami', () => {
  const p = platZTextu('Mzda 60 000 – 80 000 Kč měsíčně.');
  assert.equal(p.plat_uveden, true);
  assert.equal(p.plat_od, 60000);
  assert.equal(p.plat_do, 80000);
});

test('plat: jedna hodnota od', () => {
  const p = platZTextu('Nabízíme plat od 75 000 Kč.');
  assert.equal(p.plat_od, 75000);
  assert.equal(p.plat_do, null);
});

test('plat: zápis s tečkou', () => {
  assert.equal(platZTextu('Plat 65.000 Kč').plat_od, 65000);
});

test('plat: tisíce', () => {
  const p = platZTextu('Mzda 70 tis. Kč.');
  assert.equal(p.plat_od, 70000);
});

test('plat: neuvedený plat není odhad', () => {
  const p = platZTextu('Nabízíme zajímavé finanční ohodnocení a 5 týdnů dovolené.');
  assert.equal(p.plat_uveden, false);
  assert.equal(p.plat_od, null);
});

test('plat: PSČ ani IČO se nepletou s platem', () => {
  const p = platZTextu('Sídlo: Zelený pruh 1560/99, 140 02 Praha 4. Mzda 68 000 Kč.');
  assert.equal(p.plat_od, 68000);
  assert.equal(p.plat_do, null);
});

test('home office: dny v týdnu', () => {
  assert.equal(homeOfficeZTextu('Home office v rozsahu 2 dnů v týdnu.').home_office_dny, 2);
});

test('home office: dny v měsíci se přepočítají na týden', () => {
  // Skutečná věta z inzerátu Ministerstva financí (řádek v databázi).
  assert.equal(homeOfficeZTextu('Home office v režimu 4 dny v měsíci.').home_office_dny, 1);
});

test('home office: slovem', () => {
  assert.equal(homeOfficeZTextu('Nabízíme dva dny práce z domova.').home_office_dny, 2);
});

test('home office: procenta', () => {
  assert.equal(homeOfficeZTextu('Hybridní model, 60 % práce z domova.').home_office_dny, 3);
});

test('home office: plně vzdáleně', () => {
  assert.equal(homeOfficeZTextu('Pozice je plně vzdálená, práce z domova.').home_office_dny, 5);
});

test('home office: bez čísla zůstává neuvedeno', () => {
  assert.equal(homeOfficeZTextu('Možnost občasné práce z domova.').home_office_dny, null);
});

test('home office: bez zmínky vůbec', () => {
  const ho = homeOfficeZTextu('Hledáme controllera do týmu financí.');
  assert.equal(ho.home_office_dny, null);
  assert.deepEqual(ho.citace, []);
});

test('home office: až po zapracování dostane příznak', () => {
  const ho = homeOfficeZTextu('Home office 2 dny v týdnu až po zapracování.');
  assert.equal(ho.ho_az_po_zapracovani, true);
  assert.equal(ho.home_office_dny, 2);
});

test('pružná doba: zmíněná', () => {
  assert.equal(pruznaDobaZTextu('Nabízíme pružnou pracovní dobu.').pruzna_doba, true);
});

test('pružná doba: flexibilní se počítá taky', () => {
  assert.equal(pruznaDobaZTextu('Flexibilní pracovní doba.').pruzna_doba, true);
});

test('pružná doba: nezmíněná zůstává null', () => {
  assert.equal(pruznaDobaZTextu('Pracovní doba 8:00–16:30.').pruzna_doba, null);
});

test('cesty: bez přespání', () => {
  assert.equal(cestyZTextu('Občasné služební cesty po ČR.').pracovni_cesty, 'bez_prespani');
});

test('cesty: s přespáním', () => {
  assert.equal(cestyZTextu('Služební cesty do zahraničí s přespáním.').pracovni_cesty, 's_prespanim');
});

test('cesty: opakované', () => {
  assert.equal(cestyZTextu('Pravidelné služební cesty na pobočky.').pracovni_cesty, 'opakovane');
});

test('cesty: žádné', () => {
  assert.equal(cestyZTextu('Pozice je bez služebních cest.').pracovni_cesty, 'zadne');
});

test('cesty: nezmíněné', () => {
  assert.equal(cestyZTextu('Hledáme ekonoma.').pracovni_cesty, 'neuvedeno');
});

test('příznaky: BI a automatizace', () => {
  const p = priznakyZTextu('Budete automatizovat reporting v Power BI.');
  assert.equal(p.zminuje_procesy_automatizaci_bi, true);
});

test('příznaky: agentura podle textu', () => {
  assert.equal(priznakyZTextu('Pro našeho klienta hledáme controllera.').vypsano_agenturou, true);
});

test('příznaky: agentura podle názvu firmy', () => {
  assert.equal(priznakyZTextu('Controller do týmu.', { firma: 'Grafton Recruitment' }).vypsano_agenturou, true);
});

test('příznaky: běžná firma agentura není', () => {
  assert.equal(priznakyZTextu('Controller do týmu.', { firma: 'ASEKOL a.s.' }).vypsano_agenturou, false);
});

test('vytahniVse: složí pole i citace', () => {
  const text = [
    'Hledáme Controllera.',
    'Nabízíme mzdu 70 000 – 85 000 Kč.',
    'Home office 3 dny v týdnu.',
    'Pružná pracovní doba.',
    'Občasné služební cesty.',
  ].join('\n');

  const { pole, citace } = vytahniVse(text, { firma: 'ASEKOL a.s.' });
  assert.equal(pole.plat_od, 70000);
  assert.equal(pole.home_office_dny, 3);
  assert.equal(pole.pruzna_doba, true);
  assert.equal(pole.pracovni_cesty, 'bez_prespani');
  assert.ok(citace.PLAT[0].includes('70 000'));
});

test('slozUryvek: chybějící údaj je neuvedeno', () => {
  const u = slozUryvek({ PLAT: ['Mzda 60 000 Kč.'], CESTY: [] });
  assert.equal(u, 'PLAT: Mzda 60 000 Kč. | CESTY: neuvedeno');
});

test('plat: rozpočet na benefity není plat', () => {
  // Skutečná věta z inzerátu Siemensu — dřív z ní vypadlo 34 000 a inzerát
  // by propadl první bránou jako podlimitní.
  const p = platZTextu('Minimálně 34 000 Kč ročně na nákup vybraných benefitů z oblastí financí a zdraví.');
  assert.equal(p.plat_uveden, false);
  assert.equal(p.plat_od, null);
});

test('plat: příspěvek na stravování není plat', () => {
  assert.equal(platZTextu('Příspěvek na stravování 120 Kč a penzijní připojištění 18 000 Kč ročně.').plat_uveden, false);
});

test('plat: štítek z výpisu má přednost před textem', () => {
  const p = platZTextu('Nabízíme mzdu 50 000 Kč.', { stitkyPortalu: ['Odpověď do 2 týdnů', '70 000 – 90 000 Kč'] });
  assert.equal(p.plat_od, 70000);
  assert.equal(p.plat_do, 90000);
  assert.deepEqual(p.citace, ['70 000 – 90 000 Kč']);
});

test('plat ze štítku: štítek bez částky se ignoruje', () => {
  assert.equal(platZeStitku(['Odpověď do 2 týdnů', 'Možnost práce z domova']), null);
});

test('plat: věta o platu vedle věty o benefitech', () => {
  const p = platZTextu('Stravenky v hodnotě 24 000 Kč ročně.\nNabízíme plat 78 000 Kč měsíčně.');
  assert.equal(p.plat_od, 78000);
});
