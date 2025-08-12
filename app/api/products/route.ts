import { type NextRequest, NextResponse } from "next/server"
import { productsDB, generateId } from "@/lib/db"
import { requireSeller } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const sellerId = searchParams.get("sellerId")

    let products = productsDB.findAll()

    // Filter by category
    if (category && category !== "all") {
      products = products.filter((product) => product.category === category)
    }

    // Filter by seller
    if (sellerId) {
      products = products.filter((product) => product.sellerId === sellerId)
    }

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) || product.description.toLowerCase().includes(searchLower),
      )
    }

    // Sort by creation date (newest first)
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireSeller(request)
    const { name, description, price, category, image, stock } = await request.json()

    // Validate required fields
    if (!name || !description || !price || !category || !stock) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate category
    if (!["shoes", "clothes", "electronics"].includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    // Validate price and stock
    if (price <= 0 || stock < 0) {
      return NextResponse.json({ error: "Price must be positive and stock cannot be negative" }, { status: 400 })
    }

    const productId = generateId()
    const newProduct = {
      id: productId,
      name,
      description,
      price: Number.parseFloat(price),
      category: category as "shoes" | "clothes" | "electronics",
      image: image || "/diverse-products-still-life.png",
      stock: Number.parseInt(stock),
      sellerId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const product = productsDB.create(newProduct)

    return NextResponse.json({ message: "Product created successfully", product }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Authentication required" || error.message === "Seller access required") {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }
    }
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
