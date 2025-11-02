import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

// POST: Create a test user (dev only)
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 })
  }
  const db = await getDatabase()
  const usersCollection = db.collection("users")
  const email = "testuser@example.com"
  const password = "Test123!"
  const fullName = "Test User"
  const role = "user"
  const existing = await usersCollection.findOne({ email })
  if (existing) {
    return NextResponse.json({ message: "Test user already exists" })
  }
  const hashed = await bcrypt.hash(password, 10)
  await usersCollection.insertOne({
    email,
    password: hashed,
    fullName,
    role,
    createdAt: new Date(),
  })
  return NextResponse.json({ message: "Test user created", email, password })
}
