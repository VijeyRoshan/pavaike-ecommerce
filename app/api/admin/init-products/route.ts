import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

const sampleProducts = [
  {
    name: "Premium Wireless Headphones",
    price: 199.99,
    stock: 45,
    category: "Audio",
    description: "High-quality wireless headphones with noise cancellation"
  },
  {
    name: "Smart Watch Pro",
    price: 349.99,
    stock: 32,
    category: "Wearables",
    description: "Advanced smartwatch with health monitoring features"
  },
  {
    name: "USB-C Cable Pack",
    price: 29.99,
    stock: 120,
    category: "Accessories",
    description: "Pack of 3 high-speed USB-C cables"
  },
  {
    name: "Portable Charger",
    price: 89.99,
    stock: 75,
    category: "Accessories",
    description: "20000mAh portable power bank with fast charging"
  }
]

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const productsCollection = db.collection("products")
    
    // Check if products already exist
    const existingProducts = await productsCollection.countDocuments()
    if (existingProducts > 0) {
      return NextResponse.json({ message: "Products already initialized" })
    }

    // Insert sample products
    const result = await productsCollection.insertMany(
      sampleProducts.map(product => ({
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )

    return NextResponse.json({ 
      message: "Sample products initialized successfully",
      count: result.insertedCount
    })
  } catch (error) {
    console.error("Init products error:", error)
    return NextResponse.json({ error: "Failed to initialize products" }, { status: 500 })
  }
}