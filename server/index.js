const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const Stripe = require('stripe');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// MongoDB connection
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('pavaike');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Auth Middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Admin Middleware
function verifyAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test MongoDB connection
app.get('/api/test-connection', async (req, res) => {
  try {
    await connectToDatabase();
    res.json({ status: 'Connected to MongoDB Atlas successfully' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: 'Not connected to MongoDB Atlas', 
      error: error.message 
    });
  }
});

// ==================== PRODUCTS API ====================

// Get all products (public)
app.get('/api/products', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const products = await db.collection('products').find({}).toArray();
    
    const serializedProducts = products.map(product => ({
      ...product,
      _id: product._id.toString()
    }));
    
    res.json(serializedProducts);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get all products (admin)
app.get('/api/admin/products', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const products = await db.collection('products').find({}).toArray();
    
    const serializedProducts = products.map(product => ({
      ...product,
      _id: product._id.toString()
    }));
    
    res.json(serializedProducts);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create product (admin)
app.post('/api/admin/products', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const productData = req.body;

    if (!productData.name || !productData.price || productData.stock === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection('products').insertOne({
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const insertedProduct = await db.collection('products').findOne({ 
      _id: result.insertedId 
    });
    
    const serializedProduct = {
      ...insertedProduct,
      _id: insertedProduct._id.toString()
    };

    res.status(201).json(serializedProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (admin)
app.patch('/api/admin/products', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    if (!id || Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Missing product id or update data' });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const serializedProduct = {
      ...result,
      _id: result._id.toString()
    };

    res.json(serializedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin)
app.delete('/api/admin/products', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing product id' });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection('products').deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ==================== CHECKOUT API ====================

app.post('/api/checkout', async (req, res) => {
  try {
    const { items, email, fullName, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    // Calculate total
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const shipping = 10;
    const total = subtotal + tax + shipping;

    // Create line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add tax and shipping
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Tax' },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    });

    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Shipping' },
        unit_amount: Math.round(shipping * 100),
      },
      quantity: 1,
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      customer_email: email,
    });

    // Save order and reduce stock
    const { db } = await connectToDatabase();
    
    // Reduce stock for each product
    for (const item of items) {
      try {
        await db.collection('products').updateOne(
          { _id: new ObjectId(item.id) },
          { $inc: { stock: -item.quantity } }
        );
      } catch (err) {
        console.error(`Failed to reduce stock for product ${item.id}:`, err);
      }
    }

    // Save order
    const orderResult = await db.collection('orders').insertOne({
      stripeSessionId: session.id,
      customerName: fullName || null,
      email,
      shippingAddress,
      items,
      subtotal,
      tax,
      shipping,
      total,
      status: 'Pending',
      createdAt: new Date(),
    });

    res.json({
      sessionId: session.id,
      orderId: orderResult.insertedId.toString(),
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Checkout failed', message: error.message });
  }
});

// ==================== ORDERS API ====================

// Get all orders (admin)
app.get('/api/admin/orders', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const orders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    const serializedOrders = orders.map(order => ({
      ...order,
      _id: order._id.toString()
    }));
    
    res.json(serializedOrders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status (admin)
app.patch('/api/admin/orders', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: 'Missing order id or status' });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const serializedOrder = {
      ...result,
      _id: result._id.toString()
    };

    res.json(serializedOrder);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// ==================== AUTH API ====================

// Admin login
app.post('/api/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { db } = await connectToDatabase();
    const admin = await db.collection('admins').findOne({ email });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id.toString(), email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, admin: { email: admin.email, role: 'admin' } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  if (cachedClient) {
    await cachedClient.close();
  }
  process.exit(0);
});
