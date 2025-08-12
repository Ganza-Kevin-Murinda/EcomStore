import nodemailer from "nodemailer"

// Create transporter for Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// Send OTP email
export async function sendOTPEmail(email: string, otp: string, userName?: string) {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">EcomStore</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Verification Code</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Hello${userName ? ` ${userName}` : ""}!</h2>
            <p style="color: #666; margin: 0 0 30px 0; font-size: 16px;">
              Your verification code is:
            </p>
            <div style="background: white; border: 2px dashed #667eea; padding: 20px; border-radius: 10px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${otp}</span>
            </div>
            <p style="color: #999; margin: 30px 0 0 0; font-size: 14px;">
              This code will expire in 10 minutes
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 14px;">
            <p>If you didn't request this code, please ignore this email.</p>
            <p style="margin: 20px 0 0 0;">© 2024 EcomStore. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("OTP email sent successfully:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Failed to send OTP email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Send welcome email
export async function sendWelcomeEmail(email: string, userName: string, userRole: string) {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to EcomStore!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to EcomStore!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your account is ready</p>
          </div>
          
          <div style="padding: 30px; text-align: center;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${userName}!</h2>
            <p style="color: #666; margin: 0 0 30px 0; font-size: 16px;">
              Your ${userRole} account has been successfully created and verified.
            </p>
            
            ${
              userRole === "seller"
                ? `
              <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0;">As a seller, you can:</h3>
                <ul style="color: #666; text-align: left; margin: 0; padding-left: 20px;">
                  <li>Add and manage your products</li>
                  <li>Track your orders and sales</li>
                  <li>View analytics and reports</li>
                  <li>Manage your store settings</li>
                </ul>
              </div>
            `
                : `
              <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0;">Start shopping now:</h3>
                <ul style="color: #666; text-align: left; margin: 0; padding-left: 20px;">
                  <li>Browse thousands of products</li>
                  <li>Add items to your cart</li>
                  <li>Secure checkout and payment</li>
                  <li>Track your orders</li>
                </ul>
              </div>
            `
            }
            
            <p style="color: #999; margin: 30px 0 0 0; font-size: 14px;">
              Thank you for joining EcomStore!
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 14px;">
            <p style="margin: 20px 0 0 0;">© 2024 EcomStore. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Welcome email sent successfully:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Failed to send welcome email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
