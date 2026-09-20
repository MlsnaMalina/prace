import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsujAlert } from '../src/parse-alert.mjs';

// Řádky níže jsou zkrácené sledovací URL (skutečné jsou stovky znaků), ale tvar
// "| titul [](url) ... firma • lokalita |" je doslovně okopírovaný ze skutečných
// e-mailů z 18. 9. 2026 (vlákna 1a0b310b30c2c391 a 1a0b0383c0baf0ed) — včetně
// řádku, kde je uvnitř titulu znak "|", který dřívější verzi parseru rozbíjel.

const JOBS_CZ_VZOREK = `
Odpovězte JOBSTART s.r.o. (Finanční poradce / Specialista pojištění – Allianz) a 29 dalším novým nabídkám práce

| |

| |
| Dobrý den, posíláme výběr nejnovějších pracovních příležitostí: |
| |
| „finanční manažer", Praha (+ 0 km), Středočeský kraj |
| |

| |
| Finanční poradce / Specialista pojištění – Allianz [](https://track.jobs.cz/f/a/AAA~~/) 50 000 – 100 000 Kč Odpověď do 2 týdnů   JOBSTART s.r.o. • Praha |

| |
| MANAŽER/KA ÚČETNÍHO ODDĚLENÍ / HEAD OF ACCOUNTING [](https://track.jobs.cz/f/a/BBB~~/) Odpověď do 2 týdnů   LPP Czech Republic, s.r.o. • Praha – Prosek |

| |
| CASE MANAGER/KA 1,0 úvazek [](https://track.jobs.cz/f/a/CCC~~/)   SANANIM • Praha – Nové Město |

| |
| CASE MANAGER/KA [](https://track.jobs.cz/f/a/DDD~~/)   SANANIM • Praha – Nové Město |

| |
| SENIOR PROJEKTOVÝ MANAŽER | KOMPLEXNÍ ŘÍZENÍ REZIDENČNÍHO DEVELOPMENTU [](https://track.jobs.cz/f/a/EEE~~/) 130 000 – 150 000 Kč Odpověď do 2 týdnů   Prušák Group s.r.o. • Praha |

| |
| Projektový manažer 0,5–0,75 [](https://track.jobs.cz/f/a/FFF~~/) 18 500 – 31 500 Kč   Letní dům, z.ú. • Praha – Žižkov |

| |
| Zobrazit všechny nové nabídky [](https://track.jobs.cz/f/a/GGG~~/) |

| Přejeme šťastnou ruku při výběru, Váš Jobs.cz [](https://track.jobs.cz/f/a/HHH~~/) |
| |
| Chcete dostávat jiné nabídky? |
| |
| Upravit kritéria hledání [](https://track.jobs.cz/f/a/III~~/) |
| |
| Odhlásit e-maily z tohoto hledání [](https://track.jobs.cz/f/a/JJJ~~/) |

| |
| Nabídky práce [](https://track.jobs.cz/f/a/KKK~~/) Brigády [](https://track.jobs.cz/f/a/LLL~~/) Inspirace [](https://track.jobs.cz/f/a/MMM~~/) Ochrana soukromí [](https://track.jobs.cz/f/a/NNN~~/) |
`;

const PRACE_CZ_VZOREK = `
Odpovězte Městská část Praha 14 nebo 1 dalšímu

| |
| Dobrý den, máme pro vás nové pracovní nabídky, které odpovídají tomu, co hledáte: |
| |
| Nabídky práce pro Praha, Středočeský kraj na plný úvazek jako Ekonom |
| |

| |
| Referent/ka – ekonom/ka oddělení školství [](https://track.prace.cz/f/a/PPP~~/) 35 840 – 38 990 Kč/měsíc   Městská část Praha 14 • Praha-Černý Most |

| |
| Finanční manažer/ka [](https://track.prace.cz/f/a/QQQ~~/)   SATPO management, s.r.o. • Praha-Smíchov |

| |
| Zobrazit všechny nové nabídky [](https://track.prace.cz/f/a/RRR~~/) |

| |
| Upravit preference hledání [](https://track.prace.cz/f/a/SSS~~/) |
`;

