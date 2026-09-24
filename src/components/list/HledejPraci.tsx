"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { posledniBeh, spustHledani } from "@/lib/actions/hledani";
import { formatCasVPraze } from "@/lib/format";
import type { Beh } from "@/lib/types";

const INTERVAL_MS = 8000;

/** Hlášení o doběhnutém běhu. Čísla, ne přídavná jména. */
function vysledek(beh: Beh): string {
  if (beh.stav === "chyba") {
    return beh.chyba ? `Hledání selhalo: ${beh.chyba}` : "Hledání selhalo.";
  }
  if (beh.zapsano === 0) {
    return "Žádná nová nabídka.";
  }
  const nove =
    beh.zapsano === 1 ? "1 nová nabídka" : beh.zapsano < 5 ? `${beh.zapsano} nové nabídky` : `${beh.zapsano} nových nabídek`;
  return beh.k_reakci > 0 ? `${nove}, z toho ${beh.k_reakci} k reakci (85+ bodů).` : `${nove}.`;
}

/** Jeden běh zpracuje omezený počet nabídek, aby se neprotočil kredit u modelu. */
function zbytek(beh: Beh): string | null {
  if (beh.stav !== "hotovo" || beh.zbyva <= 0) return null;
  return `Ve frontě čeká ještě ${beh.zbyva} ${
    beh.zbyva === 1 ? "nabídka" : beh.zbyva < 5 ? "nabídky" : "nabídek"
  } — stiskněte tlačítko znovu.`;
}

export function HledejPraci({ beh }: { beh: Beh | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [stav, setStav] = useState<Beh | null>(beh);
  const [chyba, setChyba] = useState<string | null>(null);
  const bezelo = useRef(beh?.stav === "bezi");

  const bezi = stav?.stav === "bezi";

  // Běh trvá minuty a probíhá úplně jinde (v GitHub Actions), takže se appka
  // musí ptát. Ptá se jen když něco běží — jinak je stránka úplně statická.
  const zkontroluj = useCallback(async () => {
    const novy = await posledniBeh();
    setStav(novy);
    if (bezelo.current && novy?.stav !== "bezi") {
      bezelo.current = false;
      router.refresh();
    }
    if (novy?.stav === "bezi") bezelo.current = true;
  }, [router]);

  useEffect(() => {
    if (!bezi) return;
    const id = setInterval(zkontroluj, INTERVAL_MS);
    return () => clearInterval(id);
  }, [bezi, zkontroluj]);

  function hledat() {
    setChyba(null);
    startTransition(async () => {
      const v = await spustHledani();
      if (!v.ok) {
        setChyba(v.chyba);
        return;
      }
      bezelo.current = true;
      await zkontroluj();
    });
  }

  const popisek = bezi ? "Hledám…" : pending ? "Spouštím…" : "HLEDEJ PRÁCI";

  return (
    <div className="flex flex-col gap-2 border border-gray-200 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={hledat}
          disabled={pending || bezi}
          className="w-full rounded bg-gray-900 px-4 py-2.5 text-sm font-semibold tracking-wide text-white hover:bg-gray-700 disabled:bg-gray-400 sm:w-auto"
        >
          {popisek}
        </button>

        {stav && !bezi && (
          <p className="text-xs text-gray-500">
            Naposledy {formatCasVPraze(stav.spusteno)}
          </p>
        )}
      </div>

      {bezi ? (
        <p role="status" aria-live="polite" className="text-sm text-gray-600">
          Procházím jobs.cz a kariérní stránky firem. Trvá to zhruba pět až dvacet minut —
          stránku můžete zavřít, hledání běží dál.
        </p>
      ) : stav ? (
        <div role="status" aria-live="polite" className="flex flex-col gap-1">
          <p className={`text-sm ${stav.stav === "chyba" ? "text-horsi" : "text-gray-600"}`}>
            {vysledek(stav)}
          </p>
          {zbytek(stav) && <p className="text-sm text-gray-600">{zbytek(stav)}</p>}
        </div>
      ) : (
        <p className="text-sm text-gray-600">Hledání zatím neproběhlo.</p>
      )}

      {chyba && (
        <p role="alert" className="text-sm text-horsi">
          {chyba}
        </p>
      )}
    </div>
  );
}
