# 🚀 Deployment Checklist - Quick Start

## Before You Start

Make sure you have:
- [ ] GitHub account with your code pushed
- [ ] MongoDB Atlas account with database created
- [ ] Stripe account with test API keys
- [ ] Vercel account (for frontend)
- [ ] Render account (for backend)

## Step-by-Step Checklist

### 1️⃣ Push Code to GitHub
```bash
cd /Users/vijeyroshan/Downloads/code
git add .
git commit -m "Prepare for deployment"
git push origin main
```
- [ ] Code pushed successfully

### 2️⃣ Deploy Backend to Render

- [ ] Go to [render.com](https://render.com)
- [ ] Sign up with GitHub
- [ ] Click "New +" → "Web Service"
- [ ] Select `pavaike-ecommerce` repository
- [ ] Configure:
  - Root Directory: `server`
  - Build Command: `npm install`
  - Start Command: `npm start`
- [ ] Add environment variables:
  - `MONGO_URI`
  - `STRIPE_SECRET_KEY`
  - `JWT_SECRET`
  - `FRONTEND_URL` (your Vercel URL)
  - `PORT=3001`
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (3-5 minutes)
- [ ] Copy your Render URL: `https://pavaike-backend.onrender.com`

### 3️⃣ Test Backend

Visit these URLs:
- [ ] `https://pavaike-backend.onrender.com/health` → Should return OK
- [ ] `https://pavaike-backend.onrender.com/api/test-connection` → Should confirm MongoDB
- [ ] `https://pavaike-backend.onrender.com/api/products` → Should return products

### 4️⃣ Configure MongoDB Atlas

- [ ] Go to [MongoDB Atlas](https://cloud.mongodb.com)
- [ ] Network Access → Add IP Address
- [ ] Select "Allow Access from Anywhere" (0.0.0.0/0)
- [ ] Confirm and wait 2 minutes

### 5️⃣ Update Vercel Frontend

- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Click your project → Settings → Environment Variables
- [ ] Add: `NEXT_PUBLIC_BACKEND_URL=https://pavaike-backend.onrender.com`
- [ ] Keep: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Keep: `NEXT_PUBLIC_API_URL`
- [ ] Remove: `STRIPE_SECRET_KEY`, `MONGO_URI`, `JWT_SECRET`
- [ ] Redeploy

### 6️⃣ Update Render with Vercel URL

- [ ] Copy your Vercel URL
- [ ] Go to Render → Your Service → Environment
- [ ] Update `FRONTEND_URL` with Vercel URL
- [ ] Save (auto-redeploys)

### 7️⃣ Test Complete Setup

- [ ] Visit your Vercel URL
- [ ] Browse products page
- [ ] Add product to cart (toast should appear)
- [ ] Go to checkout
- [ ] Fill form and proceed to payment
- [ ] Should redirect to Stripe
- [ ] Test with card: `4242 4242 4242 4242`

### 8️⃣ Test Admin Panel

- [ ] Visit `/admin-login`
- [ ] Login with admin credentials
- [ ] Add a new product
- [ ] Check if it appears on products page
- [ ] Edit product
- [ ] Delete product

## Environment Variables Reference

### ✅ Render (Backend)
```
MONGO_URI=mongodb+srv://...
STRIPE_SECRET_KEY=sk_test_...
JWT_SECRET=random_string
FRONTEND_URL=https://your-app.vercel.app
PORT=3001
```

### ✅ Vercel (Frontend)
```
NEXT_PUBLIC_BACKEND_URL=https://pavaike-backend.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
```

## Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| Backend not responding | Check Render logs |
| Products not loading | Verify NEXT_PUBLIC_BACKEND_URL on Vercel |
| Checkout fails | Check STRIPE_SECRET_KEY on Render |
| MongoDB error | Allow 0.0.0.0/0 in Network Access |
| CORS error | Update FRONTEND_URL on Render |

## URLs to Save

- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://pavaike-backend.onrender.com`
- **Backend Health:** `https://pavaike-backend.onrender.com/health`
- **MongoDB:** `https://cloud.mongodb.com`
- **Stripe:** `https://dashboard.stripe.com`
- **Render:** `https://dashboard.render.com`
- **Vercel:** `https://vercel.com/dashboard`

## Final Check

- [ ] Frontend loads without errors
- [ ] Products display correctly
- [ ] Add to cart works with toast
- [ ] Checkout redirects to Stripe
- [ ] Admin panel accessible
- [ ] Can add/edit/delete products
- [ ] Stock reduces after purchase

## 🎉 Deployment Complete!

Your app is now live with:
- ✅ Frontend on Vercel
- ✅ Backend on Render
- ✅ Database on MongoDB Atlas
- ✅ Payments via Stripe

---

**Need Help?** Check `COMPLETE_DEPLOYMENT_GUIDE.md` for detailed instructions.
