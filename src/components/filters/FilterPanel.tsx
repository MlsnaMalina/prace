import {
  HOME_OFFICE_KLICE,
  HOME_OFFICE_LABELS,
  PLAT_UVEDEN_KLICE,
  PLAT_UVEDEN_LABELS,
  PRUZNA_DOBA_KLICE,
  PRUZNA_DOBA_LABELS,
  SKORE_PASMA,
  SKORE_PASMO_KLICE,
  countActiveFilters,
} from "@/lib/filters";
import type { NabidkyFilters, RawSearchParams } from "@/lib/filters";
import { PRACOVNI_CESTY, PRACOVNI_CESTY_LABELS, STAV_LABELS, STAV_NABIDKY } from "@/lib/types";
import { FilterChipLink } from "./FilterChipLink";
import { LokalitaInput } from "./LokalitaInput";
import { StitkyFilter } from "./StitkyFilter";

function Skupina({ nazev, children }: { nazev: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-500">{nazev}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function FilterPanel({
  filters,
  searchParams,
  dostupneStitky,
}: {
  filters: NabidkyFilters;
  searchParams: RawSearchParams;
  dostupneStitky: string[];
}) {
  const pocetAktivnich = countActiveFilters(filters);

  return (
    <details className="border border-gray-200" open={pocetAktivnich > 0}>
      <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-medium text-gray-900">
        Filtry{pocetAktivnich > 0 ? ` (${pocetAktivnich})` : ""}
      </summary>
      <div className="flex flex-col gap-4 border-t border-gray-200 px-4 py-4">
        <Skupina nazev="Skóre">
          {SKORE_PASMO_KLICE.map((k) => (
            <FilterChipLink
              key={k}
              searchParams={searchParams}
              paramKey="skore"
              value={k}
              currentValues={filters.skorePasma}
              label={SKORE_PASMA[k].label}
            />
          ))}
        </Skupina>

        <Skupina nazev="Stav">
          {STAV_NABIDKY.map((s) => (
            <FilterChipLink
              key={s}
              searchParams={searchParams}
              paramKey="stav"
              value={s}
              currentValues={filters.stavy}
              label={STAV_LABELS[s]}
            />
          ))}
        </Skupina>

        <Skupina nazev="Home office">
          {HOME_OFFICE_KLICE.map((k) => (
            <FilterChipLink
              key={k}
              searchParams={searchParams}
              paramKey="ho"
              value={k}
              currentValues={filters.homeOffice}
              label={HOME_OFFICE_LABELS[k]}
            />
          ))}
        </Skupina>

        <Skupina nazev="Pružná doba">
          {PRUZNA_DOBA_KLICE.map((k) => (
            <FilterChipLink
              key={k}
              searchParams={searchParams}
              paramKey="pruzna"
              value={k}
              currentValues={filters.pruznaDoba}
              label={PRUZNA_DOBA_LABELS[k]}
            />
          ))}
        </Skupina>

        <Skupina nazev="Pracovní cesty">
          {PRACOVNI_CESTY.map((k) => (
            <FilterChipLink
              key={k}
              searchParams={searchParams}
              paramKey="cesty"
              value={k}
              currentValues={filters.pracovniCesty}
              label={PRACOVNI_CESTY_LABELS[k]}
            />
          ))}
        </Skupina>

        <Skupina nazev="Plat uveden">
          {PLAT_UVEDEN_KLICE.map((k) => (
            <FilterChipLink
              key={k}
              searchParams={searchParams}
              paramKey="plat"
              value={k}
              currentValues={filters.platUveden}
              label={PLAT_UVEDEN_LABELS[k]}
            />
          ))}
        </Skupina>

        <Skupina nazev="Lokalita">
          <LokalitaInput initialHodnota={filters.lokalita} />
        </Skupina>

        {dostupneStitky.length > 0 && (
          <Skupina nazev="Štítky">
            <StitkyFilter
              dostupneStitky={dostupneStitky}
              vybraneStitky={filters.stitky}
              searchParams={searchParams}
            />
          </Skupina>
        )}
      </div>
    </details>
  );
}
