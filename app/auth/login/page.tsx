"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-context"
import { ShoppingBag, Eye, EyeOff, User, Store } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = await login(email, password)

    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.message)
    }
  }

  const fillDemoAccount = (accountType: "customer" | "seller") => {
    if (accountType === "customer") {
      setEmail("customer@demo.com")
      setPassword("password123")
    } else {
      setEmail("seller@demo.com")
      setPassword("password123")
    }
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="h-12 w-12 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your EcomStore account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-indigo-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-3 font-medium">Try Demo Accounts:</p>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs justify-start bg-transparent"
                onClick={() => fillDemoAccount("customer")}
              >
                <User className="h-3 w-3 mr-2" />
                Customer: customer@demo.com
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs justify-start bg-transparent"
                onClick={() => fillDemoAccount("seller")}
              >
                <Store className="h-3 w-3 mr-2" />
                Seller: seller@demo.com
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
