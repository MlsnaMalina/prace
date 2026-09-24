"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseClient } from "../supabase/client";
import type { Beh, BehStav } from "../types";

/**
 * Spuštění hledání z tlačítka HLEDEJ PRÁCI.
 *
 * Appka sama nic nestahuje ani nezapisuje — jen řekne GitHub Actions, ať se
 * rozběhne workflow `hledani.yml`. Důvod je dvojí: funkce na Vercelu má limit
 * řádově desítek sekund (samotné slušné projití firem trvá minuty) a appka
 * zásadně nepracuje se service_role klíčem, který je k zápisu nabídek potřeba.
 *
 * Appka o výsledku ví z tabulky `behy`, do které smí jen číst.
 */

// Appka běží na veřejné adrese bez přihlášení, takže tlačítko může zmáčknout
// kdokoliv, kdo adresu zná. Tohle je jediná pojistka proti tomu, aby takové
// klikání protočilo kredit u modelu.
const MIN_PAUZA_MINUT = 10;
const MAX_BEHU_ZA_DEN = 12;
const BEH_ZASEKNUTY_PO_MINUTACH = 45;

export type HledaniVysledek =
  | { ok: true; zprava: string }
  | { ok: false; chyba: string };

function minutOd(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 60000;
}

export async function posledniBeh(): Promise<Beh | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("behy")
    .select("*")
    .order("spusteno", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Načtení posledního běhu selhalo:", error.message);
    return null;
  }
  if (!data) return null;

  // Běh, který se nikdy nedokončil (spadlý runner), se po čase přestane
  // tvářit jako běžící — jinak by tlačítko zůstalo zablokované napořád.
  const zaseknuty =
    data.stav === "bezi" && minutOd(data.spusteno) > BEH_ZASEKNUTY_PO_MINUTACH;

  return {
    ...data,
    stav: (zaseknuty ? "chyba" : data.stav) as BehStav,
  };
}

async function behuDnes(): Promise<number> {
  const supabase = createSupabaseClient();
  const od = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count, error } = await supabase
    .from("behy")
    .select("id", { count: "exact", head: true })
    .eq("zdroj", "tlacitko")
    .gte("spusteno", od);

  if (error) {
    console.error("Počítání běhů selhalo:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function spustHledani(): Promise<HledaniVysledek> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (!token || !repo) {
    console.error("Chybí GITHUB_TOKEN nebo GITHUB_REPO v prostředí.");
    return { ok: false, chyba: "Hledání není nastavené. Chybí přístup ke GitHubu." };
  }

  const posledni = await posledniBeh();

  if (posledni?.stav === "bezi") {
    return { ok: false, chyba: "Hledání už běží. Chvíli to potrvá." };
  }
  if (posledni && minutOd(posledni.spusteno) < MIN_PAUZA_MINUT) {
    const zbyva = Math.ceil(MIN_PAUZA_MINUT - minutOd(posledni.spusteno));
    return { ok: false, chyba: `Hledání proběhlo právě teď. Zkuste to za ${zbyva} min.` };
  }
  if ((await behuDnes()) >= MAX_BEHU_ZA_DEN) {
    return { ok: false, chyba: "Denní limit hledání vyčerpán. Zkuste to zítra." };
  }

  const odpoved = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/hledani.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: "main", inputs: { rezim: "plny" } }),
      cache: "no-store",
    },
  );

  if (!odpoved.ok) {
    // Text odpovědi jde do logu, ne k uživatelce — může obsahovat detaily o repozitáři.
    console.error("Spuštění workflow selhalo:", odpoved.status, await odpoved.text());
    return { ok: false, chyba: "Hledání se nepodařilo spustit. Zkuste to prosím znovu." };
  }

  revalidatePath("/");
  return { ok: true, zprava: "Hledání běží. Trvá zhruba tři až deset minut." };
}
