import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken, extractToken } from "@/lib/auth"
import { ObjectId } from "mongodb"
import type { Product, CreateProductInput, UpdateProductInput } from "@/types/product"

// GET /api/admin/products - Get all products
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const token = extractToken(request.headers.get("Authorization"))
    const payload = verifyToken(token || "")
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 })
    }

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

// POST /api/admin/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const token = extractToken(request.headers.get("Authorization"))
    const payload = verifyToken(token || "")
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 })
    }

    const productData: CreateProductInput = await request.json()

    // Validate required fields
    if (!productData.name || !productData.price || productData.stock === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const productsCollection = db.collection("products")

    const result = await productsCollection.insertOne({
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const insertedProduct = await productsCollection.findOne({ _id: result.insertedId })
    
    // Serialize the _id to string
    const serializedProduct = insertedProduct ? {
      ...insertedProduct,
      _id: insertedProduct._id.toString()
    } : null

    return NextResponse.json(serializedProduct, { status: 201 })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

// PATCH /api/admin/products - Update a product
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin token
    const token = extractToken(request.headers.get("Authorization"))
    const payload = verifyToken(token || "")
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 })
    }

    const { id, ...updateData }: { id: string } & UpdateProductInput = await request.json()

    if (!id || Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Missing product id or update data" }, { status: 400 })
    }

    const db = await getDatabase()
    const productsCollection = db.collection("products")

    const result = await productsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date()
        } 
      },
      { returnDocument: "after" }
    )

    if (!result) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Serialize the _id to string
    const serializedProduct = {
      ...result,
      _id: result._id.toString()
    }

    return NextResponse.json(serializedProduct)
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// DELETE /api/admin/products - Delete a product
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin token
    const token = extractToken(request.headers.get("Authorization"))
    const payload = verifyToken(token || "")
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 })
    }

    const db = await getDatabase()
    const productsCollection = db.collection("products")

    const result = await productsCollection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}