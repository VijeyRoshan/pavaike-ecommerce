import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken, extractToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const db = await getDatabase()
    const productsCollection = db.collection("products")
    const products = await productsCollection.find({}).toArray()
    
    // Convert MongoDB _id to string for JSON serialization
    const serializedProducts = products.map(product => ({
      ...product,
      _id: product._id.toString()
    }))
    
    return NextResponse.json(serializedProducts)
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("Authorization"))
    const payload = verifyToken(token || "")

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 })
    }

    const { name, price, stock, description } = await request.json()

    if (!name || !price || stock === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const productsCollection = db.collection("products")

    const result = await productsCollection.insertOne({
      name,
      price,
      stock,
      description,
      createdAt: new Date(),
    })

    return NextResponse.json({ id: result.insertedId, name, price, stock, description }, { status: 201 })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("Authorization"))
    const payload = verifyToken(token || "")

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 })
    }

    const { productId, ...updateData } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const productsCollection = db.collection("products")

    const result = await productsCollection.updateOne(
      { _id: new ObjectId(productId) },
      { $set: { ...updateData, updatedAt: new Date() } },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("Authorization"))
    const payload = verifyToken(token || "")

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const productsCollection = db.collection("products")

    const result = await productsCollection.deleteOne({
      _id: new ObjectId(productId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
