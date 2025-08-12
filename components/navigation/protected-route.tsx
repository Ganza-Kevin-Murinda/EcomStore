"use client"

import type React from "react"

import RouteGuard from "./route-guard"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: "customer" | "seller"
}

export default function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  return (
    <RouteGuard requireAuth={true} requireRole={requireRole}>
      {children}
    </RouteGuard>
  )
}
