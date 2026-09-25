import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vyhodnotChybuStazeni, radekNedostupny } from '../src/hledej.mjs';

// Doloženo na ostrém běhu 24. 9. 2026: firemní mikrostránky (např. valeo.jobs.cz,
// skoda-auto.jobs.cz) vrátily z GitHub Actions HTTP 403, ze stejného kódu spuštěného
// odjinud HTTP 200 — vypadá to na blokování datacentrových IP adres. Bez téhle logiky
// se takový inzerát vracel do fronty navěky a při každém běhu znovu selhal, aniž by
// se kdy zapsal — 34 ze 100 zpracovaných v prvním ostrém běhu.

const POLOZKA = { url: 'https://valeo.jobs.cz/detail/1', pozice: 'Controller', firma: 'Valeo', lokalita: 'Praha' };

test('první selhání: zkusit znovu, ne se vzdávat', () => {
  const r = vyhodnotChybuStazeni(POLOZKA, 'nenačteno (HTTP 403)', 3);
  assert.equal(r.vzdano, false);
  assert.equal(r.polozka.pokusu, 1);
  assert.equal(r.polozka.posledni_chyba, 'nenačteno (HTTP 403)');
});

test('počet pokusů se drží přes běhy', () => {
  const podruhe = vyhodnotChybuStazeni({ ...POLOZKA, pokusu: 1 }, 'nenačteno (HTTP 403)', 3);
  assert.equal(podruhe.vzdano, false);
  assert.equal(podruhe.polozka.pokusu, 2);
});

test('po dosažení stropu se vzdá a vrátí zapisovatelný řádek', () => {
  const r = vyhodnotChybuStazeni({ ...POLOZKA, pokusu: 2 }, 'nenačteno (HTTP 403)', 3);
  assert.equal(r.vzdano, true);
  assert.equal(r.radek.url, POLOZKA.url);
  assert.equal(r.radek.skore, 0);
});

test('strop je nastavitelný, výchozí je 3', () => {
  const r = vyhodnotChybuStazeni(POLOZKA, 'chyba');
  assert.equal(r.vzdano, false);
  const posledni = vyhodnotChybuStazeni({ ...POLOZKA, pokusu: 2 }, 'chyba');
  assert.equal(posledni.vzdano, true);
});

test('nedostupný řádek: má všech šest kritérií, žádné nebodované', () => {
  const radek = radekNedostupny(POLOZKA, 'HTTP 403', 3);
  assert.equal(radek.hodnoceni.length, 6);
  assert.ok(radek.hodnoceni.every((p) => p.stav === 'stejne' && p.srazka === 0));
});

test('nedostupný řádek: skóre 0, štítek a důvod v úryvku', () => {
  const radek = radekNedostupny(POLOZKA, 'nenačteno (HTTP 403): prázdná stránka', 3);
  assert.equal(radek.skore, 0);
  assert.deepEqual(radek.stitky, ['⚠ nenačteno']);
  assert.match(radek.inzerat_uryvek, /HTTP 403/);
  assert.match(radek.inzerat_uryvek, /3 pokusech/);
});

test('nedostupný řádek: plat, HO a cesty jsou neuvedené, ne odhadnuté', () => {
  const radek = radekNedostupny(POLOZKA, 'HTTP 403', 3);
  assert.equal(radek.plat_uveden, false);
  assert.equal(radek.home_office_dny, null);
  assert.equal(radek.pracovni_cesty, 'neuvedeno');
});

test('nedostupný řádek zachovává url, pozici a firmu ze zdroje', () => {
  const radek = radekNedostupny(POLOZKA, 'HTTP 403', 3);
  assert.equal(radek.url, POLOZKA.url);
  assert.equal(radek.pozice, POLOZKA.pozice);
  assert.equal(radek.firma, POLOZKA.firma);
});
