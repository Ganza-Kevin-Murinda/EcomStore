"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: "shoes" | "clothes" | "electronics"
  image: string
  stock: number
  rating: number
  reviews: number
}

export interface CartItem {
  product: Product
  quantity: number
}

interface ProductContextType {
  products: Product[]
  cart: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartItemsCount: () => number
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

// Mock product data - replace with API calls to your Java backend
const mockProducts: Product[] = [
  // Shoes
  {
    id: "1",
    name: "Nike Air Max 270",
    description: "Comfortable running shoes with excellent cushioning and modern design.",
    price: 129.99,
    category: "shoes",
    image: "/nike-air-max-running-shoes.png",
    stock: 25,
    rating: 4.5,
    reviews: 128,
  },
  {
    id: "2",
    name: "Adidas Ultraboost 22",
    description: "Premium running shoes with responsive cushioning and energy return.",
    price: 189.99,
    category: "shoes",
    image: "/adidas-ultraboost.png",
    stock: 18,
    rating: 4.7,
    reviews: 95,
  },
  {
    id: "3",
    name: "Converse Chuck Taylor",
    description: "Classic canvas sneakers perfect for casual wear and street style.",
    price: 59.99,
    category: "shoes",
    image: "/classic-converse.png",
    stock: 42,
    rating: 4.3,
    reviews: 203,
  },

  // Clothes
  {
    id: "4",
    name: "Levi's 501 Original Jeans",
    description: "Iconic straight-fit jeans made from premium denim with classic styling.",
    price: 89.99,
    category: "clothes",
    image: "/levis-501-jeans.png",
    stock: 35,
    rating: 4.4,
    reviews: 156,
  },
  {
    id: "5",
    name: "Nike Dri-FIT T-Shirt",
    description: "Moisture-wicking athletic t-shirt perfect for workouts and casual wear.",
    price: 24.99,
    category: "clothes",
    image: "/athletic-t-shirt.png",
    stock: 67,
    rating: 4.2,
    reviews: 89,
  },
  {
    id: "6",
    name: "Patagonia Fleece Jacket",
    description: "Warm and comfortable fleece jacket perfect for outdoor activities.",
    price: 149.99,
    category: "clothes",
    image: "/cozy-fleece-jacket.png",
    stock: 22,
    rating: 4.8,
    reviews: 74,
  },

  // Electronics
  {
    id: "7",
    name: "Apple AirPods Pro",
    description: "Wireless earbuds with active noise cancellation and spatial audio.",
    price: 249.99,
    category: "electronics",
    image: "/placeholder-f0gpp.png",
    stock: 15,
    rating: 4.6,
    reviews: 312,
  },
  {
    id: "8",
    name: "Samsung Galaxy Watch",
    description: "Smart watch with fitness tracking, GPS, and long battery life.",
    price: 329.99,
    category: "electronics",
    image: "/generic-smartwatch.png",
    stock: 12,
    rating: 4.4,
    reviews: 87,
  },
  {
    id: "9",
    name: "Sony WH-1000XM4",
    description: "Premium noise-canceling headphones with exceptional sound quality.",
    price: 349.99,
    category: "electronics",
    image: "/placeholder-f1927.png",
    stock: 8,
    rating: 4.9,
    reviews: 245,
  },
]

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products] = useState<Product[]>(mockProducts)
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id)

      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        return [...prevCart, { product, quantity }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId))
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((prevCart) => prevCart.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCart([])
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
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
