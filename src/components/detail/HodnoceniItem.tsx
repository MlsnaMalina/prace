import { HodnoceniBadge } from "../ui/Badge";
import type { HodnoceniPolozka } from "@/lib/types";

export function HodnoceniItem({ polozka }: { polozka: HodnoceniPolozka }) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 py-2.5 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-gray-900">{polozka.kriterium}</span>
        <div className="flex items-center gap-2">
          <HodnoceniBadge stav={polozka.stav} />
          {polozka.srazka !== 0 && (
            <span className="text-xs text-gray-400">
              {/* srazka je vždy nezáporná velikost dopadu (viz zadání: "horsi","srazka":21) —
                  znaménko se odvozuje ze stavu, ne ze znaménka srazky, aby "horší" nikdy
                  nevypadalo jako bonus. */}
              {polozka.stav === "lepsi" ? "+" : polozka.stav === "horsi" ? "−" : ""}
              {Math.abs(polozka.srazka)} b.
            </span>
          )}
        </div>
      </div>
      {polozka.poznamka && <p className="text-sm text-gray-600">{polozka.poznamka}</p>}
    </div>
  );
}
