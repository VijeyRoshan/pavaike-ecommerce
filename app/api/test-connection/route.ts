import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    await connectToDatabase()
    return NextResponse.json({ status: "Connected to MongoDB Atlas successfully" })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json({ status: "Not connected to MongoDB Atlas", error: String(error) }, { status: 500 })
  }
}