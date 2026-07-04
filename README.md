# E-Commerce Backend API

A RESTful E-Commerce backend API built with **Node.js**, **Express**, and **MongoDB (Mongoose)** following the **MVC architecture**. It supports product catalog management, shopping carts, and an order checkout flow with server-side price calculation.

## Features

- **MVC Architecture** — clean separation of models, controllers, routes, config, and middleware.
- **Categories & Products** — full CRUD with schema validation and ObjectId references.
- **Dynamic Filtering** — filter products by price range, category, and name; with sorting, field selection, and pagination.
- **Populate** — product details return the full category info, not just an ID.
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

## Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd ecommerce-backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env   # then edit values if needed

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
│   └── db.js              # MongoDB connection
├── controllers/          # Route logic (controllers)
│   ├── categoryController.js
│   ├── productController.js
│   ├── cartController.js
│   └── orderController.js
├── middleware/
│   ├── errorHandler.js    # Global error handler
│   └── notFound.js        # 404 handler
├── models/                # Mongoose schemas
│   ├── Category.js
│   ├── Product.js
│   ├── Cart.js
│   └── Order.js
├── routes/                # Express routers
│   ├── categoryRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   └── orderRoutes.js
├── utils/
│   ├── ApiError.js        # Custom error class
│   └── asyncHandler.js    # Async wrapper (no try/catch)
├── app.js                 # Express app setup
├── server.js              # Entry point
├── seed.js                # Database seed script
└── postman_collection.json
```

## API Endpoints

### Categories

| Method   | Endpoint              | Description          |
| -------- | --------------------- | -------------------- |
| `POST`   | `/api/categories`     | Create a category    |
| `GET`    | `/api/categories`     | Get all categories   |
| `GET`    | `/api/categories/:id` | Get a single category|
| `PUT`    | `/api/categories/:id` | Update a category    |
| `DELETE` | `/api/categories/:id` | Delete a category    |

### Products

| Method   | Endpoint             | Description                                                        |
| -------- | -------------------- | ------------------------------------------------------------------ |
| `POST`   | `/api/products`      | Create a product                                                   |
| `GET`    | `/api/products`      | Get all products (supports `minPrice`, `maxPrice`, `category`, `name`, `sort`, `fields`, `page`, `limit`) |
| `GET`    | `/api/products/:id` | Get a single product (with category populated)                    |
| `PUT`    | `/api/products/:id` | Update a product                                                   |
| `DELETE` | `/api/products/:id` | Delete a product                                                   |

**Filtering example:**

```
GET /api/products?minPrice=1000&maxPrice=50000&category=<categoryId>&sort=-price&page=1&limit=10
```

### Cart

> All cart endpoints require an `x-user-id` header to identify the cart owner.

| Method   | Endpoint                  | Description                          |
| -------- | ------------------------- | ------------------------------------ |
| `GET`    | `/api/cart`               | Get the user's cart                  |
| `POST`   | `/api/cart`               | Add an item to the cart              |
| `PUT`    | `/api/cart/:productId`    | Update item quantity                 |
| `DELETE` | `/api/cart/:productId`    | Remove an item from the cart         |
| `DELETE` | `/api/cart`               | Clear the entire cart                |

### Orders

> Order creation and listing require an `x-user-id` header.

| Method   | Endpoint                     | Description                                              |
| -------- | ---------------------------- | -------------------------------------------------------- |
| `POST`   | `/api/orders`                | Checkout: convert cart into an order (server prices it)  |
| `GET`    | `/api/orders`                | Get the user's orders                                    |
| `GET`    | `/api/orders/:id`            | Get a single order                                       |
| `PUT`    | `/api/orders/:id/status`     | Update order status (`pending`, `paid`, `shipped`, `delivered`, `cancelled`) |

## Security Notes

- **Never trust client-sent prices.** During checkout the server fetches each product's price from the database and computes `totalPrice` itself.
- `express-mongo-sanitize` strips `$` and `.` from user input to prevent NoSQL operator injection.
- `.env` and `node_modules` are git-ignored.

## Postman

Import `postman_collection.json` into Postman. Set the `baseUrl` and `userId` environment variables to test the endpoints quickly.

## License

MIT
