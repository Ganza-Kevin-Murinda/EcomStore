"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { api, ApiError } from "@/lib/api-client"
import { useAuth } from "@/components/auth/auth-context"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: "shoes" | "clothes" | "electronics"
  image: string
  stock: number
  sellerId: string
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  createdAt: string
  product: Product
}

interface ProductContextType {
  products: Product[]
  cart: CartItem[]
  loading: boolean
  error: string | null
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (cartItemId: string) => Promise<void>
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getCartTotal: () => number
  getCartItemsCount: () => number
  fetchProducts: (category?: string, search?: string) => Promise<void>
  fetchCart: () => Promise<void>
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setCart([])
    }
  }, [user])

  const fetchProducts = async (category?: string, search?: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (category && category !== "all") params.append("category", category)
      if (search) params.append("search", search)

      const response = await api.get<{ products: Product[] }>(`/api/products?${params.toString()}`)
      setProducts(response.products)
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to fetch products"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const fetchCart = async () => {
    if (!user) return

    try {
      const response = await api.get<{ cartItems: CartItem[] }>("/api/cart")
      setCart(response.cartItems)
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    }
  }

  const addToCart = async (product: Product, quantity = 1) => {
    if (!user) {
      setError("Please log in to add items to cart")
      return
    }

    try {
      await api.post("/api/cart", {
        productId: product.id,
        quantity,
      })
      await fetchCart() // Refresh cart
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to add item to cart"
      setError(message)
    }
  }

  const removeFromCart = async (cartItemId: string) => {
    if (!user) return

    try {
      await api.delete(`/api/cart/${cartItemId}`)
      await fetchCart() // Refresh cart
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to remove item from cart"
      setError(message)
    }
  }

  const updateCartQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) return

    if (quantity <= 0) {
      await removeFromCart(cartItemId)
      return
    }

    try {
      await api.put(`/api/cart/${cartItemId}`, { quantity })
      await fetchCart() // Refresh cart
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to update cart"
      setError(message)
    }
  }

  const clearCart = async () => {
    if (!user) return

    try {
      await api.delete("/api/cart")
      setCart([])
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to clear cart"
      setError(message)
    }
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0)
  }

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        cart,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        fetchProducts,
        fetchCart,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider")
  }
  return context
}
