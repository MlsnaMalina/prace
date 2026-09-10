import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase/client";
import { extractDistinctTags, nabidkyQuery, parseFilters } from "@/lib/filters";
import type { StavNabidky } from "@/lib/types";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { SortToggle } from "@/components/list/SortToggle";
import { ResultCount } from "@/components/list/ResultCount";
import { NabidkaListItem } from "@/components/list/NabidkaListItem";

export default async function Page({ searchParams }: PageProps<"/">) {
  const resolvedSearchParams = await searchParams;
  const filters = parseFilters(resolvedSearchParams);
  const supabase = createSupabaseClient();

  const [filteredResult, totalResult, tagsResult] = await Promise.all([
    nabidkyQuery(supabase, filters),
    supabase.from("nabidky").select("*", { count: "exact", head: true }),
    supabase.from("nabidky").select("stitky"),
  ]);

  if (filteredResult.error) {
    throw new Error(filteredResult.error.message);
  }

  // stav je vynucen CHECK constraintem v DB, takže je bezpečné ho tu zúžit —
  // detail nabídky navíc validuje sloupec hodnoceni, který takhle krytý není.
  const nabidky = (filteredResult.data ?? []).map((row) => ({
    ...row,
    stav: row.stav as StavNabidky,
  }));

  const celkem = totalResult.count ?? 0;
  const dostupneStitky = extractDistinctTags(tagsResult.data ?? []);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold text-gray-900">Pracovní nabídky</h1>
        <Link
          href="/prehled"
          className="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-800"
        >
          Přehled
        </Link>
      </div>

      <FilterPanel
        filters={filters}
        searchParams={resolvedSearchParams}
        dostupneStitky={dostupneStitky}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <ResultCount zobrazeno={nabidky.length} celkem={celkem} />
        <SortToggle aktualni={filters.razeni} searchParams={resolvedSearchParams} />
      </div>

      {nabidky.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          Žádná nabídka neodpovídá zvoleným filtrům.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {nabidky.map((n) => (
            <NabidkaListItem key={n.id} nabidka={n} />
          ))}
        </ul>
      )}
    </main>
  );
}
