import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

// Dev-only endpoint to create an admin user if none exists.
// Use environment variables ADMIN_EMAIL and ADMIN_PASSWORD or defaults.
export async function GET() {
  try {
    const db = await getDatabase()
    const usersCollection = db.collection("users")

    const existing = await usersCollection.findOne({ role: "admin" })
    if (existing) {
      return NextResponse.json({ message: "Admin user already exists", email: existing.email })
    }

    const email = process.env.ADMIN_EMAIL || "admin@example.com"
    const password = process.env.ADMIN_PASSWORD || "Admin123!"

    const hashed = await bcrypt.hash(password, 10)

    const result = await usersCollection.insertOne({
      email,
      password: hashed,
      fullName: "Administrator",
      role: "admin",
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "Admin user created", email, id: result.insertedId.toString() })
  } catch (err) {
    console.error("Init admin error:", err)
    return NextResponse.json({ error: "Failed to initialize admin" }, { status: 500 })
  }
}
