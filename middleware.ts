import { createClient } from '@/utils/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // Check authenticated state
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the pathname of the request
  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up'

  // Debug logging
  console.log('Current path:', pathname)
  console.log('Session exists:', !!session)
  console.log('Is auth page:', isAuthPage)

  // Niet-ingelogde gebruikers mogen alleen bij auth pages komen
  if (!session && !isAuthPage) {
    console.log('Redirecting to /sign-in')
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Ingelogde gebruikers worden doorgestuurd naar dashboard
  if (session) {
    if (isAuthPage || pathname === '/') {
      console.log('Redirecting to /dashboard')
      const dashboardUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
