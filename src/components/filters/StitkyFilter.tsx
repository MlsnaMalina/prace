import { FilterChipLink } from "./FilterChipLink";
import type { RawSearchParams } from "@/lib/filters";

export function StitkyFilter({
  dostupneStitky,
  vybraneStitky,
  searchParams,
}: {
  dostupneStitky: string[];
  vybraneStitky: string[];
  searchParams: RawSearchParams;
}) {
  if (dostupneStitky.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {dostupneStitky.map((stitek) => (
        <FilterChipLink
          key={stitek}
          searchParams={searchParams}
          paramKey="stitek"
          value={stitek}
          currentValues={vybraneStitky}
          label={stitek}
        />
      ))}
    </div>
  );
}
