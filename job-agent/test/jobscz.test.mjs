import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vytahniKarty, pocetVysledku, adresaVypisu, adresaDetailu, datumZKarty } from '../src/jobscz.mjs';

// Zkrácená, ale doslovná podoba markupu z jobs.cz včetně jeho zvláštností:
// víc mezer za <span, zalomení před > a &amp; v odkazu. Na těchhle detailech
// parser už jednou spadl, proto jsou ve fixture schválně.
const KARTA = `
<article class="SearchResultCard" >
  <header class="SearchResultCard__header" >
    <h2 data-test-ad-title="Controlling Manager (15)" class="SearchResultCard__title" >
      <a data-jobad-id="2001398037" href="https://www.jobs.cz/rpd/2001398037/?searchId=abc&amp;rps=233" >Controlling Manager (15)</a>
    </h2>
    <div data-test-ad-status="default" class="SearchResultCard__status SearchResultCard__status--default" >28. srpna</div>
  </header>
  <div class="SearchResultCard__body" >
    <span   class="Tag Tag--neutral Tag--small Tag--subtle"
>Odpověď do 2 týdnů</span>
    <span   class="Tag Tag--neutral Tag--small Tag--subtle"
>60 000 – 70 000 Kč</span>
  </div>
  <footer class="SearchResultCard__footer" >
    <ul class="SearchResultCard__footerList">
      <li class="SearchResultCard__footerItem" ><span translate="no">Delirest services s.r.o.</span></li>
      <li data-test="serp-locality" class="SearchResultCard__footerItem" >Praha – Holešovice</li>
      <li class="SearchResultCard__footerItem" ><a data-test="serp-atmoskop" href="https://www.atmoskop.cz/x" >152 hodnocení na Atmoskopu</a></li>
    </ul>
  </footer>
</article>`;

const DNES = new Date('2026-09-24T00:00:00Z');

test('karta: vytáhne všechna pole', () => {
  const [k] = vytahniKarty(KARTA, { dnes: DNES });
  assert.equal(k.id, '2001398037');
  assert.equal(k.pozice, 'Controlling Manager (15)');
  assert.equal(k.firma, 'Delirest services s.r.o.');
  assert.equal(k.lokalita, 'Praha – Holešovice');
  assert.equal(k.vypsano, '2026-08-28');
  assert.equal(k.atmoskop, '152 hodnocení na Atmoskopu');
});

test('karta: URL je kanonická, bez searchId', () => {
  const [k] = vytahniKarty(KARTA, { dnes: DNES });
  assert.equal(k.url, 'https://www.jobs.cz/rpd/2001398037/');
});

test('karta: štítky portálu včetně platu', () => {
  const [k] = vytahniKarty(KARTA, { dnes: DNES });
  assert.deepEqual(k.stitky_portalu, ['Odpověď do 2 týdnů', '60 000 – 70 000 Kč']);
});

test('karta bez data (místo něj odznak) nespadne', () => {
  const bezData = KARTA.replace('28. srpna', 'Příležitost dne');
  const [k] = vytahniKarty(bezData, { dnes: DNES });
  assert.equal(k.vypsano, null);
  assert.equal(k.pozice, 'Controlling Manager (15)');
});

test('výpis bez karet vrací prázdné pole', () => {
  assert.deepEqual(vytahniKarty('<html><body>Nic</body></html>'), []);
});

test('datum: budoucí den patří loňsku', () => {
  assert.equal(datumZKarty('20. prosince', DNES), '2025-12-20');
});

test('datum: neznámý měsíc vrací null', () => {
  assert.equal(datumZKarty('20. mlhavna', DNES), null);
});

test('počet výsledků', () => {
  assert.equal(pocetVysledku('<p>Našli jsme <strong>108</strong> nabídek</p>'), 108);
  assert.equal(pocetVysledku('<p>Nic</p>'), null);
});

test('adresa výpisu: kódování a stránkování', () => {
  assert.equal(
    adresaVypisu('praha', 'finanční analytik', 2),
    'https://www.jobs.cz/prace/praha/?q%5B%5D=finan%C4%8Dn%C3%AD+analytik&page=2',
  );
  assert.ok(!adresaVypisu('praha', 'ekonom').includes('page='));
});

test('adresa detailu', () => {
  assert.equal(adresaDetailu('123'), 'https://www.jobs.cz/rpd/123/');
});
