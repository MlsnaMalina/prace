import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase/client";
import { spocitatSouhrn } from "@/lib/summary";
import { STAV_LABELS, STAV_NABIDKY } from "@/lib/types";

export default async function Page() {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("nabidky")
    .select("stav, nalezeno_dne, datum_reakce");

  if (error) {
    throw new Error(error.message);
  }

  const souhrn = spocitatSouhrn(data ?? []);

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
        ← Zpět na seznam
      </Link>

      <h1 className="text-lg font-semibold text-gray-900">Přehled</h1>

      <div className="flex flex-col divide-y divide-gray-100 border border-gray-200 px-4">
        <Radek label="Celkem nabídek" hodnota={souhrn.celkem} />
        <Radek label="Nových za posledních 7 dní" hodnota={souhrn.novychTyden} />
      </div>

      <div className="flex flex-col divide-y divide-gray-100 border border-gray-200 px-4">
        {STAV_NABIDKY.map((s) => (
          <Radek key={s} label={STAV_LABELS[s]} hodnota={souhrn.podleStavu[s]} />
        ))}
      </div>

      <div className="flex flex-col divide-y divide-gray-100 border border-gray-200 px-4">
        <Radek
          label="Bez reakce déle než 7 dní"
          hodnota={souhrn.bezReakce}
          zvyraznit={souhrn.bezReakce > 0}
        />
      </div>
    </main>
  );
}

function Radek({
  label,
  hodnota,
  zvyraznit,
}: {
  label: string;
  hodnota: number;
  zvyraznit?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-medium ${zvyraznit ? "text-horsi" : "text-gray-900"}`}>
        {hodnota}
      </span>
    </div>
  );
}
