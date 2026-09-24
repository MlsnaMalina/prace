/**
 * Práce s HTML a textem inzerátu. Čisté funkce, žádná síť.
 *
 * Sekce 10.2 briefingu vyžaduje DOSLOVNÉ úryvky, ne převyprávění. Proto se
 * z inzerátu nevytahují "informace", ale konkrétní věty, ve kterých se údaj
 * vyskytuje. Co se nedá odcitovat, je neuvedeno — nikdy odhad.
 */

const BLOKOVE = 'p|div|li|br|tr|h1|h2|h3|h4|h5|h6|section|article|header|footer|ul|ol|td';

const ENTITY = {
  '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&#39;': "'", '&apos;': "'",
  '&lt;': '<', '&gt;': '>', '&ndash;': '–', '&mdash;': '—', '&hellip;': '…',
  '&eacute;': 'é', '&scaron;': 'š', '&ccaron;': 'č', '&rcaron;': 'ř',
};

/** HTML → prostý text. Blokové značky dělají zalomení, ať věty nesrůstají. */
export function naText(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(new RegExp(`</?(?:${BLOKOVE})\\b[^>]*>`, 'gi'), '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/gi, (e) => ENTITY[e.toLowerCase()] ?? ' ')
    .replace(/[ \t ]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

/** Rozpad na věty. Zalomení řádku je hranice věty stejně jako tečka. */
export function vety(text) {
  return String(text)
    .split(/\n+|(?<=[.!?:;])\s+(?=[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0-9])/)
    .map((v) => v.trim())
    .filter((v) => v.length >= 3);
}

/**
 * Věty obsahující některý ze vzorů. Vrací doslovné znění, zkrácené na rozumnou
 * délku — dlouhý odstavec se ořízne kolem místa nálezu, ne od začátku.
 */
export function najdiVety(text, vzory, { max = 3, delka = 220 } = {}) {
  const nalezene = [];
  for (const v of vety(text)) {
    const vzor = vzory.find((r) => r.test(v));
    if (!vzor) continue;
    nalezene.push(orizni(v, vzor, delka));
    if (nalezene.length >= max) break;
  }
  return [...new Set(nalezene)];
}

function orizni(veta, vzor, delka) {
  if (veta.length <= delka) return veta;
  const m = veta.match(vzor);
  const stred = m ? veta.indexOf(m[0]) : 0;
  const od = Math.max(0, stred - Math.floor(delka / 3));
  const kus = veta.slice(od, od + delka).trim();
  return (od > 0 ? '…' : '') + kus + (od + delka < veta.length ? '…' : '');
}

/**
 * Sestaví hodnotu sloupce inzerat_uryvek: pojmenované doslovné citace.
 * Formát drží tvar, který v databázi už je (ověřeno na existujících řádcích).
 */
export function slozUryvek(casti) {
  return Object.entries(casti)
    .map(([nazev, citace]) => {
      const text = Array.isArray(citace) ? citace.join(' ') : citace;
      return `${nazev}: ${text && text.length ? text : 'neuvedeno'}`;
    })
    .join(' | ');
}

/** Normalizace pro porovnávání: bez diakritiky, malá písmena. */
export function bezDiakritiky(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
