"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type UserRole = "customer" | "seller"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => Promise<{ success: boolean; message: string }>
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data - replace with API calls to your Java backend
const mockUsers: User[] = [
  {
    id: "1",
    email: "customer@example.com",
    name: "John Customer",
    role: "customer",
    isVerified: true,
  },
  {
    id: "2",
    email: "seller@example.com",
    name: "Jane Seller",
    role: "seller",
    isVerified: true,
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock authentication - replace with actual API call
    const foundUser = mockUsers.find((u) => u.email === email)

    if (foundUser && password === "password123") {
      setUser(foundUser)
      localStorage.setItem("user", JSON.stringify(foundUser))
      setIsLoading(false)
      return { success: true, message: "Login successful" }
    }

    setIsLoading(false)
    return { success: false, message: "Invalid email or password" }
  }

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock registration - replace with actual API call
    const existingUser = mockUsers.find((u) => u.email === email)

    if (existingUser) {
      setIsLoading(false)
      return { success: false, message: "Email already exists" }
    }

    // Store pending verification
    localStorage.setItem("pendingVerification", JSON.stringify({ email, password, name, role }))

    setIsLoading(false)
    return { success: true, message: "Registration successful. Please check your email for OTP." }
  }

  const verifyOTP = async (email: string, otp: string) => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock OTP verification - replace with actual API call
    if (otp === "123456") {
      const pendingData = localStorage.getItem("pendingVerification")
      if (pendingData) {
        const userData = JSON.parse(pendingData)
        const newUser: User = {
          id: Date.now().toString(),
          email: userData.email,
          name: userData.name,
          role: userData.role,
          isVerified: true,
        }

        setUser(newUser)
        localStorage.setItem("user", JSON.stringify(newUser))
        localStorage.removeItem("pendingVerification")

        setIsLoading(false)
        return { success: true, message: "Account verified successfully" }
      }
    }

    setIsLoading(false)
    return { success: false, message: "Invalid OTP" }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        verifyOTP,
        logout,
        isLoading,
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
