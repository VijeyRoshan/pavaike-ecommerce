# Complete Deployment Guide - Backend on Render + Frontend on Vercel

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Vercel        │         │   Render.com     │         │  MongoDB    │
│  (Frontend)     │────────▶│   (Backend)      │────────▶│   Atlas     │
│  Next.js        │         │   Express API    │         │             │
└─────────────────┘         └──────────────────┘         └─────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │   Stripe API     │
                            └──────────────────┘
```

## Part 1: Deploy Backend to Render

### Step 1: Push Code to GitHub

```bash
# Navigate to project root
cd /Users/vijeyroshan/Downloads/code

# Add all files
git add .

# Commit changes
git commit -m "Add Express backend for Render deployment"

# Push to GitHub
git push origin main
```

### Step 2: Create Render Account & Deploy

1. **Sign up at Render**
   - Go to [render.com](https://render.com)
   - Click "Get Started" → "Sign up with GitHub"
   - Authorize Render

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Select your repository: `pavaike-ecommerce`
   - Click "Connect"

3. **Configure Service**
   ```
   Name: pavaike-backend
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: server          ⚠️ CRITICAL!
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free (or Starter for production)
   ```

4. **Add Environment Variables**
   
   Click "Advanced" → "Add Environment Variable":
   
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pavaike
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   JWT_SECRET=your_random_jwt_secret_here
   FRONTEND_URL=https://your-vercel-app.vercel.app
   PORT=3001
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait 3-5 minutes
   - You'll get a URL like: `https://pavaike-backend.onrender.com`

### Step 3: Test Backend

Visit these URLs to verify:

```
✅ Health Check:
https://pavaike-backend.onrender.com/health

✅ MongoDB Connection:
https://pavaike-backend.onrender.com/api/test-connection

✅ Products API:
https://pavaike-backend.onrender.com/api/products
```

## Part 2: Update Frontend on Vercel

### Step 1: Update Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click your project → Settings → Environment Variables

**Add this NEW variable:**
```env
NEXT_PUBLIC_BACKEND_URL=https://pavaike-backend.onrender.com
```

**Keep these existing variables:**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=https://your-vercel-app.vercel.app
```

**REMOVE these** (they're now on Render):
```
❌ STRIPE_SECRET_KEY
❌ MONGO_URI
❌ JWT_SECRET
```

### Step 2: Redeploy Frontend

```bash
# Push the updated code
git add .
git commit -m "Update frontend to use Render backend"
git push origin main
```

Vercel will auto-deploy, or manually:
1. Vercel Dashboard → Deployments
2. Click three dots → "Redeploy"

## Part 3: Configure MongoDB Atlas

### Allow Render to Access MongoDB

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Network Access" (left sidebar)
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"
6. Wait 2-3 minutes

## Part 4: Update Render Backend with Frontend URL

After Vercel deploys:

1. Copy your Vercel URL (e.g., `https://pavaike-ecommerce.vercel.app`)
2. Go to Render Dashboard → Your Service
3. Click "Environment" tab
4. Update `FRONTEND_URL` with your actual Vercel URL
5. Save changes (Render will auto-redeploy)

## Part 5: Test Complete Setup

### Test 1: Products Page
1. Visit: `https://your-vercel-app.vercel.app/products`
2. Should show products from MongoDB
3. Check browser console - no errors

### Test 2: Add to Cart
1. Click "Add to Cart" on any product
2. Should see toast notification
3. Cart should update

### Test 3: Checkout
1. Go to cart → Checkout
2. Fill in all fields
3. Click "Proceed to Payment"
4. Should redirect to Stripe checkout page
5. Use test card: `4242 4242 4242 4242`

### Test 4: Admin Panel
1. Visit: `https://your-vercel-app.vercel.app/admin-login`
2. Login with admin credentials
3. Should see admin dashboard
4. Try adding/editing/deleting products

## Environment Variables Summary

### Render (Backend)
```env
MONGO_URI=mongodb+srv://...
STRIPE_SECRET_KEY=sk_test_...
JWT_SECRET=random_secret
FRONTEND_URL=https://your-vercel-app.vercel.app
PORT=3001
```

### Vercel (Frontend)
```env
NEXT_PUBLIC_BACKEND_URL=https://pavaike-backend.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=https://your-vercel-app.vercel.app
```

### MongoDB Atlas
```
Network Access: 0.0.0.0/0 (Allow from anywhere)
```

## Troubleshooting

### Backend Issues

**Problem: Backend not responding**
- Check Render logs: Dashboard → Logs tab
- Verify environment variables are set
- Check MongoDB Atlas Network Access

**Problem: MongoDB connection failed**
- Verify MONGO_URI is correct
- Check MongoDB Atlas Network Access (0.0.0.0/0)
- Test connection: `/api/test-connection`

**Problem: Stripe errors**
- Verify STRIPE_SECRET_KEY is set on Render
- Check it starts with `sk_test_`
- View Render logs for detailed error

### Frontend Issues

**Problem: Products not loading**
- Check NEXT_PUBLIC_BACKEND_URL is set on Vercel
- Verify backend is running (visit health check)
- Check browser console for CORS errors

**Problem: Checkout fails**
- Verify NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY on Vercel
- Check backend STRIPE_SECRET_KEY on Render
- View Render logs during checkout

**Problem: CORS errors**
- Verify FRONTEND_URL on Render matches Vercel URL
- Check browser console for exact error
- Render backend should allow your Vercel domain

### Check Logs

**Render Logs:**
1. Render Dashboard → Your Service
2. Click "Logs" tab
3. See real-time server logs

**Vercel Logs:**
1. Vercel Dashboard → Your Project
2. Deployments → Click deployment
3. Functions tab → View function logs

## Performance Notes

### Render Free Tier
- ⚠️ Spins down after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Upgrade to Starter ($7/month) for always-on

### Optimization Tips
1. Use Render Starter plan for production
2. Enable Vercel Edge Functions for faster API calls
3. Add caching headers to product responses
4. Use MongoDB indexes for faster queries

## Security Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] MongoDB Network Access configured
- [ ] CORS configured with specific frontend URL
- [ ] JWT_SECRET is random and secure
- [ ] Using Stripe test keys for testing
- [ ] Switch to live keys only for production

## Next Steps

1. ✅ Backend deployed on Render
2. ✅ Frontend deployed on Vercel
3. ✅ MongoDB configured
4. ✅ Environment variables set
5. ✅ Test all features
6. 🎯 Add custom domain (optional)
7. 🎯 Switch to Stripe live keys (when ready)
8. 🎯 Upgrade Render to Starter plan (for production)

## Support

If you encounter issues:
1. Check Render logs first
2. Check Vercel function logs
3. Verify all environment variables
4. Test backend endpoints directly
5. Check MongoDB Atlas connection

## Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `https://your-app.vercel.app` | Next.js UI |
| Backend | `https://pavaike-backend.onrender.com` | Express API |
| MongoDB | `mongodb+srv://...` | Database |
| Stripe | `dashboard.stripe.com` | Payments |

---

**Deployment Complete!** 🎉

Your e-commerce platform is now running with:
- ✅ Frontend on Vercel
- ✅ Backend on Render
- ✅ Database on MongoDB Atlas
- ✅ Payments via Stripe
