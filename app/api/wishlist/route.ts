import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { requireAuth } from "@/lib/auth-middleware"

// GET: Get wishlist for current user
export const GET = requireAuth(async (request, payload) => {
  const db = await getDatabase()
  const wishlist = await db.collection("wishlists").findOne({ userId: payload.id })
  return NextResponse.json(wishlist?.productIds || [])
})

// POST: Add product to wishlist
export const POST = requireAuth(async (request, payload) => {
  const { productId } = await request.json()
  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 })
  }
  const db = await getDatabase()
  await db.collection("wishlists").updateOne(
    { userId: payload.id },
    { $addToSet: { productIds: productId } },
    { upsert: true }
  )
  return NextResponse.json({ success: true })
})

// DELETE: Remove product from wishlist
export const DELETE = requireAuth(async (request, payload) => {
  const { productId } = await request.json()
  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 })
  }
  const db = await getDatabase()
  await db.collection("wishlists").updateOne(
    { userId: payload.id },
    { $pull: { productIds: productId } }
  )
  return NextResponse.json({ success: true })
})
