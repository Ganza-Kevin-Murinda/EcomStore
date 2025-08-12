import { type NextRequest, NextResponse } from "next/server"
import { usersDB, verifyPassword } from "@/lib/db"
import { signToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const user = usersDB.findOne((u) => u.email === email)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json({ error: "Please verify your email before logging in" }, { status: 401 })
    }

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Create response with token in cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
