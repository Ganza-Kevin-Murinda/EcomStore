import { type NextRequest, NextResponse } from "next/server"
import { cartDB, productsDB, generateId } from "@/lib/db"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)

    const cartItems = cartDB.findBy((item) => item.userId === user.id)

    // Enrich cart items with product details
    const enrichedItems = cartItems
      .map((item) => {
        const product = productsDB.findById(item.productId)
        return {
          ...item,
          product: product || null,
        }
      })
      .filter((item) => item.product !== null) // Remove items with deleted products

    return NextResponse.json({ cartItems: enrichedItems })
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Get cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const { productId, quantity = 1 } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Check if product exists
    const product = productsDB.findById(productId)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check stock availability
    if (product.stock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    // Check if item already exists in cart
    const existingItem = cartDB.findOne((item) => item.userId === user.id && item.productId === productId)

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity
      if (product.stock < newQuantity) {
        return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
      }

      const updatedItem = cartDB.update(existingItem.id, { quantity: newQuantity })
      return NextResponse.json({ message: "Cart updated", cartItem: updatedItem })
    } else {
      // Add new item
      const cartItem = {
        id: generateId(),
        userId: user.id,
        productId,
        quantity,
        createdAt: new Date().toISOString(),
      }

      const newItem = cartDB.create(cartItem)
      return NextResponse.json({ message: "Item added to cart", cartItem: newItem }, { status: 201 })
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Add to cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = requireAuth(request)

    // Clear entire cart
    const userCartItems = cartDB.findBy((item) => item.userId === user.id)
    userCartItems.forEach((item) => cartDB.delete(item.id))

    return NextResponse.json({ message: "Cart cleared successfully" })
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Clear cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
