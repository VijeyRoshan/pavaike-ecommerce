import { MongoClient } from "mongodb"

let cachedClient: MongoClient | null = null

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient
  }

  const uri = process.env.MONGO_URI
  if (!uri) {
    throw new Error("MONGO_URI is not defined")
  }

  try {
    const client = new MongoClient(uri)
    await client.connect()
    console.log("Connected to MongoDB Atlas successfully")
    cachedClient = client
    return client
  } catch (error) {
    console.log("Not connected to MongoDB Atlas")
    throw error
  }
}

export async function getDatabase() {
  const client = await connectToDatabase()
  return client.db("pavaike")
}
