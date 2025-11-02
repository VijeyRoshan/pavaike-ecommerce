import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { generateToken } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection("users")

    // Find admin user
    const user = await usersCollection.findOne({
      email,
      role: "admin",
    })

    // If no admin user found, in non-production create a dev admin using provided credentials
    let adminUser = user
    if (!adminUser) {
      if (process.env.NODE_ENV !== "production") {
        const hashed = await bcrypt.hash(password, 10)
        const insertResult = await usersCollection.insertOne({
          email,
          password: hashed,
          role: "admin",
          fullName: "Admin",
          createdAt: new Date(),
        })
        adminUser = await usersCollection.findOne({ _id: insertResult.insertedId })
        console.log("Dev admin user created:", email)
      } else {
        return NextResponse.json({ error: "Admin user not found" }, { status: 401 })
      }
    }

    if (!adminUser) {
      return NextResponse.json({ error: "Admin login failed" }, { status: 500 })
    }

    // Verify password
  const passwordMatch = await bcrypt.compare(password, adminUser.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate token
    const token = generateToken({
      id: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
    })

    return NextResponse.json({
      token,
      user: {
        id: adminUser._id.toString(),
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Admin login failed" }, { status: 500 })
  }
}
