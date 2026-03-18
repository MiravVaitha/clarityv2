import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Sliding-window rate limiter (in-memory, per-process)
// ---------------------------------------------------------------------------

interface WindowEntry {
  timestamps: number[]
}

const rateLimitMap = new Map<string, WindowEntry>()

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  const cutoff = now - windowMs
  for (const [key, entry] of rateLimitMap) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff)
    if (entry.timestamps.length === 0) rateLimitMap.delete(key)
  }
}

function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { limited: boolean; remaining: number; resetMs: number } {
  const now = Date.now()
  cleanup(windowMs)

  const entry = rateLimitMap.get(key) ?? { timestamps: [] }
  const cutoff = now - windowMs
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff)

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0]
    return { limited: true, remaining: 0, resetMs: oldestInWindow + windowMs - now }
  }

  entry.timestamps.push(now)
  rateLimitMap.set(key, entry)

  return { limited: false, remaining: maxRequests - entry.timestamps.length, resetMs: windowMs }
}

// ---------------------------------------------------------------------------
// Rate limit configuration per route
// ---------------------------------------------------------------------------

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/bear':           { maxRequests: 30, windowMs: 60_000 },
  '/api/parrot':         { maxRequests: 30, windowMs: 60_000 },
  '/api/delete-account': { maxRequests: 3,  windowMs: 60_000 },
}

const DEFAULT_LIMIT: RateLimitConfig = { maxRequests: 30, windowMs: 60_000 }

function getConfig(pathname: string): RateLimitConfig {
  for (const [prefix, config] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) return config
  }
  return DEFAULT_LIMIT
}

// ---------------------------------------------------------------------------
// Proxy (Next.js 16 replaces middleware with proxy)
// ---------------------------------------------------------------------------

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — must be called before any redirect logic
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ----- Rate limiting for API routes -----
  if (pathname.startsWith('/api/')) {
    const identifier =
      user?.id ??
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      'unknown'

    const config = getConfig(pathname)
    const rateKey = `${identifier}:${pathname}`
    const { limited, remaining, resetMs } = checkRateLimit(
      rateKey,
      config.maxRequests,
      config.windowMs
    )

    if (limited) {
      const retryAfter = Math.ceil(resetMs / 1000)
      return NextResponse.json(
        {
          error: 'You\'re moving faster than I can keep up. Take a breath and try again in a moment.',
          retryAfterSeconds: retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil((Date.now() + resetMs) / 1000)),
          },
        }
      )
    }

    // Attach rate-limit headers to the response
    supabaseResponse.headers.set('X-RateLimit-Limit', String(config.maxRequests))
    supabaseResponse.headers.set('X-RateLimit-Remaining', String(remaining))
    supabaseResponse.headers.set(
      'X-RateLimit-Reset',
      String(Math.ceil((Date.now() + resetMs) / 1000))
    )

    return supabaseResponse
  }

  // ----- Auth redirects for page routes -----
  const isProtectedRoute =
    pathname.startsWith('/bear') ||
    pathname.startsWith('/parrot') ||
    pathname.startsWith('/home') ||
    pathname.startsWith('/account')

  const isAuthRoute = pathname === '/login' || pathname === '/'

  // Unauthenticated user hitting a protected route → send to login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated user hitting login or root → send to home
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
