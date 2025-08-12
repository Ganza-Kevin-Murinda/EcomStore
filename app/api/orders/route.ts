import { type NextRequest, NextResponse } from "next/server"
import { ordersDB, cartDB, productsDB, generateId } from "@/lib/db"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)

    const orders = ordersDB.findBy((order) => order.userId === user.id)

    // Sort by creation date (newest first)
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ orders })
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Get orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const { shippingAddress, paymentMethod } = await request.json()

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json({ error: "Shipping address and payment method are required" }, { status: 400 })
    }

    // Get user's cart items
    const cartItems = cartDB.findBy((item) => item.userId === user.id)
    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Validate cart items and calculate total
    let total = 0
    const orderItems = []

    for (const cartItem of cartItems) {
      const product = productsDB.findById(cartItem.productId)
      if (!product) {
        return NextResponse.json({ error: `Product ${cartItem.productId} not found` }, { status: 400 })
      }

      // Check stock availability
      if (product.stock < cartItem.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}`,
          },
          { status: 400 },
        )
      }

      const itemTotal = product.price * cartItem.quantity
      total += itemTotal

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        quantity: cartItem.quantity,
        price: product.price,
      })
    }

    // Create order
    const orderId = generateId()
    const order = {
      id: orderId,
      userId: user.id,
      items: orderItems,
      total,
      status: "pending" as const,
      shippingAddress,
      paymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const createdOrder = ordersDB.create(order)

    // Update product stock
    for (const cartItem of cartItems) {
      const product = productsDB.findById(cartItem.productId)
      if (product) {
        productsDB.update(product.id, {
          stock: product.stock - cartItem.quantity,
          updatedAt: new Date().toISOString(),
        })
      }
    }

    // Clear user's cart
    cartItems.forEach((item) => cartDB.delete(item.id))

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: createdOrder,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
