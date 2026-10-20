import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigIncomplete = Boolean(supabaseUrl) !== Boolean(supabaseAnonKey);
let validSupabaseUrl = false;

if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    validSupabaseUrl = url.protocol === "https:" || url.protocol === "http:";
  } catch {
    validSupabaseUrl = false;
  }
}

export const supabaseConfigError = supabaseConfigIncomplete
  ? "Set both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  : supabaseUrl && !validSupabaseUrl
    ? "VITE_SUPABASE_URL must be a complete URL beginning with https://. Copy the Project URL from Supabase Project Settings → API."
    : !supabaseAnonKey
      ? "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
      : "";

export const supabase = supabaseUrl && supabaseAnonKey && validSupabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
