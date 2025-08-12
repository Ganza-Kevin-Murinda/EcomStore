"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: "customer" | "seller"
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, requireRole, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/auth/login")
      return
    }

    if (requireRole && user.role !== requireRole) {
      router.push("/dashboard")
      return
    }

    setIsAuthorized(true)
  }, [user, loading, requireRole, router])

  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    )
  }

  if (!isAuthorized) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    )
  }

  return <>{children}</>
}
