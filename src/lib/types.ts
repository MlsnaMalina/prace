import type { Tables } from "./supabase/database.types";

export const KRITERIA = [
  "Home office",
  "Pružná doba",
  "Plat",
  "Náplň práce",
  "Seniorita a tým",
  "Dojezd",
] as const;

export type Kriterium = (typeof KRITERIA)[number];

export const HODNOCENI_STAV = ["horsi", "stejne", "lepsi"] as const;
export type HodnoceniStav = (typeof HODNOCENI_STAV)[number];

export type HodnoceniPolozka = {
  kriterium: Kriterium;
  stav: HodnoceniStav;
  srazka: number;
  poznamka: string;
};

export const STAV_NABIDKY = [
  "novy",
  "k_zvazeni",
  "prihlaseno",
  "zamitnuto",
  "archiv",
] as const;
export type StavNabidky = (typeof STAV_NABIDKY)[number];

// "portal" = výpis nabídek na jobs.cz. Nahradil kanál "alert" (e-mailové alerty),
// ze kterého nešlo získat skutečnou URL nabídky bez modelu — hodnota ale zůstává,
// protože řádky zapsané do 24. 9. 2026 ji mají.
export const ZDROJ = [
  "portal",
  "karierni_stranka",
  "alert",
  "rucni_hledani",
] as const;
export type Zdroj = (typeof ZDROJ)[number];

export const PRACOVNI_CESTY = [
  "zadne",
  "bez_prespani",
  "s_prespanim",
  "opakovane",
  "neuvedeno",
] as const;
export type PracovniCesty = (typeof PRACOVNI_CESTY)[number];

export const STAV_LABELS: Record<StavNabidky, string> = {
  novy: "Nový",
  k_zvazeni: "K zvážení",
  prihlaseno: "Přihlášeno",
  zamitnuto: "Zamítnuto",
  archiv: "Archiv",
};

export const HODNOCENI_STAV_LABELS: Record<HodnoceniStav, string> = {
  horsi: "horší",
  stejne: "stejné",
  lepsi: "lepší",
};

export const PRACOVNI_CESTY_LABELS: Record<PracovniCesty, string> = {
  zadne: "žádné",
  bez_prespani: "bez přespání",
  s_prespanim: "s přespáním",
  opakovane: "opakované",
  neuvedeno: "neuvedeno",
};

export const ZDROJ_LABELS: Record<Zdroj, string> = {
  portal: "jobs.cz",
  karierni_stranka: "kariérní stránka",
  alert: "e-mailový alert",
  rucni_hledani: "ruční hledání",
};

export const BEH_STAV = ["bezi", "hotovo", "chyba"] as const;
export type BehStav = (typeof BEH_STAV)[number];

export type Beh = Omit<Tables<"behy">, "stav"> & { stav: BehStav };

// Řádek z DB s hodnoceni/stav/pracovni_cesty/zdroj zúženými z obecných DB typů
// na přesné výčty appky (ověřuje se přes zod při čtení, viz validation.ts).
export type Nabidka = Omit<
  Tables<"nabidky">,
  "hodnoceni" | "stav" | "pracovni_cesty" | "zdroj"
> & {
  hodnoceni: HodnoceniPolozka[];
  stav: StavNabidky;
  pracovni_cesty: PracovniCesty;
  zdroj: Zdroj | null;
};
