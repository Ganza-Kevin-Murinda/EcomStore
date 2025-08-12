import { type NextRequest, NextResponse } from "next/server"
import { usersDB, otpDB, generateId } from "@/lib/db"
import { generateOTP } from "@/lib/jwt"
import { sendOTPEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const user = usersDB.findOne((u) => u.email === email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate new OTP
    const otp = generateOTP()
    const otpRecord = {
      id: generateId(),
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      verified: false,
    }

    otpDB.create(otpRecord)

    const emailResult = await sendOTPEmail(email, otp, `${user.firstName} ${user.lastName}`)

    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.error)
      // Still return success to user, but log the error
      return NextResponse.json({
        message: "OTP generated but email delivery failed. Please check your email configuration.",
        otp: otp, // Temporary fallback - remove in production
      })
    }

    return NextResponse.json({
      message: "OTP sent successfully to your email",
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
