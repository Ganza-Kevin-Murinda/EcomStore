import { type NextRequest, NextResponse } from "next/server"
import { productsDB } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ products: [] })
    }

    const searchLower = query.toLowerCase()
    const products = productsDB.findBy(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower),
    )

    // Sort by relevance (name matches first, then description)
    products.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(searchLower)
      const bNameMatch = b.name.toLowerCase().includes(searchLower)

      if (aNameMatch && !bNameMatch) return -1
      if (!aNameMatch && bNameMatch) return 1
      return 0
    })

    return NextResponse.json({ products: products.slice(0, 20) }) // Limit to 20 results
  } catch (error) {
    console.error("Search products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
