/**
 * Migration: add feedback_mode column to study_packs.
 *
 * Usage: node --env-file=.env.local scripts/apply-feedback-mode.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

console.log("Applying feedback_mode migration...");

const { error } = await supabase.rpc("exec_sql", {
  sql: `ALTER TABLE public.study_packs
    ADD COLUMN IF NOT EXISTS feedback_mode TEXT NOT NULL DEFAULT 'immediate'
    CHECK (feedback_mode IN ('immediate', 'adaptive'));`,
});

if (error) {
  // exec_sql RPC may not exist; fall back to raw query via postgrest
  console.warn("exec_sql RPC not available, trying direct approach...");
  console.warn(error.message);

  // Try via the supabase-js admin approach: insert a test pack and update
  // The column addition must be done via the Supabase dashboard SQL editor
  // or the Supabase CLI (`supabase db push`).
  console.log("\nTo apply this migration manually, run the following SQL in the Supabase dashboard:");
  console.log("https://supabase.com/dashboard/project/qkrzwcviofwsbuyrtzrr/sql\n");
  console.log(`ALTER TABLE public.study_packs
  ADD COLUMN IF NOT EXISTS feedback_mode TEXT NOT NULL DEFAULT 'immediate'
  CHECK (feedback_mode IN ('immediate', 'adaptive'));`);
  process.exit(1);
}

console.log("Migration applied successfully.");
console.log("The feedback_mode column has been added to study_packs with default 'immediate'.");
