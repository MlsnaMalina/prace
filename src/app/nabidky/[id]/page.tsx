import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { parseHodnoceni } from "@/lib/validation";
import type { Nabidka, PracovniCesty, StavNabidky, Zdroj } from "@/lib/types";
import { HodnoceniBreakdown } from "@/components/detail/HodnoceniBreakdown";
import { InzeratUryvek } from "@/components/detail/InzeratUryvek";
import { OstatniUdaje } from "@/components/detail/OstatniUdaje";
import { StavSelect } from "@/components/detail/StavSelect";
import { PoznamkaTextarea } from "@/components/detail/PoznamkaTextarea";
import { DatumReakceInput } from "@/components/detail/DatumReakceInput";
import { ZpusobReakceInput } from "@/components/detail/ZpusobReakceInput";
import { SkoreBadge } from "@/components/ui/Badge";

export default async function Page({ params }: PageProps<"/nabidky/[id]">) {
  const { id } = await params;
  const supabase = createSupabaseClient();
  const { data: row, error } = await supabase
    .from("nabidky")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!row) {
    notFound();
  }

  const hodnoceni = parseHodnoceni(row.hodnoceni);

  // pracovni_cesty a zdroj jsou vynucené CHECK constrainty v DB; hodnoceni takhle
  // kryté není, proto se validuje zvlášť výše a v renderu má vlastní fallback.
  const nabidka: Nabidka = {
    ...row,
    hodnoceni: hodnoceni ?? [],
    stav: row.stav as StavNabidky,
    pracovni_cesty: row.pracovni_cesty as PracovniCesty,
    zdroj: row.zdroj as Zdroj | null,
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
        ← Zpět na seznam
      </Link>

      <div className="flex items-start gap-3">
        <SkoreBadge skore={nabidka.skore} />
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{nabidka.pozice}</h1>
          <p className="text-sm text-gray-600">
            {nabidka.firma}
            {nabidka.lokalita ? ` · ${nabidka.lokalita}` : ""}
          </p>
        </div>
      </div>

      {hodnoceni ? (
        <HodnoceniBreakdown polozky={hodnoceni} />
      ) : (
        <p className="border border-gray-200 px-4 py-3 text-sm text-horsi">
          Hodnocení se nepodařilo načíst ve správném tvaru.
        </p>
      )}

      <InzeratUryvek uryvek={nabidka.inzerat_uryvek} url={nabidka.url} />
      <OstatniUdaje nabidka={nabidka} />

      <div className="flex flex-col gap-3 border border-gray-200 px-4 py-3">
        <span className="text-xs font-medium text-gray-500">Vaše hodnocení</span>
        <div>
          <label className="mb-1 block text-sm text-gray-700">Stav</label>
          <StavSelect id={nabidka.id} initialStav={nabidka.stav} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-700">Poznámka</label>
          <PoznamkaTextarea id={nabidka.id} initialPoznamka={nabidka.poznamka} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-700">
            Reakce — kdy a odkud odešel životopis
          </label>
          <div className="flex flex-col gap-2">
            <DatumReakceInput id={nabidka.id} initialDatum={nabidka.datum_reakce} />
            <ZpusobReakceInput id={nabidka.id} initialZpusob={nabidka.zpusob_reakce} />
          </div>
        </div>
      </div>
    </main>
  );
}
