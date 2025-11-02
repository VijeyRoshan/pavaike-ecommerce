// test-mongo.js
import { MongoClient } from "mongodb"
const uri = process.env.MONGO_URI || "mongodb+srv://VijeyRoshan:VijeyRoshan123@cluster0.oaukwdx.mongodb.net/pavaike?retryWrites=true&w=majority"
async function run() {
  try {
    const client = new MongoClient(uri)
    await client.connect()
    console.log("Connected to MongoDB Atlas successfully")
    await client.db("pavaike").command({ ping: 1 })
    console.log("Ping successful")
    await client.close()
  } catch (err) {
    console.error("Connection error:", err)
  }
}
run()