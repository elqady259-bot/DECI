# E-Commerce Backend API

A RESTful E-Commerce backend API built with **Node.js**, **Express**, and **MongoDB (Mongoose)** following the **MVC architecture**. It supports product catalog management, shopping carts, and an order checkout flow with server-side price calculation.

## Features

- **MVC Architecture** — clean separation of models, controllers, routes, config, and middleware.
- **Categories & Products** — full CRUD with schema validation and ObjectId references.
- **Dynamic Filtering** — filter products by price range, category, stock status, and text search; with sorting, field selection, and pagination.
- **Populate** — product details return the full category info, not just an ID.
- **Virtual Fields** — `inStock` field automatically calculated from stock quantity.
- **Cart API** — persistent cart per user with add / update quantity / remove item / clear.
- **Orders & Checkout** — converts a cart into an order; the **server recalculates prices from the database** (never trusts client-sent prices) and decrements product stock.
- **Centralized Error Handling** — catches `ValidationError`, `CastError`, and duplicate-key errors in one middleware.
- **Security** — `express-mongo-sanitize` prevents NoSQL injection.
- **Seed Script** — populate the database with sample data in one command.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- dotenv
- express-mongo-sanitize
- express-validator

## Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd ecommerce-backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string and port

# 4. Seed the database (optional but recommended)
npm run seed

# 5. Start the server
npm start
# or for development with auto-reload:
npm run dev
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable     | Description                          | Default                              |
| ------------ | ------------------------------------ | ------------------------------------ |
| `PORT`       | Port the server listens on           | `3000`                               |
| `MONGO_URI`  | MongoDB connection string            | `mongodb://127.0.0.1:27017/ecommerce` |
| `NODE_ENV`   | Environment (`development`/`production`) | `development`                    |

Example `.env`:

```
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce
NODE_ENV=development
```

## Project Structure

```
.
├── config/
│   └── db.js              # MongoDB connection setup
├── controllers/           # Business logic for each resource
│   ├── categoryController.js
│   ├── productController.js
│   ├── cartController.js
│   └── orderController.js
├── middleware/
│   ├── errorHandler.js    # Global error handler middleware
│   ├── notFound.js        # 404 handler
│   └── sanitize.js        # Input sanitization
├── models/                # Mongoose schemas
│   ├── Category.js        # Category schema with slug
│   ├── Product.js         # Product schema with virtual inStock
│   ├── Cart.js            # Cart schema with totalPrice calculation
│   └── Order.js           # Order schema with orderNumber generation
├── routes/                # Express routers
│   ├── categoryRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   └── orderRoutes.js
├── utils/
│   ├── ApiError.js        # Custom error class with status codes
│   └── asyncHandler.js    # Async wrapper for automatic error catching
├── app.js                 # Express app configuration
├── server.js              # Entry point with DB connection
├── seed.js                # Database seed script with sample data
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
└── postman_collection.json # API documentation for Postman
```

## API Endpoints

All requests return JSON responses in the format:
```json
{
  "success": true,
  "data": {}
}
```

### Categories

| Method   | Endpoint              | Description                                  |
| -------- | --------------------- | -------------------------------------------- |
| `POST`   | `/api/categories`     | Create a category                            |
| `GET`    | `/api/categories`     | Get all categories                           |
| `GET`    | `/api/categories/:id` | Get a single category by ID                  |
| `PATCH`  | `/api/categories/:id` | Update a category                            |
| `DELETE` | `/api/categories/:id` | Delete a category (only if no products)      |

### Products

| Method   | Endpoint              | Description                                                        |
| -------- | ---------------------- | ------------------------------------------------------------------ |
| `POST`   | `/api/products`       | Create a product (validates category exists)                       |
| `GET`    | `/api/products`       | Get all products with filtering and pagination                    |
| `GET`    | `/api/products/:id`   | Get a single product with category details                        |
| `PATCH`  | `/api/products/:id`   | Update a product                                                   |
| `DELETE` | `/api/products/:id`   | Delete a product                                                   |

**Query Parameters for GET /api/products:**

- `category=<id>` — Filter by category ID
- `minPrice=<number>` — Filter products with price >= minPrice
- `maxPrice=<number>` — Filter products with price <= maxPrice
- `search=<keyword>` — Search in product name and description
- `inStock=true` — Show only products with stock > 0
- `sort=<field>` — Sort by field (use `-` for descending, e.g., `-price`)
- `fields=<field1>,<field2>` — Select specific fields to return
- `page=<number>` — Page number (default: 1)
- `limit=<number>` — Items per page (default: 25)

**Example:**
```
GET /api/products?minPrice=1000&maxPrice=50000&category=<categoryId>&inStock=true&sort=-price&page=1&limit=10
```

### Cart

> **Important:** All cart endpoints require an `x-user-id` header to identify the user's cart.

Example header: `x-user-id: 507f1f77bcf86cd799439011`

