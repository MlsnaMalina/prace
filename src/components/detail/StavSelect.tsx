"use client";

import { useState, useTransition } from "react";
import { updateStav } from "@/lib/actions/nabidky";
import { STAV_LABELS, STAV_NABIDKY } from "@/lib/types";
import type { StavNabidky } from "@/lib/types";
import { SaveStatus } from "../ui/SaveStatus";
import type { UlozStav } from "../ui/SaveStatus";

export function StavSelect({
  id,
  initialStav,
}: {
  id: string;
  initialStav: StavNabidky;
}) {
  const [hodnota, setHodnota] = useState<StavNabidky>(initialStav);
  const [stav, setStav] = useState<UlozStav>("idle");
  const [, startTransition] = useTransition();

  function onChange(nova: StavNabidky) {
    const puvodni = hodnota;
    setHodnota(nova);
    setStav("saving");
    startTransition(async () => {
      const vysledek = await updateStav(id, nova);
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
      <select
        value={hodnota}
        onChange={(e) => onChange(e.target.value as StavNabidky)}
        className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm"
      >
        {STAV_NABIDKY.map((s) => (
          <option key={s} value={s}>
            {STAV_LABELS[s]}
          </option>
        ))}
      </select>
      <SaveStatus status={stav} />
    </div>
  );
}
