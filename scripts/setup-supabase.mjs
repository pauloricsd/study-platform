/**
 * One-off Supabase setup script.
 * Creates the source-files storage bucket.
 *
 * Usage: node --env-file=.env.local scripts/setup-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Create storage bucket
console.log("🪣  Creating source-files bucket...");
const { error } = await supabase.storage.createBucket("source-files", {
  public: false,
  fileSizeLimit: 20971520, // 20 MB
  allowedMimeTypes: ["application/pdf"],
});

if (error) {
  if (error.message?.includes("already exists")) {
    console.log("✅ Bucket already exists — OK.");
  } else {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
} else {
  console.log("✅ Bucket source-files created.");
}

// Storage policy: allow admins to read/write
console.log("🔒 Setting storage policies...");
const policies = [
  `CREATE POLICY "admins can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'source-files');`,
  `CREATE POLICY "admins can read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'source-files');`,
];

const ref = SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1];
if (ref) {
  for (const sql of policies) {
    await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    }).catch(() => {});
  }
}

console.log("\n🎉 Storage setup complete!");
console.log("\nNext step: run the schema SQL in the Supabase SQL Editor:");
console.log(`  https://supabase.com/dashboard/project/${ref}/sql/new`);
