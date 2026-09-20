/**
 * Rozparsování e-mailových alertů z jobs.cz a prace.cz (obojí posílá Alma Career,
 * shodná šablona) na jednotlivé nabídky.
 *
 * Mechanická extrakce, bez modelu, bez sítě. Vstupem je plaintextBody z Gmailu
 * (mcp__Gmail__get_thread, messageFormat: PLAIN_TEXT).
 *
 * DŮLEŽITÉ OMEZENÍ, ověřeno, ne odhadnuto:
 * Odkaz v alertu vede přes track.jobs.cz / track.prace.cz (sledovací přesměrování
 * Alma Career). Automatizované rozlouskávání (curl s běžnou hlavičkou) na něm
 * dostává HTTP 403 — jde o ochranu proti botům. Sekce 5.3 briefingu zakazuje
 * ochrany portálů obcházet, takže se o to dál nepokoušíme.
 *
 * Důsledek: sledovací URL NENÍ použitelná jako dedup klíč (sekce 9.1 chce `url`
 * jako klíč) — je to jednorázový token, stejná nabídka dostane jiný odkaz
 * v každém alertu, kde se znovu objeví. Tenhle parser proto url z alertu
 * nevrací jako finální identifikátor, jen jako pomocné pole `tracking_url`.
 * Skutečnou (stabilní) URL dohledává až další krok, přes hledání title+firma —
 * a to už dělá jen pro nabídky, které projdou branami. Viz README.
 */

/** Struktura jedné řádky v e-mailu: "| TITUL [](URL) [PLAT] [ODPOVĚĎ]   FIRMA • LOKALITA |" */
function rozparsujRadek(radekRaw) {
  const radek = radekRaw.trim();
  if (!radek.startsWith('|') || !radek.endsWith('|')) return null;

  const obsah = radek.slice(1, -1).trim();
  const odkaz = obsah.match(/\[\]\(([^)]+)\)/);
  if (!odkaz) return null; // řádka bez odkazu není nabídka (nadpis, patička…)

  const titul = obsah.slice(0, odkaz.index).trim();
  const zbytek = obsah.slice(odkaz.index + odkaz[0].length).trim();
  if (!titul || titul.length < 3) return null;

  // Firma • Lokalita je vždy poslední blok oddělený 2+ mezerami od zbytku (plat, termín odpovědi).
  const bloky = zbytek.split(/\s{2,}/).map((s) => s.trim()).filter(Boolean);
  if (bloky.length === 0) return null;

  const firmaLokalita = bloky[bloky.length - 1];
  if (!firmaLokalita.includes('•')) return null; // bez "•" to není řádek s nabídkou (nav/patička)

  const metaText = bloky.slice(0, -1).join(' ');
  const [firma, lokalita] = firmaLokalita.split('•').map((s) => s.trim());
  if (!firma) return null;

  const platM = metaText.match(/(\d[\d ]{2,}\d)(?:\s*[–-]\s*(\d[\d ]{2,}\d))?\s*Kč/);
  const plat_uveden = !!platM;
  const plat_od = platM ? parseInt(platM[1].replace(/\s/g, ''), 10) : null;
  const plat_do = platM && platM[2] ? parseInt(platM[2].replace(/\s/g, ''), 10) : null;

  return {
    pozice: titul,
    firma,
    lokalita: lokalita || null,
    plat_uveden,
    plat_od,
    plat_do,
    tracking_url: odkaz[1],
  };
}

/**
 * @param {string} plaintextBody  tělo e-mailu (PLAIN_TEXT formát z Gmailu)
 * @param {string} zdroj          'jobs.cz' | 'prace.cz' — podle odesílatele
 * @returns pole nabídek, bez duplicit v rámci jednoho e-mailu (stejný titul+firma)
 */
export function parsujAlert(plaintextBody, zdroj) {
  const nalezene = [];
  const videne = new Set();

  for (const radek of plaintextBody.split('\n')) {
    const n = rozparsujRadek(radek);
    if (!n) continue;
    const klic = `${n.pozice.toLowerCase()}::${n.firma.toLowerCase()}`;
    if (videne.has(klic)) continue; // stejná nabídka se v jednom digestu občas opakuje
    videne.add(klic);
    nalezene.push({ ...n, zdroj });
  }

  return nalezene;
}
