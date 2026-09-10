"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseClient } from "../supabase/client";
import {
  updateDatumReakceInputSchema,
  updatePoznamkaInputSchema,
  updateStavInputSchema,
  updateZpusobReakceInputSchema,
} from "../validation";

export type AkceVysledek = { ok: true } | { ok: false; chyba: string };

export async function updateStav(
  id: string,
  stav: string,
): Promise<AkceVysledek> {
  const parsed = updateStavInputSchema.safeParse({ id, stav });
  if (!parsed.success) {
    return { ok: false, chyba: "Neplatná hodnota stavu." };
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("nabidky")
    .update({ stav: parsed.data.stav })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("Uložení stavu selhalo:", error.message);
    return { ok: false, chyba: "Uložení se nepovedlo, zkuste to prosím znovu." };
  }

  revalidatePath("/");
  revalidatePath(`/nabidky/${parsed.data.id}`);
  return { ok: true };
}

export async function updateDatumReakce(
  id: string,
  datum: string | null,
): Promise<AkceVysledek> {
  const parsed = updateDatumReakceInputSchema.safeParse({ id, datum });
  if (!parsed.success) {
    return { ok: false, chyba: "Neplatné datum." };
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("nabidky")
    .update({ datum_reakce: parsed.data.datum })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("Uložení data reakce selhalo:", error.message);
    return { ok: false, chyba: "Uložení se nepovedlo, zkuste to prosím znovu." };
  }

  revalidatePath("/");
  revalidatePath(`/nabidky/${parsed.data.id}`);
  return { ok: true };
}

export async function updateZpusobReakce(
  id: string,
  zpusob: string,
): Promise<AkceVysledek> {
  const parsed = updateZpusobReakceInputSchema.safeParse({ id, zpusob });
  if (!parsed.success) {
    return { ok: false, chyba: "Text je moc dlouhý." };
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("nabidky")
    .update({ zpusob_reakce: parsed.data.zpusob })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("Uložení způsobu reakce selhalo:", error.message);
    return { ok: false, chyba: "Uložení se nepovedlo, zkuste to prosím znovu." };
  }

  revalidatePath("/");
  revalidatePath(`/nabidky/${parsed.data.id}`);
  return { ok: true };
}

export async function updatePoznamka(
  id: string,
  poznamka: string,
): Promise<AkceVysledek> {
  const parsed = updatePoznamkaInputSchema.safeParse({ id, poznamka });
  if (!parsed.success) {
    return { ok: false, chyba: "Poznámka je moc dlouhá." };
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("nabidky")
    .update({ poznamka: parsed.data.poznamka })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("Uložení poznámky selhalo:", error.message);
    return { ok: false, chyba: "Uložení se nepovedlo, zkuste to prosím znovu." };
  }

  revalidatePath("/");
  revalidatePath(`/nabidky/${parsed.data.id}`);
  return { ok: true };
}
