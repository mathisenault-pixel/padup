import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database, Profile } from './types'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protection de la route /club/dashboard
  if (request.nextUrl.pathname.startsWith('/club/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/club/login'
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'club') {
      const url = request.nextUrl.clone()
      url.pathname = '/club/login'
      return NextResponse.redirect(url)
    }
  }

  // Protection de la route /player (sauf /player/login)
  if (request.nextUrl.pathname === '/player') {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/player/login'
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'player') {
      const url = request.nextUrl.clone()
      url.pathname = '/player/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
