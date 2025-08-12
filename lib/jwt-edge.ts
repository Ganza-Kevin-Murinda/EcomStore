import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const secret = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  userId: string
  email: string
  role: "customer" | "seller"
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as JWTPayload
  } catch (error) {
    return null
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
