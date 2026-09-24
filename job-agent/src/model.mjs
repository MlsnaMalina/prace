/**
 * Jediné místo v celém procesu, které stojí peníze.
 *
 * Jeden dotaz na jeden inzerát, bez agentní smyčky. Tím se řeší to, kvůli čemu
 * byl denní běh drahý: ve smyčce se s každým voláním nástroje posílá znovu celý
 * dosavadní kontext. Tady žádná smyčka není — jeden dotaz, jedna odpověď, konec.
 *
 * Model dostane jen text inzerátu a vrací jen to, co spočítat nejde:
 *   - je to finanční/controllingová/ekonomická pozice? (brána 2, sekce 6)
 *   - jak blízko je náplň jádru controllingu (sekce 7)
 *   - seniorita (sekce 7)
 *   - úsudkové příznaky: převážně administrativa, rozpor benefitů a popisu
 *
 * Navíc doplňuje údaje, které extrakce.mjs v textu nenašla — ale JEN tehdy,
 * když je nenašla, a jen s doslovnou citací (sekce 10.2). Nalezené číslo z
 * regulárního výrazu má vždycky přednost; model ho nepřepisuje.
 */

import Anthropic from '@anthropic-ai/sdk';

export const MODEL = 'claude-haiku-4-5';

/** Delší inzeráty se ořežou — za touhle hranicí už bývá jen patička a GDPR. */
export const MAX_ZNAKU = 9000;

const SYSTEM = `Posuzuješ pracovní inzeráty pro jednoho konkrétního uchazeče.

Uchazeč: seniorní ekonom, šest let ve státní agentuře, od roku 2023 hlavní ekonom
(rozpočty ~250 mil. Kč, vede tým 11 lidí). Umí finanční plánování a rozpočtování,
forecasting, analýzu odchylek, finanční reporting pro vedení a poskytovatele dotací,
kontrolu čerpání, podklady pro audity, finanční řízení dotačních projektů.
Baví ho nastavování nových procesů. Nebaví ho opakovaná administrativa.

Odpovídáš VÝHRADNĚ voláním nástroje posud_inzeratu. Pravidla:

1. Rozhoduje text popisu pozice, ne seznam benefitů. Personalisté vybírají benefity
   z připraveného seznamu a bývají nepřesné oběma směry.
2. Co v inzerátu není, je neuvedeno. Nikdy nedoplňuj, co si myslíš, že tam asi je.
3. Každý údaj, který doplňuješ do pole *_doplneno, musí mít doslovnou citaci z
   inzerátu v odpovídajícím poli *_citace. Bez citace vrať null.
4. Když si nejsi jistý, jestli jde o finanční pozici, vrať null, ne false.
   Nejistý inzerát se nezahazuje, jen dostane štítek.

Jak rozlišit náplň práce:
- "jadro": controlling, finanční analýza, rozpočtování, forecasting, reporting,
  finanční řízení, analýza odchylek — tedy to, co uchazeč dělá dnes.
- "pribuzna": finanční účetnictví, treasury, fakturace, daně, finanční audit,
  business/finance partnering, dotační administrativa, IT konzultant pro finance.
- "vzdalena": pozice, kde jsou finance jen okrajová část náplně.

Jak rozlišit senioritu: rozhoduje požadovaná praxe a samostatnost, ne název pozice.
Do 2 let praxe nebo výslovně junior/absolvent/trainee = "juniorni".
3-5 let nebo "medior" = "medior". 5+ let, samostatnost, vedení agendy = "seniorni".`;

