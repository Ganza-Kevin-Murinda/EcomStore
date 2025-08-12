"use client"

import { useAuth } from "@/components/auth/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import SellerDashboard from "@/components/dashboard/seller-dashboard"
import ProtectedRoute from "@/components/navigation/protected-route"

export default function SellerOrdersPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    } else if (user.role !== "seller") {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user || user.role !== "seller") {
    return null
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <SellerDashboard defaultTab="orders" />
      </div>
    </ProtectedRoute>
  )
}
