import { type NextRequest, NextResponse } from "next/server"
import { ordersDB, productsDB } from "@/lib/db"
import { requireAuth, requireSeller } from "@/lib/auth-middleware"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(request)

    const order = ordersDB.findById(params.id)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user owns this order or is a seller with products in the order
    let hasAccess = order.userId === user.id

    if (!hasAccess && user.role === "seller") {
      // Check if seller has products in this order
      const sellerProductIds = productsDB.findBy((p) => p.sellerId === user.id).map((p) => p.id)
      hasAccess = order.items.some((item) => sellerProductIds.includes(item.productId))
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Get order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireSeller(request)
    const { status } = await request.json()

    if (!status || !["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const order = ordersDB.findById(params.id)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if seller has products in this order
    const sellerProductIds = productsDB.findBy((p) => p.sellerId === user.id).map((p) => p.id)
    const hasProducts = order.items.some((item) => sellerProductIds.includes(item.productId))

    if (!hasProducts) {
      return NextResponse.json({ error: "You can only update orders containing your products" }, { status: 403 })
    }

    const updatedOrder = ordersDB.update(params.id, {
      status,
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ message: "Order status updated", order: updatedOrder })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Authentication required" || error.message === "Seller access required") {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }
    }
    console.error("Update order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
