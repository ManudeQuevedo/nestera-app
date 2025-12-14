import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/auth', '/setup-mfa', '/verify-mfa']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Skip auth checks for static files
  const pathname = request.nextUrl.pathname
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return supabaseResponse
  }

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if this is a public route
  // Handle locale prefixes (e.g., /en/login, /es/login)
  const isPublicRoute = PUBLIC_ROUTES.some((route) => {
    const localePath = pathname.match(/^\/(?:en|es)(\/.*)?$/);
    const pathWithoutLocale = localePath ? localePath[1] || "/" : pathname;
    return (
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
    );
  });

  // No user and trying to access protected route -> redirect to login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    // Persist locale if present
    const localeMatch = pathname.match(/^\/(en|es)/);
    const locale = localeMatch ? localeMatch[1] : "en";
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  // User exists, check MFA status for protected routes
  if (user && !isPublicRoute) {
    try {
      // Get MFA factors and AAL level
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      const hasTOTP = factors?.totp && factors.totp.length > 0;
      const hasVerifiedTOTP =
        factors?.totp?.some((f) => f.status === "verified");

      // No MFA enrolled -> redirect to setup
      if (!hasTOTP || !hasVerifiedTOTP) {
        const url = request.nextUrl.clone();
        const localeMatch = pathname.match(/^\/(en|es)/);
        const locale = localeMatch ? localeMatch[1] : "en";
        url.pathname = `/${locale}/setup-mfa`;
        return NextResponse.redirect(url);
      }

      // Has MFA but session is aal1 -> redirect to verify
      if (aalData?.currentLevel !== "aal2") {
        const url = request.nextUrl.clone();
        const localeMatch = pathname.match(/^\/(en|es)/);
        const locale = localeMatch ? localeMatch[1] : "en";
        url.pathname = `/${locale}/verify-mfa`;
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // If MFA check fails, allow access (fail open for better UX during development)
      console.error("MFA check error:", error);
    }
  }

  // User is on login page but already authenticated with aal2 -> redirect to home
  if (user && (pathname === "/login" || pathname.match(/^\/(?:en|es)\/login$/))) {
    try {
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel === "aal2") {
        const url = request.nextUrl.clone();
        const localeMatch = pathname.match(/^\/(en|es)/);
        const locale = localeMatch ? localeMatch[1] : "en";
        url.pathname = `/${locale}/dashboard` // Explicitly go to dashboard
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // Ignore
    }
  }

  return supabaseResponse;
}
