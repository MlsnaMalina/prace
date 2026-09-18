import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { brany, skoruj, vyhodnot, PRAZDNA_NABIDKA } from '../src/scoring.mjs';

const cfg = JSON.parse(readFileSync(new URL('../config.json', import.meta.url)));

/** Nabídka, která přesně odpovídá Michalovu dnešnímu stavu (sekce 3) → musí dát 100. */
const vychozi = {
  url: 'https://example.com/1',
  je_financni_pozice: true,
  plat_uveden: true,
  plat_od: 80000,
  home_office_dny: 2,
  pruzna_doba: true,
  naplne_prace: 'jadro',
  seniorita: 'seniorni',
  dojezd_min: 25,
  pracovni_cesty: 'zadne',
};

const s = (zmeny = {}) => skoruj({ ...PRAZDNA_NABIDKA, ...vychozi, ...zmeny }, cfg);

// ---------- Sekce 3: výchozí stav je měřítko ----------

test('stejné jako dnes = 100 bodů, žádná srážka', () => {
  const v = s();
  assert.equal(v.skore, 100);
  assert.deepEqual(v.stitky, []);
  assert.equal(v.pasmo, 'reagovat');
});

// ---------- Sekce 6: brány ----------

test('brána: uvedený plat pod 55 000 vyřazuje', () => {
  const b = brany({ ...PRAZDNA_NABIDKA, plat_uveden: true, plat_od: 50000, je_financni_pozice: true }, cfg);
  assert.equal(b.prosel, false);
  assert.match(b.duvod, /55000/);
});

test('brána: 55 000 přesně ještě projde', () => {
  const b = brany({ ...PRAZDNA_NABIDKA, plat_uveden: true, plat_od: 55000, je_financni_pozice: true }, cfg);
  assert.equal(b.prosel, true);
});

test('brána: neuvedený plat NENÍ důvod k vyřazení', () => {
  const b = brany({ ...PRAZDNA_NABIDKA, plat_uveden: false, plat_od: null, je_financni_pozice: true }, cfg);
  assert.equal(b.prosel, true);
});

test('brána: nefinanční pozice vyřazuje', () => {
  const b = brany({ ...PRAZDNA_NABIDKA, je_financni_pozice: false }, cfg);
  assert.equal(b.prosel, false);
});

test('brána: nejistý typ pozice projde dál a dostane štítek', () => {
  const v = vyhodnot({ ...vychozi, je_financni_pozice: null }, cfg);
  assert.equal(v.hodnoceni.vyrazeno, false);
  assert.ok(v.stitky.includes('⚠ typ pozice neurčen'));
});

test('brána: pracovní cesty s přespáním nevyřazují', () => {
  const b = brany({ ...PRAZDNA_NABIDKA, je_financni_pozice: true, pracovni_cesty: 's_prespanim' }, cfg);
  assert.equal(b.prosel, true);
});

test('vyřazená nabídka se zapisuje se zdůvodněním, ne beze stopy', () => {
  const v = vyhodnot({ url: 'https://example.com/x', je_financni_pozice: false }, cfg);
  assert.equal(v.skore, 0);
  assert.equal(v.hodnoceni.vyrazeno, true);
  assert.ok(v.hodnoceni.duvod.length > 0);
  assert.equal(v.url, 'https://example.com/x');
});

// ---------- Sekce 7: home office (nejvyšší váha) ----------

test('home office podle stupnice', () => {
  assert.equal(s({ home_office_dny: 0 }).skore, 100 - 24);
  assert.equal(s({ home_office_dny: 1 }).skore, 100 - 12);
  assert.equal(s({ home_office_dny: 2 }).skore, 100);
  assert.equal(s({ home_office_dny: 3 }).skore, 100 + 4 > 100 ? 100 : 104);
  assert.equal(s({ home_office_dny: 3 }).raw, 104);
  assert.equal(s({ home_office_dny: 5 }).raw, 106);
});

test('neuvedený home office = -20 (odvozená hodnota, viz otevřená otázka v configu)', () => {
  assert.equal(s({ home_office_dny: null }).raw, 80);
});

// ---------- Sekce 7: pružná doba ----------

test('nezmíněná pružná doba je -21', () => {
  assert.equal(s({ pruzna_doba: false }).skore, 79);
});

// ---------- Sekce 7: plat ----------

test('platová pásma včetně hranic', () => {
  assert.equal(s({ plat_od: 75000 }).skore, 100);
  assert.equal(s({ plat_od: 74999 }).skore, 94);
  assert.equal(s({ plat_od: 65000 }).skore, 94);
  assert.equal(s({ plat_od: 64999 }).skore, 88);
  assert.equal(s({ plat_od: 55000 }).skore, 88);
});

test('neuvedený plat je -10 a dostane štítek', () => {
  const v = s({ plat_uveden: false, plat_od: null });
  assert.equal(v.skore, 90);
  assert.ok(v.stitky.includes('⚠ plat neuveden'));
});

test('u rozpětí rozhoduje spodní hranice', () => {
  assert.equal(s({ plat_od: 60000, plat_do: 90000 }).skore, 88);
});

// ---------- Sekce 7: náplň a seniorita ----------

test('náplň práce a seniorita', () => {
  assert.equal(s({ naplne_prace: 'pribuzna' }).skore, 93);
  assert.equal(s({ naplne_prace: 'vzdalena' }).skore, 85);
  assert.equal(s({ seniorita: 'medior' }).skore, 94);
  assert.equal(s({ seniorita: 'juniorni' }).skore, 88);
});

