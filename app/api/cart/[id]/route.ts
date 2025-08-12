import { type NextRequest, NextResponse } from "next/server"
import { cartDB, productsDB } from "@/lib/db"
import { requireAuth } from "@/lib/auth-middleware"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(request)
    const { quantity } = await request.json()

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 })
    }

    const cartItem = cartDB.findById(params.id)
    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    // Check if user owns this cart item
    if (cartItem.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check stock availability
    const product = productsDB.findById(cartItem.productId)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    const updatedItem = cartDB.update(params.id, { quantity })
    return NextResponse.json({ message: "Cart item updated", cartItem: updatedItem })
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Update cart item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(request)

    const cartItem = cartDB.findById(params.id)
    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    // Check if user owns this cart item
    if (cartItem.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    cartDB.delete(params.id)
    return NextResponse.json({ message: "Item removed from cart" })
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Remove cart item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
