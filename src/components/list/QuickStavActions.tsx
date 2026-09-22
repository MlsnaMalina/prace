"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateStav } from "@/lib/actions/nabidky";

type RychlyStav = "zamitnuto" | "archiv";

export function QuickStavActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [akce, setAkce] = useState<RychlyStav | null>(null);

  function nastavit(stav: RychlyStav) {
    setAkce(stav);
    startTransition(async () => {
      await updateStav(id, stav);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={pending}
        onClick={() => nastavit("zamitnuto")}
        className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:border-gray-400 hover:text-gray-900 disabled:opacity-50"
      >
        {pending && akce === "zamitnuto" ? "Ukládá se…" : "Zamítnout"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => nastavit("archiv")}
        className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:border-gray-400 hover:text-gray-900 disabled:opacity-50"
      >
        {pending && akce === "archiv" ? "Ukládá se…" : "Archivovat"}
      </button>
    </div>
  );
}
