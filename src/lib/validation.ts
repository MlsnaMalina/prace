import { z } from "zod";
import { HODNOCENI_STAV, STAV_NABIDKY } from "./types";
import type { HodnoceniPolozka, Kriterium } from "./types";

function polozka<K extends Kriterium>(kriterium: K) {
  return z.object({
    kriterium: z.literal(kriterium),
    stav: z.enum(HODNOCENI_STAV),
    srazka: z.number(),
    poznamka: z.string(),
  });
}

// Pevné pořadí a sada šesti kritérií dle zadání — automat je musí dodržet.
const hodnoceniSchema = z.tuple([
  polozka("Home office"),
  polozka("Pružná doba"),
  polozka("Plat"),
  polozka("Náplň práce"),
  polozka("Seniorita a tým"),
  polozka("Dojezd"),
]);

// Sloupec hodnoceni (jsonb) nemá tvar vynucený v databázi, takže se ověřuje
// až tady. Automat nad ním appka nemá kontrolu, takže poškozený řádek
// nesmí appku shodit — jen se v detailu zobrazí jako nenačtené.
export function parseHodnoceni(json: unknown): HodnoceniPolozka[] | null {
  const result = hodnoceniSchema.safeParse(json);
  if (!result.success) {
    console.error("Neplatný tvar sloupce hodnoceni:", result.error.message);
    return null;
  }
  return result.data;
}

export const updateStavInputSchema = z.object({
  id: z.uuid(),
  stav: z.enum(STAV_NABIDKY),
});

export const updatePoznamkaInputSchema = z.object({
  id: z.uuid(),
  poznamka: z.string().max(5000),
});

export const updateDatumReakceInputSchema = z.object({
  id: z.uuid(),
  datum: z.iso.date().nullable(),
});

export const updateZpusobReakceInputSchema = z.object({
  id: z.uuid(),
  zpusob: z.string().max(500),
});
