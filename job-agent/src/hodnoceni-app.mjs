/**
 * Převod výstupu scoring.mjs do tvaru, který čte appka `prace`.
 *
 * Appka validuje sloupec hodnoceni (jsonb) přes zod: přesně šest položek,
 * v tomhle pořadí, každá { kriterium, stav, srazka, poznamka } — viz
 * src/lib/validation.ts a DO_NOT_CHANGE.md. Dosavadní automat tam zapisoval
 * jiný tvar, takže detail nabídky rozpad hodnocení nikdy nezobrazil a spadl
 * na náhradní text. Tohle to srovnává.
 *
 * Srážka je VŽDY nezáporná velikost dopadu; znaménko nese pole stav. Tak to
 * appka vykresluje (HodnoceniItem.tsx) a tak to má i zadání.
 */

export const KRITERIA = ['Home office', 'Pružná doba', 'Plat', 'Náplň práce', 'Seniorita a tým', 'Dojezd'];

// Položky bodování, které nejsou samostatným kritériem, se přičtou k tomu,
// kam věcně patří — jinak by součet šesti řádků nedal skóre a rozpad by lhal.
const KAM_PATRI = {
  home_office: 'Home office',
  pruzna_doba: 'Pružná doba',
  plat: 'Plat',
  naplne_prace: 'Náplň práce',
  administrativa: 'Náplň práce',
  prirazka_procesy: 'Náplň práce',
  prirazka_firma: 'Náplň práce',
  seniorita: 'Seniorita a tým',
  dojezd: 'Dojezd',
  kombinacni_pravidlo: 'Dojezd',
  pracovni_cesty: 'Dojezd',
};

const CESTY_SLOVY = {
  zadne: 'žádné pracovní cesty',
  bez_prespani: 'pracovní cesty bez přespání',
  s_prespanim: 'pracovní cesty s přespáním',
  opakovane: 'opakované pracovní cesty',
  neuvedeno: 'pracovní cesty neuvedeny',
};

const cislo = (n) => new Intl.NumberFormat('cs-CZ').format(n);

/** Věcné vysvětlení ke každému kritériu. Popisuje nález, ne dojem. */
function poznamky(n, polozky) {
  const bodyZa = (nazev) => polozky.find((p) => p.nazev === nazev)?.body ?? 0;
  const p = {};

  p['Home office'] = n.home_office_dny == null
    ? 'Inzerát počet dní home officu neuvádí. Dnes má 2 dny týdně.'
    : `${n.home_office_dny} ${n.home_office_dny === 1 ? 'den' : n.home_office_dny < 5 ? 'dny' : 'dní'} týdně, dnes má 2.`;
  if (n.ho_az_po_zapracovani) p['Home office'] += ' Až po zapracování.';

  p['Pružná doba'] = n.pruzna_doba
    ? 'Inzerát pružnou pracovní dobu zmiňuje.'
    : 'Inzerát pružnou pracovní dobu nezmiňuje. Dnes si čas řídí sám.';

  if (!n.plat_uveden) {
    p.Plat = 'Plat v inzerátu uveden není.';
  } else if (n.plat_do && n.plat_do !== n.plat_od) {
    p.Plat = `Uvedeno ${cislo(n.plat_od)}–${cislo(n.plat_do)} Kč; boduje se spodní hranice. Dnes bere 55 000 Kč.`;
  } else {
    p.Plat = `Uvedeno ${cislo(n.plat_od)} Kč. Dnes bere 55 000 Kč.`;
  }

  const napln = { jadro: 'Jádro controllingu.', pribuzna: 'Příbuzná oblast, ne jádro controllingu.', vzdalena: 'Od controllingu vzdálená náplň.' };
  const casti = [napln[n.naplne_prace] ?? 'Náplň práce se nepodařilo určit.'];
  if (bodyZa('prirazka_procesy')) casti.push('Zmiňuje nastavování procesů, automatizaci nebo BI (+8).');
  if (bodyZa('prirazka_firma')) casti.push('Firma odpovídá hledanému vzorci (+5).');
  if (bodyZa('administrativa')) casti.push('Postavené převážně na opakované administrativě (−10).');
  p['Náplň práce'] = casti.join(' ');

  const sen = { seniorni: 'Seniorní pozice.', medior: 'Mediorní pozice.', juniorni: 'Juniorní pozice.' };
  p['Seniorita a tým'] = `${sen[n.seniorita] ?? 'Senioritu se nepodařilo určit.'} ${
    n.vedeni_tymu === true ? 'Zahrnuje vedení týmu.' : n.vedeni_tymu === false ? 'Bez vedení týmu — není to podmínka.' : 'Vedení týmu inzerát neřeší.'
  }`;

  const d = [n.dojezd_min == null ? 'Dojezd neověřen.' : `Dojezd ${n.dojezd_min} min z Průhonic.`];
  if (bodyZa('kombinacni_pravidlo')) d.push('Pevná doba přes ranní špičku + dojezd nad 30 min + méně než 2 dny home officu (−20).');
  if (bodyZa('pracovni_cesty')) d.push(`${CESTY_SLOVY[n.pracovni_cesty] ?? 'Pracovní cesty'} (${bodyZa('pracovni_cesty')}).`);
  p.Dojezd = d.join(' ');

  return p;
}

/**
 * @param {object} n      vstupní pole nabídky (tvar PRAZDNA_NABIDKA ze scoring.mjs)
 * @param {Array}  polozky pole { nazev, body } z skoruj()
 * @returns {Array} šest položek ve tvaru, který čte appka
 */
export function proAppku(n, polozky) {
  const soucty = Object.fromEntries(KRITERIA.map((k) => [k, 0]));
  for (const { nazev, body } of polozky) {
    const kam = KAM_PATRI[nazev];
    if (kam) soucty[kam] += body;
  }

  const pozn = poznamky(n, polozky);

  return KRITERIA.map((kriterium) => {
    const body = soucty[kriterium];
    return {
      kriterium,
      stav: body < 0 ? 'horsi' : body > 0 ? 'lepsi' : 'stejne',
      srazka: Math.abs(body),
      poznamka: pozn[kriterium] ?? '',
    };
  });
}