const NASTROJ = {
  name: 'posud_inzeratu',
  description: 'Zapíše posouzení jednoho pracovního inzerátu.',
  strict: true,
  input_schema: {
    type: 'object',
    properties: {
      je_financni_pozice: {
        type: ['boolean', 'null'],
        description: 'Je to finanční, controllingová nebo ekonomická pozice? null = nejisté.',
      },
      naplne_prace: { type: 'string', enum: ['jadro', 'pribuzna', 'vzdalena'] },
      seniorita: { type: 'string', enum: ['seniorni', 'medior', 'juniorni'] },
      vedeni_tymu: { type: ['boolean', 'null'], description: 'Zahrnuje pozice vedení týmu? null = neuvedeno.' },
      prevazne_administrativa: {
        type: 'boolean',
        description: 'Je inzerát postavený převážně na zpracování, evidenci a opakované administrativě?',
      },
      rozpor_benefity_popis: {
        type: 'boolean',
        description: 'Odporuje si seznam benefitů a popis pozice (typicky u home officu)?',
      },
      home_office_dny_doplneno: {
        type: ['integer', 'null'],
        description: 'Dny home officu TÝDNĚ (0-5). Vyplň jen když to v inzerátu je. Jinak null.',
      },
      home_office_citace: { type: ['string', 'null'] },
      pruzna_doba_doplneno: {
        type: ['boolean', 'null'],
        description: 'Zmiňuje inzerát pružnou/flexibilní pracovní dobu? null = nezmiňuje.',
      },
      pruzna_doba_citace: { type: ['string', 'null'] },
      plat_od_doplneno: {
        type: ['integer', 'null'],
        description: 'Měsíční hrubá mzda v Kč, spodní hranice. Jen skutečná mzda, ne rozpočet na benefity.',
      },
      plat_do_doplneno: { type: ['integer', 'null'] },
      plat_citace: { type: ['string', 'null'] },
      adresa_doplneno: { type: ['string', 'null'], description: 'Adresa nebo městská část pracoviště.' },
      duvod: { type: 'string', description: 'Jedna věta: proč tahle náplň a seniorita. Bez omáčky.' },
    },
    required: [
      'je_financni_pozice', 'naplne_prace', 'seniorita', 'vedeni_tymu',
      'prevazne_administrativa', 'rozpor_benefity_popis',
      'home_office_dny_doplneno', 'home_office_citace',
      'pruzna_doba_doplneno', 'pruzna_doba_citace',
      'plat_od_doplneno', 'plat_do_doplneno', 'plat_citace',
      'adresa_doplneno', 'duvod',
    ],
    additionalProperties: false,
  },
};

let klient;
function dejKlienta() {
  if (!klient) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('Chybí ANTHROPIC_API_KEY.');
    klient = new Anthropic();
  }
  return klient;
}

/**
 * Posoudí jeden inzerát. Vrací { posudek, naklady } nebo vyhodí chybu.
 * Volající chybu zachytí a inzerát zapíše s nejistotou — nikdy se kvůli
 * jednomu selhání nezastaví celý běh.
 */
export async function posudInzerat({ pozice, firma, lokalita, text }, { klient: vlastni } = {}) {
  const c = vlastni ?? dejKlienta();

  const odpoved = await c.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    tools: [NASTROJ],
    tool_choice: { type: 'tool', name: NASTROJ.name },
    messages: [{
      role: 'user',
      content: [
        `POZICE: ${pozice ?? '(neuvedena)'}`,
        `FIRMA: ${firma ?? '(neuvedena)'}`,
        `LOKALITA: ${lokalita ?? '(neuvedena)'}`,
        '',
        'TEXT INZERÁTU:',
        String(text ?? '').slice(0, MAX_ZNAKU),
      ].join('\n'),
    }],
  });

  const blok = odpoved.content.find((b) => b.type === 'tool_use');
  if (!blok) throw new Error(`Model nevrátil posudek (stop_reason: ${odpoved.stop_reason}).`);

  return { posudek: blok.input, naklady: odpoved.usage, model: odpoved.model };
}

/**
 * Sloučí strojovou extrakci s posudkem modelu.
 * Pravidlo: co našel regulární výraz, platí. Model jen zaplňuje díry, a to jen
 * s citací — jinak údaj zůstane neuvedený.
 */
export function sluc(pole, posudek) {
  const doplnene = {};
  const doplnit = (klic, hodnota, citace) => {
    if (hodnota == null || !citace) return;
    doplnene[klic] = citace;
    pole[klic] = hodnota;
  };

  if (pole.home_office_dny == null) {
    doplnit('home_office_dny', posudek.home_office_dny_doplneno, posudek.home_office_citace);
    if (pole.home_office_dny != null) pole.home_office_dny = Math.max(0, Math.min(5, pole.home_office_dny));
  }
  if (pole.pruzna_doba == null) doplnit('pruzna_doba', posudek.pruzna_doba_doplneno, posudek.pruzna_doba_citace);
  if (!pole.plat_uveden && posudek.plat_od_doplneno != null && posudek.plat_citace) {
    pole.plat_uveden = true;
    pole.plat_od = posudek.plat_od_doplneno;
    pole.plat_do = posudek.plat_do_doplneno ?? null;
    doplnene.plat = posudek.plat_citace;
  }
  if (!pole.adresa && posudek.adresa_doplneno) pole.adresa = posudek.adresa_doplneno;

  pole.je_financni_pozice = posudek.je_financni_pozice ?? null;
  pole.naplne_prace = posudek.naplne_prace ?? null;
  pole.seniorita = posudek.seniorita ?? null;
  pole.prevazne_administrativa = posudek.prevazne_administrativa === true;
  pole.rozpor_benefity_popis = posudek.rozpor_benefity_popis === true;
  if (pole.vedeni_tymu == null) pole.vedeni_tymu = posudek.vedeni_tymu ?? null;

  return { pole, doplnene };
}