test('vytáhne správný počet skutečných nabídek z jobs.cz alertu', () => {
  const v = parsujAlert(JOBS_CZ_VZOREK, 'jobs.cz');
  assert.equal(v.length, 6);
});

test('titul s "|" uvnitř se neuřízne — dřívější chyba', () => {
  const v = parsujAlert(JOBS_CZ_VZOREK, 'jobs.cz');
  const n = v.find((x) => x.firma === 'Prušák Group s.r.o.');
  assert.ok(n, 'nabídka od Prušák Group nebyla nalezena vůbec');
  assert.equal(n.pozice, 'SENIOR PROJEKTOVÝ MANAŽER | KOMPLEXNÍ ŘÍZENÍ REZIDENČNÍHO DEVELOPMENTU');
});

test('plat se rozparsuje jako rozpětí', () => {
  const v = parsujAlert(JOBS_CZ_VZOREK, 'jobs.cz');
  const n = v.find((x) => x.firma === 'JOBSTART s.r.o.');
  assert.equal(n.plat_uveden, true);
  assert.equal(n.plat_od, 50000);
  assert.equal(n.plat_do, 100000);
});

test('neuvedený plat zůstává neuveden, ne 0', () => {
  const v = parsujAlert(JOBS_CZ_VZOREK, 'jobs.cz');
  const n = v.find((x) => x.firma.startsWith('LPP'));
  assert.equal(n.plat_uveden, false);
  assert.equal(n.plat_od, null);
});

test('plat s "/měsíc" se rozparsuje stejně jako bez přípony', () => {
  const v = parsujAlert(PRACE_CZ_VZOREK, 'prace.cz');
  const n = v.find((x) => x.firma.includes('Praha 14'));
  assert.equal(n.plat_od, 35840);
  assert.equal(n.plat_do, 38990);
});

test('lokalita se čte doslovně, i s pomlčkou bez mezer (Praha-Smíchov)', () => {
  const v = parsujAlert(PRACE_CZ_VZOREK, 'prace.cz');
  const n = v.find((x) => x.firma.includes('SATPO'));
  assert.equal(n.lokalita, 'Praha-Smíchov');
});

test('opakovaná nabídka ve stejném e-mailu (SANANIM 2×) se nezdvojí', () => {
  const v = parsujAlert(JOBS_CZ_VZOREK, 'jobs.cz');
  const sananim = v.filter((x) => x.firma === 'SANANIM');
  assert.equal(sananim.length, 2, 'dvě RŮZNÉ pozice od SANANIM zůstávají obě');
  assert.notEqual(sananim[0].pozice, sananim[1].pozice);
});

test('navigační a patičkové řádky se nevytahují jako nabídky', () => {
  const v = parsujAlert(JOBS_CZ_VZOREK, 'jobs.cz');
  const zakazane = ['zobrazit všechny', 'přejeme', 'upravit kritéria', 'odhlásit', 'nabídky práce', 'brigády'];
  for (const n of v) {
    const t = n.pozice.toLowerCase();
    assert.ok(!zakazane.some((z) => t.startsWith(z)), `nav řádek prošel jako nabídka: "${n.pozice}"`);
  }
});

test('hlavička s kritérii hledání se nebere jako nabídka', () => {
  const v = parsujAlert(PRACE_CZ_VZOREK, 'prace.cz');
  assert.ok(!v.some((n) => n.pozice.includes('Nabídky práce pro Praha')));
});

test('zdroj se propíše na každou nabídku', () => {
  const v = parsujAlert(PRACE_CZ_VZOREK, 'prace.cz');
  assert.ok(v.every((n) => n.zdroj === 'prace.cz'));
});

test('tracking_url je zachycená, ale označená jen jako pomocná (ne dedup klíč)', () => {
  const v = parsujAlert(JOBS_CZ_VZOREK, 'jobs.cz');
  assert.ok(v[0].tracking_url.startsWith('https://track.jobs.cz/'));
});