| Method   | Endpoint                       | Description                          |
| -------- | ------------------------------ | ------------------------------------ |
| `GET`    | `/api/cart`                    | Get the user's current cart          |
| `POST`   | `/api/cart/items`              | Add a product to the cart            |
| `PATCH`  | `/api/cart/items/:productId`   | Update item quantity (or remove if qty=0)    |
| `DELETE` | `/api/cart/items/:productId`   | Remove an item from the cart         |
| `DELETE` | `/api/cart`                    | Clear the entire cart                |

**POST /api/cart/items** request body:
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 2
}
```

**PATCH /api/cart/items/:productId** request body:
```json
{
  "quantity": 5
}
```

**Cart Response:**
```json
{
  "success": true,
  "data": {
    "user": "507f1f77bcf86cd799439011",
    "items": [
      {
        "product": "507f1f77bcf86cd799439012",
        "quantity": 2,
        "price": 5000
      }
    ],
    "totalPrice": 10000,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Orders

> **Important:** Order creation and listing require an `x-user-id` header.

| Method   | Endpoint                     | Description                                              |
| -------- | ---------------------------- | -------------------------------------------------------- |
| `POST`   | `/api/orders`                | Checkout: convert cart into an order                     |
| `GET`    | `/api/orders`                | Get all user orders                                      |
| `GET`    | `/api/orders/:id`            | Get a single order by ID                                 |
| `PATCH`  | `/api/orders/:id/status`     | Update order status                                      |

**POST /api/orders** request body:
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Cairo",
    "country": "Egypt"
  }
}
```

**PATCH /api/orders/:id/status** request body:
```json
{
  "status": "confirmed"
}
```

**Valid Status Values:**
- `pending` — Order created, awaiting confirmation
- `confirmed` — Order confirmed
- `shipped` — Order shipped
- `delivered` — Order delivered
- `cancelled` — Order cancelled

**Order Response:**
```json
{
  "success": true,
  "data": {
    "orderNumber": "ORD-1704110400000-1",
    "user": "507f1f77bcf86cd799439011",
    "items": [
      {
        "product": "507f1f77bcf86cd799439012",
        "name": "MacBook Pro 16",
        "price": 45000,
        "quantity": 1
      }
    ],
    "totalPrice": 45000,
    "status": "pending",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Cairo",
      "country": "Egypt"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common Error Codes:**

| Status | Message | Reason |
| ------ | ------- | ------ |
| 400    | Bad Request | Invalid input, missing required fields, or validation failed |
| 404    | Not Found | Resource (category, product, cart, order) does not exist |
| 409    | Conflict | Duplicate field value (e.g., category name already exists) |
| 500    | Server Error | Unexpected server error |

## Key Features Explained

### 1. Server-Side Price Calculation

When a user creates an order, the server:
1. Fetches each product from the database (never trusts client-sent prices)
2. Calculates `totalPrice` from real product prices
3. Reduces product stock by the ordered quantity
4. Clears the user's cart

This prevents price manipulation attacks.

### 2. Cart Persistence

Carts are stored in the database (not in memory), so they persist even if:
- The user closes the browser
- The server restarts
- Multiple sessions exist for the same user

### 3. Auto-Generated Fields

- **Category slug:** Automatically generated from name (e.g., "Electronics" → "electronics")
- **Product inStock:** Virtual field calculated from stock quantity (true if stock > 0)
- **Order Number:** Unique identifier generated on order creation

### 4. Input Sanitization

`express-mongo-sanitize` strips `$` and `.` characters from user input to prevent NoSQL injection attacks like:
```javascript
// Prevented: {"email": {"$ne": null}}
// Cleaned to: {"email": {"ne": null}}
```

## Testing with Postman

1. Import `postman_collection.json` into Postman
2. Create an environment variable `url` set to `http://localhost:3000/api`
3. Create an environment variable `x-user-id` set to a user ID (e.g., `507f1f77bcf86cd799439011`)
4. Use the environment variables in your requests

**Example Request:**
```
GET {{url}}/products?minPrice=1000&maxPrice=50000&inStock=true
Header: x-user-id: {{x-user-id}}
```

## Database Setup

### Local MongoDB

```bash
# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Start MongoDB (Windows)
# MongoDB should be running as a service

# Verify connection
mongosh
```

### MongoDB Atlas (Cloud)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Add your IP to the IP Whitelist
3. Create a database user
4. Update `MONGO_URI` in `.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
```

## Seed Data

The seed script populates the database with:
- **3 Categories:** Electronics, Accessories, Gaming
- **14 Products:** Distributed across categories with realistic prices and stock

Run it with:
```bash
npm run seed
```

**Output:**
```
✅ Database seeded successfully!
📁 Categories created: 3
📦 Products created: 14
```

## Development

### Watch Mode
Auto-reload server on file changes:
```bash
npm run dev
```

### Build Check
Verify the project structure:
```bash
npm run build
```

## Security Notes

- **Price Tampering:** Server never accepts prices from the client. All prices come from the database.
- **NoSQL Injection:** Input is sanitized with `express-mongo-sanitize`.
- **Environment Variables:** Sensitive data (MONGO_URI) is stored in `.env` and never committed to git.
- **Category Deletion:** Categories cannot be deleted if products reference them.

## License

MIT

---

**Built with ❤️ for the Digital Egypt Cubs Initiative**
