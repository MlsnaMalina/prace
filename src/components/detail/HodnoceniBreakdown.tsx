import { HodnoceniItem } from "./HodnoceniItem";
import type { HodnoceniPolozka } from "@/lib/types";

export function HodnoceniBreakdown({ polozky }: { polozky: HodnoceniPolozka[] }) {
  return (
    <div className="border border-gray-200 px-4">
      {polozky.map((p) => (
        <HodnoceniItem key={p.kriterium} polozka={p} />
      ))}
    </div>
  );
}
