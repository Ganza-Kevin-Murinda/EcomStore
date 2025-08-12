import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { usersDB } from "@/lib/db"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: "customer" | "seller"
  }
}

export function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  const user = usersDB.findById(payload.userId)
  if (!user || !user.isVerified) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  }
}

export function requireAuth(request: NextRequest) {
  const user = getAuthenticatedUser(request)
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export function requireSeller(request: NextRequest) {
  const user = requireAuth(request)
  if (user.role !== "seller") {
    throw new Error("Seller access required")
  }
  return user
}
