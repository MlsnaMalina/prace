/**
 * Vytažení odkazů na inzeráty z HTML kariérní stránky.
 *
 * Záměrně hloupé a obecné. Nesnaží se rozumět konkrétnímu ATS — sbírá odkazy,
 * které vypadají jako detail pozice, a nechává rozhodnutí na filtru a na modelu.
 * Jakmile probe ukáže, jak která platforma skutečně vypadá, přibude sem
 * specializovaný adaptér. Do té doby platí: radši víc odkazů než míň.
 */

const VZORY_DETAILU = [
  /\/detail\//i,
  /\/pd\//i,            // jobs.cz / Alma Career
  /\/job[s]?\//i,
  /\/pozice\//i,
  /\/vacancy\//i,
  /\/nabidka\//i,
  /\/nabidky\//i,
  /\/kariera\/[^/]+\/?$/i,
  /\/careers?\/[^/]+\/?$/i,
  /[?&]id=\d+/i,
];

const ZAKAZANE = [
  /\.(pdf|jpg|jpeg|png|gif|svg|css|js|zip|docx?)($|\?)/i,
  /(facebook|twitter|linkedin|instagram|youtube)\.com/i,
  /^mailto:/i,
  /^tel:/i,
  /\/(login|prihlaseni|cookies|gdpr|ochrana-osobnich-udaju)/i,
];

function odstranHtml(s) {
  return s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ').trim();
}

/** Vrací pole { url, nazev } — bez duplicit, s absolutními URL. */
export function vytahniInzeraty(html, zakladniUrl) {
  const nalezene = new Map();
  const re = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let m;
  while ((m = re.exec(html)) !== null) {
    const rawHref = m[1];
    const nazev = odstranHtml(m[2]);

    if (!nazev || nazev.length < 3 || nazev.length > 200) continue;
    if (ZAKAZANE.some((z) => z.test(rawHref))) continue;

    let url;
    try {
      url = new URL(rawHref, zakladniUrl).toString();
    } catch {
      continue;
    }
    url = url.split('#')[0];

    if (!VZORY_DETAILU.some((v) => v.test(url))) continue;
    if (!nalezene.has(url)) nalezene.set(url, { url, nazev });
  }

  return [...nalezene.values()].sort((a, b) => a.url.localeCompare(b.url));
}

/** Hrubý odhad platformy z URL a HTML — jen pro sloupec ats_platforma a pro probe. */
export function odhadniPlatformu(url, html = '') {
  const u = url.toLowerCase();
  const h = html.toLowerCase();
  if (u.includes('.jobs.cz') || h.includes('jobs.cz')) return 'Alma Career';
  if (u.includes('myworkdayjobs.com') || h.includes('workday')) return 'Workday';
  if (u.includes('smartrecruiters')) return 'SmartRecruiters';
  if (u.includes('recruitis') || h.includes('recruitis')) return 'Recruitis';
  if (h.includes('personio')) return 'Personio';
  if (h.includes('successfactors')) return 'SAP SuccessFactors';
  if (h.includes('teamio')) return 'Teamio';
  return null;
}
