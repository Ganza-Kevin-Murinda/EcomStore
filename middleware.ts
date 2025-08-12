import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/jwt-edge"

// Define protected routes
const protectedRoutes = ["/dashboard", "/cart", "/checkout"]
const authRoutes = ["/auth/login", "/auth/register", "/auth/verify-otp"]
const sellerRoutes = ["/seller"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth-token")?.value

  // Check if user is authenticated
  let user = null
  if (token) {
    user = await verifyToken(token)
  }

  // Handle auth routes (login, register, etc.)
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    // If user is already authenticated, redirect to dashboard
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    // Allow access to auth routes for unauthenticated users
    return NextResponse.next()
  }

  // Handle seller-specific routes
  if (sellerRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
    if (user.role !== "seller") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // Handle protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      // Store the intended destination
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Allow access to public routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
}
