import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // TODO: Implémenter authentification avec Prisma
  // Pour l'instant, laisser passer toutes les requêtes
  
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
