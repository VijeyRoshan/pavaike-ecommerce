# Pavaike Backend API

Express.js backend server for Pavaike E-commerce platform.

## Features

- Product management (CRUD)
- Order management
- Stripe payment integration
- MongoDB database
- JWT authentication
- Admin authentication

## Local Development

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file:
```bash
cp env.example .env
```

3. Update `.env` with your credentials

4. Start server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

Server will run on http://localhost:3001

## API Endpoints

### Public
- `GET /health` - Health check
- `GET /api/test-connection` - Test MongoDB connection
- `GET /api/products` - Get all products
- `POST /api/checkout` - Create checkout session
- `POST /api/admin-login` - Admin login

### Admin (requires authentication)
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Create product
- `PATCH /api/admin/products` - Update product
- `DELETE /api/admin/products` - Delete product
- `GET /api/admin/orders` - Get all orders
- `PATCH /api/admin/orders` - Update order status

## Deploy to Render

See RENDER_DEPLOYMENT.md for detailed instructions.
