import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  console.log(`[Middleware] 📍 Request: ${path}`)

  // PUBLIC: Tout sauf /club/dashboard/*
  if (!path.startsWith("/club/dashboard")) {
    console.log(`[Middleware] ✅ Route publique: ${path}`)
    return NextResponse.next()
  }

  // PROTÉGÉ: /club/dashboard/*
  // Vérifier si l'utilisateur a un token Supabase
  const cookies = req.cookies
  let hasAuthToken = false

  // Chercher un cookie Supabase auth (plusieurs formats possibles)
  cookies.getAll().forEach(cookie => {
    if (cookie.name.includes('sb-') && cookie.name.includes('auth-token')) {
      hasAuthToken = true
    }
  })

  if (!hasAuthToken) {
    console.log(`[Middleware] ❌ Pas de token auth -> redirect /club`)
    const url = req.nextUrl.clone()
    url.pathname = "/club"
    return NextResponse.redirect(url)
  }

  console.log(`[Middleware] ✅ Token trouvé -> accès dashboard autorisé`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protéger uniquement /club/dashboard et ses sous-routes
    "/club/dashboard/:path*",
  ],
}