test('nepřítomnost vedení týmu se netrestá, jen označí', () => {
  const v = s({ vedeni_tymu: false });
  assert.equal(v.skore, 100);
  assert.ok(v.stitky.includes('ℹ pozice bez vedení týmu'));
});

// ---------- Sekce 7: dojezd × koeficient ----------

test('dojezd se násobí koeficientem dnů v kanceláři', () => {
  // 50 min = základ -7. Při 0 dnech HO je v kanceláři 5 dní → ×1,0
  assert.equal(s({ dojezd_min: 50, home_office_dny: 0, pruzna_doba: false }).raw, 100 - 24 - 21 - 7);
  // Tentýž dojezd při 3 dnech HO → v kanceláři 2 dny → ×0,4 = -2,8
  assert.equal(s({ dojezd_min: 50, home_office_dny: 3 }).raw, 104 - 2.8);
});

test('neověřený dojezd nesráží nic, jen dostane štítek', () => {
  const v = s({ dojezd_min: null });
  assert.equal(v.skore, 100);
  assert.ok(v.stitky.includes('⚠ dojezd neověřen'));
});

// ---------- Sekce 7: kombinační pravidlo ----------

test('kombinační pravidlo: všechny tři podmínky → -20 a štítek', () => {
  const v = s({ pevna_doba_pres_rani_spicku: true, pruzna_doba: false, dojezd_min: 45, home_office_dny: 1 });
  // 100 -12 (HO1) -21 (bez pružné) -3,2 (dojezd -4 × 0,8) -20 (kombinace)
  assert.equal(v.raw, 43.8);
  assert.ok(v.stitky.includes('⚠ kolona ráno i večer'));
  assert.equal(v.pasmo, 'statistika');
});

test('kombinační pravidlo: dvě podmínky ze tří nespouštějí nic', () => {
  const v = s({ pevna_doba_pres_rani_spicku: true, pruzna_doba: false, dojezd_min: 45, home_office_dny: 2 });
  assert.equal(v.raw, 76.6);
  assert.ok(!v.stitky.includes('⚠ kolona ráno i večer'));
});

test('kombinační pravidlo nespustí dojezd přesně 30 minut', () => {
  const v = s({ pevna_doba_pres_rani_spicku: true, pruzna_doba: false, dojezd_min: 30, home_office_dny: 1 });
  assert.ok(!v.stitky.includes('⚠ kolona ráno i večer'));
});

// ---------- Sekce 7: přirážky a srážky navíc ----------

test('přirážky za procesy a za firmu ze vzorku', () => {
  assert.equal(s({ zminuje_procesy_automatizaci_bi: true }).raw, 108);
  assert.equal(s({ firma_ze_vzorku: true }).raw, 105);
});

test('srážka za převážně administrativní náplň', () => {
  assert.equal(s({ prevazne_administrativa: true }).skore, 90);
});

test('pracovní cesty', () => {
  assert.equal(s({ pracovni_cesty: 'bez_prespani' }).skore, 90);
  assert.equal(s({ pracovni_cesty: 's_prespanim' }).skore, 85);
  assert.equal(s({ pracovni_cesty: 'opakovane' }).skore, 85);
  const v = s({ pracovni_cesty: 'neuvedeno' });
  assert.equal(v.skore, 100);
  assert.ok(v.stitky.includes('⚠ pracovní cesty neuvedeny'));
});

// ---------- Ořez a pásma ----------

test('skóre se ořezává na 100, hrubá hodnota zůstává v raw', () => {
  const v = s({ home_office_dny: 4, zminuje_procesy_automatizaci_bi: true, firma_ze_vzorku: true });
  assert.equal(v.raw, 119);
  assert.equal(v.skore, 100);
});

test('pásma podle sekce 7', () => {
  assert.equal(s({ naplne_prace: 'vzdalena' }).pasmo, 'reagovat');        // 85
  assert.equal(s({ pruzna_doba: false }).pasmo, 'zvazit');                // 79
  assert.equal(s({ home_office_dny: 0, pruzna_doba: false }).pasmo, 'prehled_trhu'); // 55
  assert.equal(s({ home_office_dny: 0, pruzna_doba: false, plat_od: 56000, naplne_prace: 'vzdalena' }).pasmo, 'statistika');
});

// ---------- Štítky ----------

test('štítky z textu se propisují', () => {
  const v = s({
    ho_az_po_zapracovani: true,
    vypsano_agenturou: true,
    rozpor_benefity_popis: true,
    teambuilding_v_benefitech: true,
    inzerat_stari_dny: 90,
  });
  assert.ok(v.stitky.includes('⚠ home office až po zapracování'));
  assert.ok(v.stitky.includes('⚠ vypsáno agenturou, ne firmou'));
  assert.ok(v.stitky.includes('⚠ rozpor mezi benefity a popisem'));
  assert.ok(v.stitky.includes('ℹ firemní akce a teambuilding v benefitech'));
  assert.ok(v.stitky.includes('⚠ inzerát visí déle než 60 dní'));
});

test('štítky neovlivňují skóre', () => {
  const bez = s().skore;
  const se = s({ vypsano_agenturou: true, teambuilding_v_benefitech: true, inzerat_stari_dny: 200 }).skore;
  assert.equal(bez, se);
});
