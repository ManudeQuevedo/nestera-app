import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // Force locale prefix for consistency
});

export async function middleware(request: NextRequest) {
  // 1. Run Supabase Auth Middleware
  // This handles session refresh and protected route redirects
  const response = await updateSession(request); // This returns a NextResponse

  // If Supabase triggered a redirect (e.g. to /login), return it immediately
  if (response.headers.has("location")) {
    return response;
  }

  // 2. Run next-intl Middleware
  // This handles locale negotiation and URL rewriting (e.g., / -> /en)
  const intlResponse = intlMiddleware(request);

  // 3. Merge Responses
  // We need to preserve the cookies set by Supabase (session refresh)
  // while returning the response from next-intl (rewrite/routing)

  // Copy cookies from Supabase response to next-intl response
  response.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     * - auth/ (Auth routes)
     * - monitoring (Sentry tunnel - with or without locale prefix)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/|auth/|monitoring|en/monitoring|es/monitoring).*)",
  ],
};
