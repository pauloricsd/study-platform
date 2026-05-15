import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Skip auth entirely if Supabase is not configured (mock/dev mode)
const isConfigured =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("your-project");

export async function middleware(request: NextRequest) {
  if (!isConfigured) return NextResponse.next({ request });

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    let user = null;
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      // Auth service unreachable — treat as unauthenticated
    }

    const { pathname } = request.nextUrl;
    const isPublic =
      pathname === "/login" ||
      pathname.startsWith("/cadastro") ||
      pathname.startsWith("/convite") ||
      pathname.startsWith("/recuperar-senha") ||
      pathname.startsWith("/nova-senha") ||
      pathname.startsWith("/auth/");

    if (!user && !isPublic) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user && isPublic && !pathname.startsWith("/convite")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const dest = profile?.role === "student" ? "/estudar" : "/";
      return NextResponse.redirect(new URL(dest, request.url));
    }

    return supabaseResponse;
  } catch {
    // Middleware crashed — pass through without auth
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
