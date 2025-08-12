import { signToken as signTokenEdge, verifyToken as verifyTokenEdge, generateOTP as generateOTPEdge } from "./jwt-edge"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface JWTPayload {
  userId: string
  email: string
  role: "customer" | "seller"
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await signTokenEdge(payload)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  return await verifyTokenEdge(token)
}

export function generateOTP(): string {
  return generateOTPEdge()
}
