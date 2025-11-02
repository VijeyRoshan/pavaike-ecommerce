import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken, extractToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { items, email, fullName, shippingAddress } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 })
    }

    // Verify token if provided
    const token = extractToken(request.headers.get("Authorization"))
    let userId = null
    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        userId = payload.id
      }
    }

    // Calculate total
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.1
    const shipping = 10
    const total = subtotal + tax + shipping

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    // Add tax and shipping as line items
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Tax",
        },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    })

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Shipping",
        },
        unit_amount: Math.round(shipping * 100),
      },
      quantity: 1,
    })

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_API_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/cart`,
      customer_email: email,
    })

    // Save order to MongoDB (in pending state)
    const db = await getDatabase()
    const ordersCollection = db.collection("orders")
    const productsCollection = db.collection("products")

    // Reduce stock for each product
    for (const item of items) {
      try {
        const result = await productsCollection.updateOne(
          { _id: new ObjectId(item.id) },
          { $inc: { stock: -item.quantity } }
        )
        
        if (result.matchedCount === 0) {
          console.warn(`Product ${item.id} not found for stock reduction`)
        }
      } catch (err) {
        console.error(`Failed to reduce stock for product ${item.id}:`, err)
        // Continue with other products even if one fails
      }
    }

    const orderResult = await ordersCollection.insertOne({
      stripeSessionId: session.id,
      userId,
      customerName: fullName || null,
      email,
      shippingAddress,
      items,
      subtotal,
      tax,
      shipping,
      total,
      status: "Pending",
      createdAt: new Date(),
    })

    return NextResponse.json({
      sessionId: session.id,
      orderId: orderResult.insertedId.toString(),
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 })
  }
}
