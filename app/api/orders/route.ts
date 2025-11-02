import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { requireAuth } from "@/lib/auth-middleware"
import { ObjectId } from "mongodb"

export const GET = requireAuth(async (request, payload) => {
  try {
    const db = await getDatabase()
    const ordersCollection = db.collection("orders")
    // Admins see all orders, users see only their orders
    const query = payload.role === "admin" ? {} : { userId: payload.id }
    const orders = await ordersCollection.find(query).toArray()
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
})
// ...existing code...
