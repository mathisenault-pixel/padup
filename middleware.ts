import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  console.log(`[Middleware] 📍 Request: ${path}`)

  // EXCLURE EXPLICITEMENT les pages publiques (éviter les boucles)
  const publicPaths = [
    '/club',
    '/club/login',
    '/club/auth/login',
    '/club/auth/signup',
    '/club/signup',
    '/club-access',
  ]
  
  if (publicPaths.includes(path) || path.startsWith('/club/invite/')) {
    console.log(`[Middleware] ✅ Route publique explicite: ${path}`)
    return NextResponse.next()
  }

  // PROTÉGÉ: /club/dashboard et /club/hangar/dashboard
  const isProtectedRoute = path.startsWith("/club/dashboard") || path.startsWith("/club/hangar/dashboard")
  
  if (!isProtectedRoute) {
    console.log(`[Middleware] ✅ Route non protégée: ${path}`)
    return NextResponse.next()
  }

  // Vérifier si l'utilisateur a un token Supabase
  const cookies = req.cookies
  let hasAuthToken = false

  cookies.getAll().forEach(cookie => {
    if (cookie.name.includes('sb-') && cookie.name.includes('auth-token')) {
      hasAuthToken = true
    }
  })

  if (!hasAuthToken) {
    console.log(`[Middleware] ❌ Pas de token auth sur route protégée -> redirect /club`)
    const url = req.nextUrl.clone()
    url.pathname = "/club"
    return NextResponse.redirect(url)
  }

  console.log(`[Middleware] ✅ Token trouvé -> accès autorisé`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protéger /club/dashboard et /club/hangar/dashboard (et leurs sous-routes)
    "/club/dashboard/:path*",
    "/club/hangar/dashboard/:path*",
  ],
}
