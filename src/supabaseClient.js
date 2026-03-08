import { createClient } from "@supabase/supabase-js";

// --- CONFIGURATION START ---
// Replace the values below with your actual Supabase project URL and Public API Key
const SUPABASE_URL = "https://zlosfguyccilaigcchpc.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_S7fk6HEqhjzrUNMODWjtLA_9o2vefC_";
// --- CONFIGURATION END ---

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
