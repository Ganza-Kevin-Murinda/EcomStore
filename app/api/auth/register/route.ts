import { type NextRequest, NextResponse } from "next/server"
import { usersDB, otpDB, generateId, hashPassword } from "@/lib/db"
import { generateOTP } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, role } = await request.json()

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = usersDB.findOne((user) => user.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 })
    }

    // Create new user
    const userId = generateId()
    const hashedPassword = hashPassword(password)

    const newUser = {
      id: userId,
      email,
      password: hashedPassword,
      role: role as "customer" | "seller",
      firstName,
      lastName,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    usersDB.create(newUser)

    // Generate and store OTP
    const otp = generateOTP()
    const otpRecord = {
      id: generateId(),
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      verified: false,
    }

    otpDB.create(otpRecord)

    // In production, send OTP via email service
    console.log(`OTP for ${email}: ${otp}`)

    return NextResponse.json({
      message: "User registered successfully. Please verify your email with the OTP sent.",
      userId,
      otp: otp, // Remove this in production
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
