import fs from "fs"
import path from "path"
import type { User, Product, CartItem, Order, OTPVerification } from "./types"

const DATA_DIR = path.join(process.cwd(), "data")

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Generic database operations
class JsonDB<T extends { id: string }> {
  private filePath: string

  constructor(filename: string) {
    this.filePath = path.join(DATA_DIR, filename)
    this.ensureFileExists()
  }

  private ensureFileExists() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]))
    }
  }

  private readData(): T[] {
    try {
      const data = fs.readFileSync(this.filePath, "utf8")
      return JSON.parse(data)
    } catch (error) {
      return []
    }
  }

  private writeData(data: T[]): void {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2))
  }

  findAll(): T[] {
    return this.readData()
  }

  findById(id: string): T | null {
    const data = this.readData()
    return data.find((item) => item.id === id) || null
  }

  findBy(predicate: (item: T) => boolean): T[] {
    const data = this.readData()
    return data.filter(predicate)
  }

  findOne(predicate: (item: T) => boolean): T | null {
    const data = this.readData()
    return data.find(predicate) || null
  }

  create(item: T): T {
    const data = this.readData()
    data.push(item)
    this.writeData(data)
    return item
  }

  update(id: string, updates: Partial<T>): T | null {
    const data = this.readData()
    const index = data.findIndex((item) => item.id === id)

    if (index === -1) return null

    data[index] = { ...data[index], ...updates }
    this.writeData(data)
    return data[index]
  }

  delete(id: string): boolean {
    const data = this.readData()
    const index = data.findIndex((item) => item.id === id)

    if (index === -1) return false

    data.splice(index, 1)
    this.writeData(data)
    return true
  }
}

// Database instances
export const usersDB = new JsonDB<User>("users.json")
export const productsDB = new JsonDB<Product>("products.json")
export const cartDB = new JsonDB<CartItem>("cart.json")
export const ordersDB = new JsonDB<Order>("orders.json")
export const otpDB = new JsonDB<OTPVerification>("otp.json")

// Utility functions
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function hashPassword(password: string): string {
  // Simple hash for MVP - replace with bcrypt in production
  return Buffer.from(password).toString("base64")
}

export function verifyPassword(password: string, hash: string): boolean {
  return Buffer.from(password).toString("base64") === hash
}
