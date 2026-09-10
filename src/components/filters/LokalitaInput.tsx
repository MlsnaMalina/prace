"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function LokalitaInput({ initialHodnota }: { initialHodnota: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hodnota, setHodnota] = useState(initialHodnota);
  const casovac = useRef<ReturnType<typeof setTimeout> | null>(null);

  function zapsatDoUrl(novaHodnota: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (novaHodnota.trim()) {
      params.set("lokalita", novaHodnota.trim());
    } else {
      params.delete("lokalita");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function onChange(nova: string) {
    setHodnota(nova);
    if (casovac.current) clearTimeout(casovac.current);
    casovac.current = setTimeout(() => zapsatDoUrl(nova), 400);
  }

  useEffect(() => {
    return () => {
      if (casovac.current) clearTimeout(casovac.current);
    };
  }, []);

  return (
    <input
      type="text"
      value={hodnota}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Lokalita…"
      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm sm:w-48"
    />
  );
}
