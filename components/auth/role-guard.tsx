"use client"

import type React from "react"

import { useAuth } from "./auth-context"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: ("customer" | "seller")[]
  fallback?: React.ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback || <div className="text-center p-4 text-muted-foreground">Access denied</div>
  }

  return <>{children}</>
}
