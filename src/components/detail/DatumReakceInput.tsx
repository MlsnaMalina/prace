"use client";

import { useState, useTransition } from "react";
import { updateDatumReakce } from "@/lib/actions/nabidky";
import { SaveStatus } from "../ui/SaveStatus";
import type { UlozStav } from "../ui/SaveStatus";

export function DatumReakceInput({
  id,
  initialDatum,
}: {
  id: string;
  initialDatum: string | null;
}) {
  const [hodnota, setHodnota] = useState(initialDatum ?? "");
  const [stav, setStav] = useState<UlozStav>("idle");
  const [, startTransition] = useTransition();

  function onChange(nova: string) {
    const puvodni = hodnota;
    setHodnota(nova);
    setStav("saving");
    startTransition(async () => {
      const vysledek = await updateDatumReakce(id, nova || null);
      if (vysledek.ok) {
        setStav("saved");
        setTimeout(() => setStav("idle"), 2500);
      } else {
        setHodnota(puvodni);
        setStav("error");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="date"
        value={hodnota}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm"
      />
      {hodnota && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-800"
        >
          Smazat
        </button>
      )}
      <SaveStatus status={stav} />
    </div>
  );
}
