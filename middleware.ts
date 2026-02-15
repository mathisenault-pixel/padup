import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Log pour debug
  if (pathname.startsWith('/club')) {
    console.log(`[Middleware] 🔍 Request: ${pathname}`)
  }
  
  // Protéger UNIQUEMENT /club/dashboard et ses sous-routes
  if (pathname.startsWith('/club/dashboard')) {
    // Vérifier la présence du token d'auth dans les cookies
    const token = request.cookies.get('sb-eohioutmqfqdehfxgjgv-auth-token')
    
    if (!token) {
      console.log(`[Middleware] ❌ Pas de token sur ${pathname} -> redirect /club`)
      const url = request.nextUrl.clone()
      url.pathname = '/club'
      return NextResponse.redirect(url)
    }
    
    console.log(`[Middleware] ✅ Token OK sur ${pathname}`)
  }
  
  // Toutes les autres routes : laisser passer
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - icon.png (favicon file)
     * - api/ (API routes)
     */
    '/((?!_next/static|_next/image|icon.png|api/).*)',
  ],
}
