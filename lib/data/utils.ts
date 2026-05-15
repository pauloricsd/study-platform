export const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("https://") &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("your-project");
