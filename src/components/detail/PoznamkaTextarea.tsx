"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { updatePoznamka } from "@/lib/actions/nabidky";
import { SaveStatus } from "../ui/SaveStatus";
import type { UlozStav } from "../ui/SaveStatus";

const DEBOUNCE_MS = 1500;

export function PoznamkaTextarea({
  id,
  initialPoznamka,
}: {
  id: string;
  initialPoznamka: string | null;
}) {
  const [hodnota, setHodnota] = useState(initialPoznamka ?? "");
  const [stav, setStav] = useState<UlozStav>("idle");
  const [, startTransition] = useTransition();
  const posledniUlozena = useRef(initialPoznamka ?? "");
  const casovac = useRef<ReturnType<typeof setTimeout> | null>(null);

  function ulozit(hodnotaKUlozeni: string) {
    if (hodnotaKUlozeni === posledniUlozena.current) return;
    setStav("saving");
    startTransition(async () => {
      const vysledek = await updatePoznamka(id, hodnotaKUlozeni);
      if (vysledek.ok) {
        posledniUlozena.current = hodnotaKUlozeni;
        setStav("saved");
        setTimeout(() => setStav("idle"), 2500);
      } else {
        setStav("error");
      }
    });
  }

  function onChange(nova: string) {
    setHodnota(nova);
    if (casovac.current) clearTimeout(casovac.current);
    casovac.current = setTimeout(() => ulozit(nova), DEBOUNCE_MS);
  }

  function onBlur() {
    if (casovac.current) {
      clearTimeout(casovac.current);
      casovac.current = null;
    }
    ulozit(hodnota);
  }

  useEffect(() => {
    return () => {
      if (casovac.current) clearTimeout(casovac.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <textarea
        value={hodnota}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        rows={4}
        placeholder="Poznámka…"
        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
      />
      <SaveStatus status={stav} />
    </div>
  );
}
