import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

// Use the auth.admin.listUsers as proof the key works, then try the REST query endpoint
const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1 });
console.log("Auth OK, user count:", users?.users?.length);

// Apply migration via the database REST endpoint
const query = `ALTER TABLE public.study_packs ADD COLUMN IF NOT EXISTS feedback_mode TEXT NOT NULL DEFAULT 'immediate' CHECK (feedback_mode IN ('immediate', 'adaptive'))`;

const res = await fetch(`${url}/rest/v1/rpc/query`, {
  method: "POST",
  headers: { "apikey": key, "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});
const text = await res.text();
console.log("Status:", res.status, "Response:", text);
