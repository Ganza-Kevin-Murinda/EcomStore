import { NextResponse } from "next/server"

export async function GET() {
  const categories = [
    { id: "all", name: "All Products", count: 0 },
    { id: "shoes", name: "Shoes", count: 0 },
    { id: "clothes", name: "Clothes", count: 0 },
    { id: "electronics", name: "Electronics", count: 0 },
  ]

  return NextResponse.json({ categories })
}
