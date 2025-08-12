import { type NextRequest, NextResponse } from "next/server"
import { ordersDB, productsDB } from "@/lib/db"
import { requireSeller } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const user = requireSeller(request)

    // Get all seller's products
    const sellerProducts = productsDB.findBy((p) => p.sellerId === user.id)
    const sellerProductIds = sellerProducts.map((p) => p.id)

    // Find orders containing seller's products
    const allOrders = ordersDB.findAll()
    const sellerOrders = allOrders.filter((order) =>
      order.items.some((item) => sellerProductIds.includes(item.productId)),
    )

    // Filter items to only include seller's products
    const filteredOrders = sellerOrders.map((order) => ({
      ...order,
      items: order.items.filter((item) => sellerProductIds.includes(item.productId)),
    }))

    // Sort by creation date (newest first)
    filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ orders: filteredOrders })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Authentication required" || error.message === "Seller access required") {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }
    }
    console.error("Get seller orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
