export interface User {
  id: string
  email: string
  password: string
  role: "customer" | "seller"
  firstName: string
  lastName: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: "shoes" | "clothes" | "electronics"
  image: string
  stock: number
  sellerId: string
  rating: number
  reviews: number
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  createdAt: string
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  quantity: number
  price: number
}

export interface OTPVerification {
  id: string
  email: string
  otp: string
  expiresAt: string
  verified: boolean
}
