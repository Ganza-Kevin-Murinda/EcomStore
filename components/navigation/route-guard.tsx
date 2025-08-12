"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireRole?: "customer" | "seller"
  redirectTo?: string
}

export default function RouteGuard({
  children,
  requireAuth = false,
  requireRole,
  redirectTo = "/auth/login",
}: RouteGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    // Check if authentication is required
    if (requireAuth && !user) {
      router.push(redirectTo)
      return
    }

    // Check if specific role is required
    if (requireRole && user?.role !== requireRole) {
      // Redirect to appropriate dashboard based on user role
      if (user?.role === "customer") {
        router.push("/dashboard")
      } else if (user?.role === "seller") {
        router.push("/dashboard")
      } else {
        router.push("/")
      }
      return
    }
  }, [user, isLoading, requireAuth, requireRole, redirectTo, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !user) {
    return null
  }

  if (requireRole && user?.role !== requireRole) {
    return null
  }

  return <>{children}</>
}
