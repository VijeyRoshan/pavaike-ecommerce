# Fixing "Error creating order" on Vercel

## Problem
Getting "Error creating order. Please try again." when trying to checkout on Vercel deployment.

## Root Causes & Solutions

### 1. ⚠️ Missing Environment Variables (MOST COMMON)

**Problem:** Vercel doesn't have access to your `.env` file. You must add environment variables manually.

**Solution:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click your project → **Settings** → **Environment Variables**
3. Add these variables:

```env
# Stripe Keys (REQUIRED)
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxx

# MongoDB Connection (REQUIRED)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pavaike

# API URL (REQUIRED - use your actual Vercel URL)
NEXT_PUBLIC_API_URL=https://pavaike-ecommerce.vercel.app

# JWT Secret (REQUIRED)
JWT_SECRET=your_random_secret_string_here
```

4. Make sure to enable for **Production**, **Preview**, AND **Development**
5. Click **Save**
6. **Redeploy** your application

### 2. 🔑 Stripe API Keys Not Set

**Check if you have Stripe keys:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy **Secret key** (starts with `sk_test_`)
3. Copy **Publishable key** (starts with `pk_test_`)
4. Add both to Vercel environment variables

**Common mistakes:**
- ❌ Using live keys instead of test keys
- ❌ Forgetting the `NEXT_PUBLIC_` prefix for publishable key
- ❌ Keys have extra spaces or quotes

### 3. 🗄️ MongoDB Connection Issues

**Problem:** Vercel can't connect to MongoDB Atlas.

**Solution:**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **Network Access** (left sidebar)
3. Click **"Add IP Address"**
4. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Click **"Confirm"**
6. Wait 2-3 minutes for changes to apply

**Check your MONGO_URI format:**
```
mongodb+srv://username:password@cluster.mongodb.net/pavaike?retryWrites=true&w=majority
```

### 4. 🌐 NEXT_PUBLIC_API_URL Not Set

**Problem:** The checkout API needs to know your deployment URL for redirects.

**Solution:**

1. Copy your Vercel deployment URL (e.g., `https://pavaike-ecommerce.vercel.app`)
2. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://pavaike-ecommerce.vercel.app
   ```
3. **Important:** No trailing slash!
4. Redeploy

### 5. 📝 Check Vercel Function Logs

**To see the actual error:**

1. Go to Vercel Dashboard
2. Click your project
3. Go to **Deployments** tab
4. Click on the latest deployment
5. Click **Functions** tab
6. Find `/api/checkout` in the list
7. Click to see logs and errors

**Common errors you might see:**
- `Stripe API key not found` → Add STRIPE_SECRET_KEY
- `MongoServerError: bad auth` → Check MONGO_URI credentials
- `Cannot read property 'create' of undefined` → Stripe not initialized

## 🔧 Step-by-Step Fix

### Step 1: Add All Environment Variables

Go to Vercel → Settings → Environment Variables and add:

| Variable | Example Value | Where to Get It |
|----------|---------------|-----------------|
| `STRIPE_SECRET_KEY` | `sk_test_51Hxxx...` | [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_51Hxxx...` | [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster...` | [MongoDB Atlas](https://cloud.mongodb.com) |
| `NEXT_PUBLIC_API_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL |
| `JWT_SECRET` | `any_random_string` | Generate with `openssl rand -base64 32` |

### Step 2: Configure MongoDB Network Access

1. MongoDB Atlas → Network Access
2. Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
3. Confirm and wait 2 minutes

### Step 3: Redeploy

1. Vercel Dashboard → Deployments
2. Click three dots on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 4: Test

1. Go to your Vercel URL
2. Add a product to cart
3. Go to checkout
4. Fill in all fields
5. Click "Proceed to Payment"
6. Should redirect to Stripe checkout page

## 🐛 Still Not Working?

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try checkout again
4. Look for error messages
5. Check the **Network** tab for failed requests

### Test Locally First

```bash
# Make sure it works locally
npm run dev

# Test checkout on localhost:3000
# If it works locally but not on Vercel, it's an environment variable issue
```

### Verify Environment Variables Are Set

Add this test endpoint to check:

Create `/app/api/test-env/route.ts`:
```typescript
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    hasMongoUri: !!process.env.MONGO_URI,
    hasApiUrl: !!process.env.NEXT_PUBLIC_API_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
  })
}
```

Then visit: `https://your-app.vercel.app/api/test-env`

Should return:
```json
{
  "hasStripeKey": true,
  "hasMongoUri": true,
  "hasApiUrl": true,
  "hasJwtSecret": true
}
```

If any are `false`, that variable is missing!

## 📋 Checklist

Before asking for help, verify:

- [ ] All environment variables added to Vercel
- [ ] Environment variables enabled for Production
- [ ] MongoDB Network Access allows 0.0.0.0/0
- [ ] MONGO_URI is correct (test in MongoDB Compass)
- [ ] Stripe keys are test keys (start with `sk_test_` and `pk_test_`)
- [ ] NEXT_PUBLIC_API_URL matches your Vercel URL
- [ ] Redeployed after adding environment variables
- [ ] Checked Vercel function logs for errors
- [ ] Works locally with `npm run dev`

## 🆘 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Checkout failed" | Generic error | Check Vercel function logs |
| "Stripe failed to load" | Missing publishable key | Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| "No items in cart" | Cart is empty | Add products to cart first |
| Network error | MongoDB connection | Check Network Access in Atlas |
| 500 Internal Server Error | Server-side error | Check Vercel function logs |

## 📞 Need More Help?

1. Check Vercel function logs (most important!)
2. Check browser console for client-side errors
3. Verify all environment variables are set
4. Test locally to isolate the issue
5. Check MongoDB Atlas connection logs

## 🎯 Quick Test

After fixing, test with Stripe test card:
- **Card Number:** 4242 4242 4242 4242
- **Expiry:** Any future date (e.g., 12/34)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)
