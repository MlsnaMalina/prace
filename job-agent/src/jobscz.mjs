/**
 * Čtení výpisu nabídek z jobs.cz. Nahrazuje e-mailové alerty (sekce 5.1 briefingu).
 *
 * Proč vůbec: e-mailový alert neobsahuje skutečnou URL nabídky, jen sledovací
 * odkaz track.jobs.cz, který na stažení vrací 403. Dohledávat skutečnou adresu
 * modelem stálo tokeny. Výpis na jobs.cz vrací tytéž nabídky i se skutečnou,
 * stabilní URL — zadarmo a bez modelu.
 *
 * Sekce 5.3: nic se neobchází. robots.txt jobs.cz zakazuje /api/, /iapi/, /muj/
 * a další — výpis nabídek (/prace/...) mezi nimi NENÍ. Stahuje se jako běžná
 * stránka, s pravdivým User-Agentem a pauzami mezi dotazy.
 */

import { naText } from './text.mjs';

export const ZAKLAD = 'https://www.jobs.cz';

const MESICE = {
  ledna: 1, února: 2, unora: 2, března: 3, brezna: 3, dubna: 4, května: 5, kvetna: 5,
  června: 6, cervna: 6, července: 7, cervence: 7, srpna: 8, září: 9, zari: 9,
  října: 10, rijna: 10, listopadu: 11, prosince: 12,
};

/** Adresy výpisu pro jedno klíčové slovo a jednu lokalitu, včetně stránkování. */
export function adresaVypisu(lokalita, klicoveSlovo, stranka = 1) {
  const u = new URL(`/prace/${lokalita}/`, ZAKLAD);
  u.searchParams.set('q[]', klicoveSlovo);
  if (stranka > 1) u.searchParams.set('page', String(stranka));
  return u.toString();
}

/** Kanonická URL detailu. Bez searchId a rps — ty se mění každým dotazem a
 *  rozbily by odstranění duplicit podle sloupce url (sekce 9.1). */
export function adresaDetailu(id) {
  return `${ZAKLAD}/rpd/${id}/`;
}

/** „28. srpna" → ISO datum. Rok se dopočítá: budoucí datum patří loňsku. */
export function datumZKarty(text, dnes = new Date()) {
  const m = String(text).match(/(\d{1,2})\.\s*([a-zá-žA-ZÁ-Ž]+)/);
  if (!m) return null;
  const mesic = MESICE[m[2].toLowerCase()];
  if (!mesic) return null;

  const den = Number(m[1]);
  let rok = dnes.getFullYear();
  const d = () => new Date(Date.UTC(rok, mesic - 1, den));
  if (d() > dnes) rok -= 1;
  return d().toISOString().slice(0, 10);
}

/** Kolik nabídek hlášení „Našli jsme N nabídek" uvádí. null = nenalezeno. */
export function pocetVysledku(html) {
  const m = html.match(/Na[sš]li jsme\s*<strong>\s*(\d+)\s*<\/strong>/i);
  return m ? Number(m[1]) : null;
}

function prvni(re, s) {
  const m = s.match(re);
  return m ? naText(m[1]).trim() : null;
}

/**
 * Rozpad HTML výpisu na jednotlivé nabídky.
 * Vrací [{ id, url, pozice, firma, lokalita, vypsano, stitky_portalu, atmoskop }]
 */
export function vytahniKarty(html, { dnes = new Date() } = {}) {
  const karty = String(html).split(/<article[^>]*class="SearchResultCard"/).slice(1);
  const vysledek = [];

  for (const cela of karty) {
    const k = cela.split('</article>')[0];
    const id = prvni(/data-jobad-id="(\d+)"/, k);
    if (!id) continue;

    const pozice = prvni(/data-test-ad-title="([^"]+)"/, k);
    if (!pozice) continue;

    vysledek.push({
      id,
      url: adresaDetailu(id),
      pozice,
      firma: prvni(/<li[^>]*class="SearchResultCard__footerItem"[^>]*>[\s\S]*?<span translate="no">([\s\S]*?)<\/span>/, k),
      lokalita: prvni(/<li[^>]*data-test="serp-locality"[^>]*>([\s\S]*?)<\/li>/, k),
      vypsano: datumZKarty(prvni(/class="SearchResultCard__status[^"]*"\s*>([\s\S]*?)<\/div>/, k) ?? '', dnes),
      stitky_portalu: [...k.matchAll(/<span\s+class="Tag[^"]*"\s*>([\s\S]*?)<\/span>/g)]
        .map((m) => naText(m[1]).trim())
        .filter(Boolean),
      atmoskop: prvni(/data-test="serp-atmoskop"[^>]*>([\s\S]*?)<\/a>/, k),
    });
  }

  return vysledek;
}
