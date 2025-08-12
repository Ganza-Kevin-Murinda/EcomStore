"use client"

import { useAuth } from "@/components/auth/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import CustomerDashboard from "@/components/dashboard/customer-dashboard"
import SellerDashboard from "@/components/dashboard/seller-dashboard"
import ProtectedRoute from "@/components/navigation/protected-route"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return <ProtectedRoute>{user.role === "customer" ? <CustomerDashboard /> : <SellerDashboard />}</ProtectedRoute>
}
