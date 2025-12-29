import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
    throw new Error(`Invalid/Missing NEXT_PUBLIC_SUPABASE_URL on server: ${supabaseUrl}`)
  }
  if (!supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY on server")
  }

  return createServerClient(supabaseUrl.trim(), supabaseKey.trim(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options)
            } catch (e) {
              console.error(`[v0] Failed to set cookie ${name}:`, e)
            }
          })
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have proxy refreshing
          // user sessions.
        }
      },
    },
  })
}
