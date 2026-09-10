// nalezeno_dne je Postgres 'date' (YYYY-MM-DD) bez času a časové zóny — parsuje se
// čistě textově, ať nehrozí posun dne přes Date/timezone (viz poznámka o UTC v README).
export function formatDatum(isoDatum: string): string {
  const [rok, mesic, den] = isoDatum.split("-");
  return `${Number(den)}. ${Number(mesic)}. ${rok}`;
}

// Dnešní datum podle pražského kalendářního dne, ne podle časové zóny serveru
// (Vercel běží v UTC) — jinak by "dnes"/"tento týden" mohlo těsně kolem půlnoci ujíždět.
export function dnesVPraze(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Prague" }).format(new Date());
}

// Počet dní mezi dvěma daty ve tvaru YYYY-MM-DD — čistě kalendářní rozdíl,
// bez převodu přes Date/timezone (obě hodnoty už jsou dny bez času).
export function dnyMezi(drivejsiDatum: string, pozdejsiDatum: string): number {
  const [r1, m1, d1] = drivejsiDatum.split("-").map(Number);
  const [r2, m2, d2] = pozdejsiDatum.split("-").map(Number);
  const cas1 = Date.UTC(r1, m1 - 1, d1);
  const cas2 = Date.UTC(r2, m2 - 1, d2);
  return Math.round((cas2 - cas1) / 86400000);
}

export function formatPlat(
  platOd: number | null,
  platDo: number | null,
  platUveden: boolean,
): string {
  if (!platUveden || (platOd === null && platDo === null)) {
    return "neuvedeno";
  }
  const fmt = (n: number) => n.toLocaleString("cs-CZ");
  if (platOd !== null && platDo !== null) return `${fmt(platOd)}–${fmt(platDo)} Kč`;
  if (platOd !== null) return `od ${fmt(platOd)} Kč`;
  if (platDo !== null) return `do ${fmt(platDo)} Kč`;
  return "neuvedeno";
}

export function formatHomeOffice(dny: number | null): string {
  if (dny === null) return "neuvedeno";
  if (dny === 0) return "0 dní";
  if (dny === 1) return "1 den";
  if (dny <= 4) return `${dny} dny`;
  return `${dny} dní`;
}

export function formatPruznaDoba(hodnota: boolean | null): string {
  if (hodnota === null) return "neuvedeno";
  return hodnota ? "ano" : "ne";
}
