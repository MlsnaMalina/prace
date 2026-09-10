import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/database.types";
import { PRACOVNI_CESTY, STAV_NABIDKY } from "./types";
import type { PracovniCesty, StavNabidky } from "./types";

export const SKORE_PASMO_KLICE = ["85", "70", "50", "0"] as const;
export type SkorePasmoKlic = (typeof SKORE_PASMO_KLICE)[number];
export const SKORE_PASMA: Record<
  SkorePasmoKlic,
  { label: string; min: number; max: number }
> = {
  "85": { label: "85+", min: 85, max: 100 },
  "70": { label: "70–84", min: 70, max: 84 },
  "50": { label: "50–69", min: 50, max: 69 },
  "0": { label: "pod 50", min: 0, max: 49 },
};

export const HOME_OFFICE_KLICE = ["0", "1", "2", "3+", "neuvedeno"] as const;
export type HomeOfficeKlic = (typeof HOME_OFFICE_KLICE)[number];
export const HOME_OFFICE_LABELS: Record<HomeOfficeKlic, string> = {
  "0": "0 dní",
  "1": "1 den",
  "2": "2 dny",
  "3+": "3+ dny",
  neuvedeno: "neuvedeno",
};

export const PRUZNA_DOBA_KLICE = ["ano", "ne", "neuvedeno"] as const;
export type PruznaDobaKlic = (typeof PRUZNA_DOBA_KLICE)[number];
export const PRUZNA_DOBA_LABELS: Record<PruznaDobaKlic, string> = {
  ano: "ano",
  ne: "ne",
  neuvedeno: "neuvedeno",
};

export const PLAT_UVEDEN_KLICE = ["ano", "ne"] as const;
export type PlatUvedenKlic = (typeof PLAT_UVEDEN_KLICE)[number];
export const PLAT_UVEDEN_LABELS: Record<PlatUvedenKlic, string> = {
  ano: "ano",
  ne: "ne",
};

// Jediný filtr s jiným výchozím stavem než "nic vybráno = nic neomezovat":
// bez parametru v URL se zamítnuté a archivované nabídky skrývají.
export const VYCHOZI_STAVY: StavNabidky[] = ["novy", "k_zvazeni", "prihlaseno"];

export type NabidkyFilters = {
  skorePasma: SkorePasmoKlic[];
  stavy: StavNabidky[];
  homeOffice: HomeOfficeKlic[];
  pruznaDoba: PruznaDobaKlic[];
  pracovniCesty: PracovniCesty[];
  platUveden: PlatUvedenKlic[];
  lokalita: string;
  stitky: string[];
  razeni: "skore" | "datum";
};

function parseList<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T[] {
  if (value === undefined) return [];
  const raw = Array.isArray(value) ? value : value.split(",");
  return raw.filter((v): v is T => (allowed as readonly string[]).includes(v));
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

export function parseFilters(searchParams: RawSearchParams): NabidkyFilters {
  const stavParam = searchParams.stav;
  const stavy =
    stavParam === undefined ? VYCHOZI_STAVY : parseList(stavParam, STAV_NABIDKY);

  const lokalitaParam = searchParams.lokalita;
  const lokalita = typeof lokalitaParam === "string" ? lokalitaParam.trim() : "";

  const stitekParam = searchParams.stitek;
  const stitky = Array.isArray(stitekParam)
    ? stitekParam
    : stitekParam
      ? stitekParam.split(",")
      : [];

  return {
    skorePasma: parseList(searchParams.skore, SKORE_PASMO_KLICE),
    stavy,
    homeOffice: parseList(searchParams.ho, HOME_OFFICE_KLICE),
    pruznaDoba: parseList(searchParams.pruzna, PRUZNA_DOBA_KLICE),
    pracovniCesty: parseList(searchParams.cesty, PRACOVNI_CESTY),
    platUveden: parseList(searchParams.plat, PLAT_UVEDEN_KLICE),
    lokalita,
    stitky,
    razeni: searchParams.razeni === "datum" ? "datum" : "skore",
  };
}

export function nabidkyQuery(
  supabase: SupabaseClient<Database>,
  filters: NabidkyFilters,
) {
  let query = supabase.from("nabidky").select("*");

  if (filters.stavy.length > 0) {
    query = query.in("stav", filters.stavy);
  }

  if (filters.skorePasma.length > 0) {
    const orExpr = filters.skorePasma
      .map((k) => {
        const { min, max } = SKORE_PASMA[k];
        return `and(skore.gte.${min},skore.lte.${max})`;
      })
      .join(",");
    query = query.or(orExpr);
  }

  if (filters.homeOffice.length > 0) {
    const parts = filters.homeOffice.map((k) => {
      if (k === "neuvedeno") return "home_office_dny.is.null";
      if (k === "3+") return "home_office_dny.gte.3";
      return `home_office_dny.eq.${k}`;
    });
    query = query.or(parts.join(","));
  }

  if (filters.pruznaDoba.length > 0) {
    const parts = filters.pruznaDoba.map((k) =>
      k === "neuvedeno" ? "pruzna_doba.is.null" : `pruzna_doba.eq.${k === "ano"}`,
    );
    query = query.or(parts.join(","));
  }

  if (filters.pracovniCesty.length > 0) {
    query = query.in("pracovni_cesty", filters.pracovniCesty);
  }

  if (filters.platUveden.length === 1) {
    query = query.eq("plat_uveden", filters.platUveden[0] === "ano");
  }

  if (filters.lokalita) {
    query = query.ilike("lokalita", `%${filters.lokalita}%`);
  }

  if (filters.stitky.length > 0) {
    query = query.overlaps("stitky", filters.stitky);
  }

  if (filters.razeni === "datum") {
    query = query.order("nalezeno_dne", { ascending: false });
  } else {
    query = query.order("skore", { ascending: false });
  }

  return query;
}

export function extractDistinctTags(rows: { stitky: string[] | null }[]): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    for (const tag of row.stitky ?? []) set.add(tag);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "cs"));
}

// Sestaví odkaz na seznam se zachovanými filtry v URL, jen se změnami dle `zmeny`
// (hodnota null parametr z URL odstraní). Používá se pro filtrovací chipy i řazení,
// aby fungovaly jako obyčejné odkazy bez klientského JS.
export function buildHref(
  current: RawSearchParams,
  zmeny: Record<string, string | null>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    if (value === undefined || key in zmeny) continue;
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, v);
    } else {
      params.set(key, value);
    }
  }
  for (const [key, value] of Object.entries(zmeny)) {
    if (value !== null) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export function countActiveFilters(filters: NabidkyFilters): number {
  let count = 0;
  if (filters.skorePasma.length > 0) count++;
  if (
    filters.stavy.length !== VYCHOZI_STAVY.length ||
    !filters.stavy.every((s) => VYCHOZI_STAVY.includes(s))
  )
    count++;
  if (filters.homeOffice.length > 0) count++;
  if (filters.pruznaDoba.length > 0) count++;
  if (filters.pracovniCesty.length > 0) count++;
  if (filters.platUveden.length > 0) count++;
  if (filters.lokalita) count++;
  if (filters.stitky.length > 0) count++;
  return count;
}
