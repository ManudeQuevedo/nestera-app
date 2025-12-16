import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/settings', '/onboarding']

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
          cookiesToSet.forEach(({ name, value }) =>
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

  // Check if this is a protected route
  // Handle locale prefixes (e.g., /en/dashboard, /es/dashboard)
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => {
    const localePath = pathname.match(/^\/(?:en|es)(\/.*)?$/);
    const pathWithoutLocale = localePath ? localePath[1] || "/" : pathname;
    
    // Check for exact match or sub-paths
    return (
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
    );
  });

  // No user and trying to access protected route -> redirect to login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    // Persist locale if present
    const localeMatch = pathname.match(/^\/(en|es)/);
    const locale = localeMatch ? localeMatch[1] : "en";
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  // User exists, but we want 2FA to be optional during onboarding.
  // Check if fully onboarded
  if (user && isProtectedRoute && !pathname.startsWith('/onboarding') && pathname !== '/onboarding') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_onboarded')
        .eq('id', user.id)
        .single();
      
      if (profile && !profile.is_onboarded) {
        const url = request.nextUrl.clone();
        const localeMatch = pathname.match(/^\/(en|es)/);
        const locale = localeMatch ? localeMatch[1] : "en";
        url.pathname = `/${locale}/onboarding`;
        return NextResponse.redirect(url);
      }
  }

  // User is on login page but already authenticated with aal2 -> redirect to dashboard
  if (user && (pathname === "/login" || pathname.match(/^\/(?:en|es)\/login$/))) {
    try {
        const url = request.nextUrl.clone();
        const localeMatch = pathname.match(/^\/(en|es)/);
        const locale = localeMatch ? localeMatch[1] : "en";
        url.pathname = `/${locale}/dashboard`
        return NextResponse.redirect(url);
    } catch (error) {
      // Ignore
    }
  }

  return supabaseResponse;
}
