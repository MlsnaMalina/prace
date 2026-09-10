import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Chybí SUPABASE_URL nebo SUPABASE_ANON_KEY v prostředí.");
  }

  return createClient<Database, { PostgrestVersion: "14.5" }>(
    supabaseUrl,
    supabaseAnonKey,
    { auth: { persistSession: false } },
  );
}
