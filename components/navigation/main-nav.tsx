"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/components/auth/auth-context"
import { useProducts } from "@/components/products/product-context"
import { ShoppingBag, User, LogOut, Menu, Package, BarChart3, Settings, Store, Search } from "lucide-react"

export default function MainNav() {
  const { user, logout } = useAuth()
  const { getCartItemsCount } = useProducts()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Don't show navigation on auth pages
  if (pathname?.startsWith("/auth/")) {
    return null
  }

  const customerNavItems = [
    { href: "/products", label: "Products", icon: Search },
    { href: "/cart", label: "Cart", icon: ShoppingBag, badge: getCartItemsCount() },
    { href: "/dashboard", label: "Account", icon: User },
  ]

  const sellerNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/products", label: "Store", icon: Store },
    { href: "/seller/products", label: "Products", icon: Package },
    { href: "/seller/orders", label: "Orders", icon: ShoppingBag },
  ]

  const navItems = user?.role === "seller" ? sellerNavItems : customerNavItems

  const NavItems = ({ mobile = false }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mobile ? "w-full space-x-2 px-3 py-2 text-sm" : ""
            } ${isActive ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
            onClick={() => mobile && setIsMobileMenuOpen(false)}
          >
            <Icon className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
            <span className="whitespace-nowrap">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {item.badge}
              </Badge>
            )}
          </Link>
        )
      })}
    </>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <ShoppingBag className="h-7 w-7 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">EcomStore</span>
          </Link>

          {/* Desktop Navigation - Made more compact with smaller spacing and text */}
          <nav className="hidden md:flex items-center space-x-0.5 flex-1 justify-center max-w-2xl">
            <NavItems />
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                    <User className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-xs">{user.name}</span>
                    <Badge variant="outline" className="hidden sm:inline capitalize text-xs">
                      {user.role}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {user.role === "seller" ? "Seller Dashboard" : "My Account"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard?tab=profile" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {user && (
                    <div className="pb-4 border-b">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <Badge variant="outline" className="mt-2 capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  )}

                  <nav className="flex flex-col space-y-2">
                    <NavItems mobile />
                  </nav>

                  {user && (
                    <div className="pt-4 border-t">
                      <Button variant="ghost" onClick={logout} className="w-full justify-start text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
