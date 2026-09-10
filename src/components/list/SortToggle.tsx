import Link from "next/link";
import { buildHref } from "@/lib/filters";
import type { RawSearchParams } from "@/lib/filters";

const MOZNOSTI = [
  { klic: "skore", label: "Skóre" },
  { klic: "datum", label: "Datum nalezení" },
] as const;

export function SortToggle({
  aktualni,
  searchParams,
}: {
  aktualni: "skore" | "datum";
  searchParams: RawSearchParams;
}) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="text-gray-500">Řadit podle:</span>
      {MOZNOSTI.map((m) => {
        const aktivni = m.klic === aktualni;
        return (
          <Link
            key={m.klic}
            href={buildHref(searchParams, { razeni: m.klic === "skore" ? null : m.klic })}
            className={`rounded border px-2 py-1 ${
              aktivni
                ? "border-gray-400 bg-gray-100 font-medium text-gray-900"
                : "border-transparent text-gray-600 hover:border-gray-300"
            }`}
          >
            {m.label}
          </Link>
        );
      })}
    </div>
  );
}
