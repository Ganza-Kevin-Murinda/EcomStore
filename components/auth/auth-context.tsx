"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { api, ApiError } from "@/lib/api-client"

export type UserRole = "customer" | "seller"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole,
  ) => Promise<{ success: boolean; message: string }>
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await api.get<{ user: User }>("/api/auth/me")
      setUser(response.user)
    } catch (error) {
      // User not authenticated
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await api.post<{ message: string; user: User }>("/api/auth/login", {
        email,
        password,
      })

      setUser(response.user)
      setLoading(false)
      return { success: true, message: response.message }
    } catch (error) {
      setLoading(false)
      const message = error instanceof ApiError ? error.message : "Login failed"
      return { success: false, message }
    }
  }

  const register = async (email: string, password: string, firstName: string, lastName: string, role: UserRole) => {
    setLoading(true)
    try {
      const response = await api.post<{ message: string; userId: string; otp?: string }>("/api/auth/register", {
        email,
        password,
        firstName,
        lastName,
        role,
      })

      setLoading(false)
      return { success: true, message: response.message }
    } catch (error) {
      setLoading(false)
      const message = error instanceof ApiError ? error.message : "Registration failed"
      return { success: false, message }
    }
  }

  const verifyOTP = async (email: string, otp: string) => {
    setLoading(true)
    try {
      const response = await api.post<{ message: string }>("/api/auth/verify-otp", {
        email,
        otp,
      })

      setLoading(false)
      return { success: true, message: response.message }
    } catch (error) {
      setLoading(false)
      const message = error instanceof ApiError ? error.message : "OTP verification failed"
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      await api.post("/api/auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        verifyOTP,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
