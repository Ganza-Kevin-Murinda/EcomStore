import type React from "react"
import { AuthProvider } from "@/components/auth/auth-context"
import { ProductProvider } from "@/components/products/product-context"
import MainNav from "@/components/navigation/main-nav"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { JetBrains_Mono } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "EcomStore - Your Complete E-Commerce Solution",
  description: "Buy and sell shoes, clothes, and electronics with secure payments and seamless experience",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <AuthProvider>
          <ProductProvider>
            <MainNav />
            {children}
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
