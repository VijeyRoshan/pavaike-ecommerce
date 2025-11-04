# Deploy Backend to Render - Complete Guide

## Overview

This guide will help you:
1. Deploy the Express backend to Render
2. Update the Next.js frontend to use the Render backend
3. Configure environment variables
4. Test the complete setup

## Part 1: Prepare Backend for Render

### Step 1: Push Backend Code to GitHub

```bash
# Make sure you're in the project root
cd /Users/vijeyroshan/Downloads/code

# Add all files
git add .

# Commit
git commit -m "Add Express backend server for Render deployment"

# Push to GitHub
git push origin main
```

## Part 2: Deploy to Render

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Click **"Get Started"** or **"Sign Up"**
3. Choose **"Sign up with GitHub"**
4. Authorize Render to access your repositories

### Step 2: Create New Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your GitHub repository: `pavaike-ecommerce`
4. Click **"Connect"**

### Step 3: Configure Web Service

Fill in these settings:

**Basic Settings:**
- **Name:** `pavaike-backend` (or any name you prefer)
- **Region:** Choose closest to you (e.g., Oregon, Frankfurt)
- **Branch:** `main`
- **Root Directory:** `server` ⚠️ IMPORTANT!
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Select **"Free"** (for testing) or **"Starter"** ($7/month for production)

### Step 4: Add Environment Variables

Scroll down to **"Environment Variables"** section and add:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pavaike
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
JWT_SECRET=your_random_jwt_secret
FRONTEND_URL=https://your-vercel-app.vercel.app
PORT=3001
```

**Where to get these:**
- `MONGO_URI`: MongoDB Atlas connection string
- `STRIPE_SECRET_KEY`: From Stripe Dashboard
- `JWT_SECRET`: Any random string (generate with `openssl rand -base64 32`)
- `FRONTEND_URL`: Your Vercel deployment URL
- `PORT`: Leave as 3001 (Render will use it)

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. You'll get a URL like: `https://pavaike-backend.onrender.com`

### Step 6: Test Backend

Visit these URLs to test:
- `https://pavaike-backend.onrender.com/health` - Should return `{"status":"OK"}`
- `https://pavaike-backend.onrender.com/api/test-connection` - Should confirm MongoDB connection
- `https://pavaike-backend.onrender.com/api/products` - Should return products list

## Part 3: Update Frontend to Use Render Backend

### Step 1: Update Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Add/Update this variable:

```env
NEXT_PUBLIC_BACKEND_URL=https://pavaike-backend.onrender.com
```

5. Keep existing variables:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
```

6. **Remove these** (no longer needed on frontend):
```
STRIPE_SECRET_KEY (move to Render)
MONGO_URI (move to Render)
JWT_SECRET (move to Render)
```

### Step 2: Update Frontend API Calls

The frontend needs to call the Render backend instead of Next.js API routes.

I'll create a helper file for this:
