import { type NextRequest, NextResponse } from "next/server"
import { usersDB, otpDB } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    // Validate required fields
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    // Find OTP record
    const otpRecord = otpDB.findOne((record) => record.email === email && record.otp === otp && !record.verified)

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 })
    }

    // Mark OTP as verified
    otpDB.update(otpRecord.id, { verified: true })

    // Mark user as verified
    const user = usersDB.findOne((u) => u.email === email)
    if (user) {
      usersDB.update(user.id, {
        isVerified: true,
        updatedAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      message: "Email verified successfully. You can now log in.",
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
