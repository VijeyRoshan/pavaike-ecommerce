import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken, extractToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("Authorization"))
    const payload = verifyToken(token || "")

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 })
    }

    const db = await getDatabase()
    const ordersCollection = db.collection("orders")

    // Get all orders, sorted by createdAt in descending order
    const orders = await ordersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("Authorization"))
    const payload = verifyToken(token || "")

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 })
    }

    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 })
    }

    const db = await getDatabase()
    const ordersCollection = db.collection("orders")

    const result = await ordersCollection.findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        } 
      },
      { returnDocument: "after" }
    )

    if (!result) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Update order error:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}