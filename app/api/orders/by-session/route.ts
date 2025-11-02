import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const sessionId = url.searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 })
    }

    const db = await getDatabase()
    const ordersCollection = db.collection("orders")

    const order = await ordersCollection.findOne({ stripeSessionId: sessionId })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Map order document to the frontend shape
    const mapped = {
      orderId: order._id?.toString() ?? null,
      customerName: order.customerName ?? "",
      customerEmail: order.email ?? "",
      items: order.items ?? [],
      shippingAddress: order.shippingAddress ?? {},
      subtotal: order.subtotal ?? 0,
      tax: order.tax ?? 0,
      shipping: order.shipping ?? 0,
      total: order.total ?? 0,
      status: order.status ?? "",
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
    }

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("Fetch order by session error:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
