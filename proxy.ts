import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                request.cookies.set(name, value)
              } catch (e) {
                console.error(`[v0] Failed to set cookie ${name}:`, e)
              }
            })
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                response.cookies.set(name, value, options)
              } catch (e) {
                console.error(`[v0] Failed to set response cookie ${name}:`, e)
              }
            })
          } catch (e) {
            console.error("[v0] Cookie setting error:", e)
          }
        },
      },
    },
  )

  try {
    // Refresh session if expired
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Only redirect logged-in users away from auth pages
    if (
      user &&
      (request.nextUrl.pathname.startsWith("/auth/login") || request.nextUrl.pathname.startsWith("/auth/signup"))
    ) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  } catch (e) {
    console.error("[v0] Auth check error:", e)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
