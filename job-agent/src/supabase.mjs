/**
 * Zápis a čtení v Supabase. Běží JEN v GitHub Actions, nikdy v appce.
 *
 * Používá service_role klíč, protože jako jediný smí do `nabidky` vkládat —
 * appka `prace` má schválně jen SELECT a UPDATE na čtyři sloupce (viz
 * DO_NOT_CHANGE.md). Klíč je v GitHub Secrets a nikdy nesmí skončit v kódu,
 * v logu ani v commitu.
 *
 * Rozdělení území (job-agent/README.md) platí dál:
 *   automat  → nabidky (INSERT), firmy (technické sloupce), behy
 *   Kateřina → stav, poznamka, datum_reakce, zpusob_reakce
 * Automat sloupce `stav` a `poznamka` nikdy nezapisuje ani nepřepisuje.
 */

const TABULKY_POVOLENE = new Set(['nabidky', 'firmy', 'behy']);

function prostredi() {
  const url = process.env.SUPABASE_URL;
  const klic = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !klic) throw new Error('Chybí SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY.');
  return { url: url.replace(/\/$/, ''), klic };
}

async function rest(tabulka, { metoda = 'GET', dotaz = '', telo = null, prefer = null } = {}) {
  // Pojistka proti překlepu: projekt hostí i tabulky appky Recepty, kterých se
  // automat nesmí dotknout ani čtením (sekce 9.1 briefingu).
  if (!TABULKY_POVOLENE.has(tabulka)) throw new Error(`Tabulka ${tabulka} není pro automat povolená.`);

  const { url, klic } = prostredi();
  const odpoved = await fetch(`${url}/rest/v1/${tabulka}${dotaz}`, {
    method: metoda,
    headers: {
      apikey: klic,
      Authorization: `Bearer ${klic}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: telo ? JSON.stringify(telo) : undefined,
  });

  const text = await odpoved.text();
  if (!odpoved.ok) throw new Error(`Supabase ${metoda} ${tabulka} → ${odpoved.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

/** Firmy ke sledování: navrzeno + schvaleno, odmitnuto se přeskakuje (sekce 5.2). */
export async function nactiFirmy() {
  return rest('firmy', {
    dotaz: '?select=id,nazev,lokalita,karierni_url,ats_platforma,stav&stav=in.(navrzeno,schvaleno)&order=nazev',
  });
}

/** Které z předaných URL už v `nabidky` jsou. Klíčem je url (sekce 9.1). */
export async function jizZname(urls) {
  const zname = new Set();
  for (let i = 0; i < urls.length; i += 100) {
    const davka = urls.slice(i, i + 100);
    const seznam = davka.map((u) => `"${u.replace(/"/g, '')}"`).join(',');
    const rows = await rest('nabidky', { dotaz: `?select=url&url=in.(${encodeURIComponent(seznam)})` });
    for (const r of rows) zname.add(r.url);
  }
  return zname;
}

/** Vloží nové nabídky. Konflikt na url se tiše přeskočí — duplicita není chyba. */
export async function zapisNabidky(radky) {
  if (!radky.length) return [];
  return rest('nabidky', {
    metoda: 'POST',
    dotaz: '?on_conflict=url',
    telo: radky,
    prefer: 'return=representation,resolution=ignore-duplicates',
  });
}

/** Technické sloupce firmy. Na `stav` ani `poznamka` automat nesahá. */
export async function aktualizujFirmu(id, zmeny) {
  const povolene = ['karierni_url', 'ats_platforma', 'nacitani_funguje', 'posledni_kontrola', 'hodnoceni_atmoskop', 'adresa'];
  const telo = Object.fromEntries(Object.entries(zmeny).filter(([k]) => povolene.includes(k)));
  if (!Object.keys(telo).length) return null;
  return rest('firmy', { metoda: 'PATCH', dotaz: `?id=eq.${id}`, telo, prefer: 'return=minimal' });
}

/** Samodoplňování seznamu firem (sekce 5.2). Nová firma vždy ve stavu navrzeno. */
export async function pridejFirmu(firma) {
  return rest('firmy', {
    metoda: 'POST',
    telo: [{ ...firma, stav: 'navrzeno' }],
    prefer: 'return=representation,resolution=ignore-duplicates',
  });
}

/** Založí záznam o běhu, ať appka umí ukázat „hledám…" a výsledek. */
export async function zalozBeh({ zdroj, github_run_id = null }) {
  const [row] = await rest('behy', {
    metoda: 'POST',
    telo: [{ zdroj, github_run_id, stav: 'bezi' }],
    prefer: 'return=representation',
  });
  return row;
}

export async function dokonciBeh(id, zmeny) {
  if (!id) return null;
  return rest('behy', {
    metoda: 'PATCH',
    dotaz: `?id=eq.${id}`,
    telo: { ...zmeny, dokonceno: new Date().toISOString() },
    prefer: 'return=minimal',
  });
}
