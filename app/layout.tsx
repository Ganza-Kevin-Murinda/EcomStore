import type React from "react"
import { AuthProvider } from "@/components/auth/auth-context"
import { ProductProvider } from "@/components/products/product-context"
import MainNav from "@/components/navigation/main-nav"
import { ThemeProvider } from "next-themes"
import "./globals.css"
import type { Metadata } from "next"
// fixed Geist font imports
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

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
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthProvider>
          <ProductProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <MainNav />
              {children}
            </ThemeProvider>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
