import { type NextRequest, NextResponse } from "next/server"
import { productsDB } from "@/lib/db"
import { requireSeller } from "@/lib/auth-middleware"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = productsDB.findById(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireSeller(request)
    const { name, description, price, category, image, stock } = await request.json()

    const product = productsDB.findById(params.id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if user owns this product
    if (product.sellerId !== user.id) {
      return NextResponse.json({ error: "You can only update your own products" }, { status: 403 })
    }

    // Validate category if provided
    if (category && !["shoes", "clothes", "electronics"].includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    // Validate price and stock if provided
    if (price !== undefined && price <= 0) {
      return NextResponse.json({ error: "Price must be positive" }, { status: 400 })
    }
    if (stock !== undefined && stock < 0) {
      return NextResponse.json({ error: "Stock cannot be negative" }, { status: 400 })
    }

    const updates: any = {
      updatedAt: new Date().toISOString(),
    }

    if (name) updates.name = name
    if (description) updates.description = description
    if (price !== undefined) updates.price = Number.parseFloat(price)
    if (category) updates.category = category
    if (image) updates.image = image
    if (stock !== undefined) updates.stock = Number.parseInt(stock)

    const updatedProduct = productsDB.update(params.id, updates)

    return NextResponse.json({ message: "Product updated successfully", product: updatedProduct })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Authentication required" || error.message === "Seller access required") {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }
    }
    console.error("Update product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireSeller(request)

    const product = productsDB.findById(params.id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if user owns this product
    if (product.sellerId !== user.id) {
      return NextResponse.json({ error: "You can only delete your own products" }, { status: 403 })
    }

    const deleted = productsDB.delete(params.id)
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Authentication required" || error.message === "Seller access required") {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }
    }
    console.error("Delete product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
