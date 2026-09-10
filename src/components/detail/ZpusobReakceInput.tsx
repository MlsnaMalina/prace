"use client";

import { useState, useTransition } from "react";
import { updateZpusobReakce } from "@/lib/actions/nabidky";
import { SaveStatus } from "../ui/SaveStatus";
import type { UlozStav } from "../ui/SaveStatus";

export function ZpusobReakceInput({
  id,
  initialZpusob,
}: {
  id: string;
  initialZpusob: string | null;
}) {
  const [hodnota, setHodnota] = useState(initialZpusob ?? "");
  const [stav, setStav] = useState<UlozStav>("idle");
  const [, startTransition] = useTransition();
  const posledniUlozena = initialZpusob ?? "";

  function onBlur() {
    if (hodnota === posledniUlozena) return;
    setStav("saving");
    startTransition(async () => {
      const vysledek = await updateZpusobReakce(id, hodnota);
      if (vysledek.ok) {
        setStav("saved");
        setTimeout(() => setStav("idle"), 2500);
      } else {
        setStav("error");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={hodnota}
        onChange={(e) => setHodnota(e.target.value)}
        onBlur={onBlur}
        placeholder="např. e-mail z zlatenkak@gmail.com, formulář na webu…"
        className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm sm:w-auto sm:flex-1"
      />
      <SaveStatus status={stav} />
    </div>
  );
}
