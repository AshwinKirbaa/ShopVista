# ShopVista - Modern Full-Stack E-Commerce Platform

ShopVista is a full-stack, enterprise-grade e-commerce web application engineered with a clean modular monolithic architecture. Built with **React 19**, **TypeScript**, **Tailwind CSS**, **Node.js/Express**, **PostgreSQL**, **Prisma ORM**, and **Razorpay Payment Gateway** integration with HMAC-SHA256 signature verification.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────────┐
                      │          React 19 + TypeScript           │
                      │   Tailwind CSS / React Router / Context  │
                      └────────────────────┬─────────────────────┘
                                           │ HTTP / Axios
                                           ▼
                      ┌──────────────────────────────────────────┐
                      │         Express.js REST API Server       │
                      │  JWT Auth / Zod Validation / Rate Limit │
                      └───────┬──────────────────────────┬───────┘
                              │                          │
                    Prisma ORM│                          │HMAC-SHA256
                              ▼                          ▼
               ┌──────────────────────────┐   ┌──────────────────────────┐
               │    PostgreSQL Database   │   │ Razorpay Payment Gateway │
               │ (ACID Transactions & Dec)│   │ (Orders API & Webhooks)  │
               └──────────────────────────┘   └──────────────────────────┘
```

---

## Key Features

### 🛍️ Customer Storefront
- **Dynamic Catalog**: Full product listing with category filtering, price sliders, keyword search, sorting (price, popularity, rating, newest), and pagination.
- **Product Details**: Multi-angle image gallery, inventory stock badges, quantity selection, and real-time related products.
- **Persistent Shopping Cart**: Database-backed cart persistence for authenticated users, with seamless guest cart synchronisation on login.
- **Real-Time Stock Checking**: Prevention of cart additions beyond available physical inventory.
- **Interactive Checkout**: Shipping address validation, delivery fee calculation (free delivery for orders > ₹500), and Razorpay test mode integration.
- **Order Tracking**: Visual multi-stage status tracker (`PENDING` ➔ `CONFIRMED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`).
- **Customer Self-Service**: Order cancellation with atomic inventory restock restoration inside database transactions.

### 🛡️ Administrative Dashboard
- **Store KPI Metrics**: Real-time total revenue calculation from verified payments, total orders, customer accounts, and active products.
- **Inventory & Alert Center**: Instant low-stock indicators and pending order tracking.
- **Product Management (CRUD)**: Create, edit, and soft-delete/deactivate catalog products, with SKU uniqueness guarantees.
- **Category Management (CRUD)**: Add, update, and manage product collection categories with relational integrity protection.
- **Order Management**: Search orders by order number, filter by status, inspect line items, and transition order workflow states with audit notes.
- **Customer Directory**: View customer profiles, order counts, and lifetime customer spend.

### 🔐 Security & Reliability
- **Zero-Trust Pricing**: Client-supplied prices and amounts are strictly ignored. Order totals are recalculated server-side from PostgreSQL decimal records.
- **Cryptographic Signature Verification**: Server-side HMAC SHA-256 validation of Razorpay order ID and payment ID.
- **Duplicate Verification Defense**: Atomically prevents duplicate payments or replays.
- **ACID Database Transactions**: `prisma.$transaction` guarantees atomic stock deduction, order item snapshots, and payment status updates.
- **Role-Based Access Control (RBAC)**: Backend verification of JWT tokens and `Role.ADMIN` claims on all administrative routes.
- **Security Hardening**: `helmet`, CORS isolation, `express-rate-limit`, and password hashing via `bcrypt` (10 rounds).

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React Router DOM 7, React Hook Form, Zod, Lucide React, Axios, React Hot Toast |
| **Backend** | Node.js, Express.js, TypeScript, REST APIs, JSON Web Tokens (JWT), bcrypt, Zod, Morgan, Helmet, Rate Limit |
| **Database** | PostgreSQL, Prisma ORM (with Decimal monetary types & migrations) |
| **Payment Gateway** | Razorpay Checkout SDK, Orders API, HMAC-SHA256 Signature Verification, Webhook handler |
| **Testing** | Vitest, Supertest, Playwright |

---

## Directory Structure

```
ecommerce-platform/
├── client/                     # Frontend React application
│   ├── public/                 # Static assets & favicon
│   ├── src/
│   │   ├── components/         # Reusable UI & Product components
│   │   ├── contexts/           # AuthContext & CartContext
│   │   ├── hooks/              # Custom hooks (useAuth, useCart, useDebounce)
│   │   ├── layouts/            # MainLayout, AdminLayout, Navbar, Footer
│   │   ├── pages/              # Storefront & Admin page components
│   │   ├── services/           # Axios API service clients
│   │   ├── types/              # TypeScript definitions & interfaces
│   │   ├── App.tsx             # Routing & Protected / Admin route guards
│   │   ├── index.css           # Tailwind CSS directives
│   │   └── main.tsx            # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Backend Express REST API
│   ├── prisma/
│   │   ├── migrations/         # Applied Prisma SQL migrations
│   │   ├── schema.prisma       # Relational database schema
│   │   └── seed.ts             # Realistic 18-product catalog seed script
│   ├── src/
│   │   ├── __tests__/          # Integration test suite (Vitest + Supertest)
│   │   ├── config/             # Environment, Prisma singleton, Razorpay client
│   │   ├── controllers/        # Express route controllers (Auth, Products, Cart, Orders, Admin)
│   │   ├── middleware/         # Auth, Admin, Validation, Error Handling
│   │   ├── routes/             # API routes
│   │   ├── types/              # Express AuthRequest & TokenPayload types
│   │   ├── utils/              # Standardized API response helpers
│   │   ├── validators/         # Zod request body schemas
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # Server entry point
│   ├── .env                    # Local environment config
│   ├── .env.example            # Sample environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                # Root scripts (dev, build, start, seed)
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18+ (tested on v24.21.0)
- **npm**: v9+ (tested on v11.6.4)
- **PostgreSQL**: v14+ (tested on PostgreSQL 18)

---

### Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/ecommerce-platform.git
cd ecommerce-platform

# Install root, backend, and frontend dependencies
npm run install:all
```

---

### Step 2: Database Setup & Prisma Migration

1. Create a PostgreSQL database named `ecommerce_db`:
```bash
psql -U postgres -c "CREATE DATABASE ecommerce_db;"
```

2. Configure environment variables in `server/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db?schema=public"
JWT_SECRET="your-super-secure-jwt-secret-key-32-chars-minimum"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"

# Razorpay Test Credentials (replace with your keys from dashboard.razorpay.com)
RAZORPAY_KEY_ID="rzp_test_placeholder"
RAZORPAY_KEY_SECRET="placeholder_secret"
RAZORPAY_WEBHOOK_SECRET="placeholder_webhook_secret"

# Initial Administrator Credentials
ADMIN_EMAIL="admin@ecommerce.com"
ADMIN_PASSWORD="Admin@123456"
ADMIN_NAME="Store Administrator"
```

3. Run migrations and database seeding:
```bash
cd server
npx prisma migrate dev
npx prisma db seed
cd ..
```

---

### Step 3: Start the Application

You can start both frontend and backend concurrently from the root directory:

```bash
# Start both backend (port 5000) and frontend (port 5173)
npm run dev
```

Or run them individually:

```bash
# In terminal 1: Start Backend API
npm run dev:server

# In terminal 2: Start Frontend Vite Server
npm run dev:client
```

Open your browser at `http://localhost:5173`.

---

## Demo Accounts

For immediate testing, use the pre-seeded credentials:

| Role | Email | Password | Access |
|---|---|---|---|
| **Administrator** | `admin@ecommerce.com` | `Admin@123456` | Full Admin Dashboard (`/admin`), Product CRUD, Category CRUD, Order Management |
| **Customer** | `john@example.com` | `User@123456` | Catalog browsing, Cart, Checkout, Order Tracking (`/orders`) |

*Note: The login page includes convenient **One-Click Demo Fill** buttons for both roles.*

---

## Running Automated Tests

Run backend integration and security test suites:

```bash
cd server
npm test
```

### Verified Test Cases:
- Health check verification
- User registration, duplicate email rejection (409)
- Authentication credentials validation & JWT issuance
- Profile retrieval and token verification
- Unauthorized route blocking (401)
- Category listings
- Product catalog retrieval, search, sort, and pagination
- Product detail lookup by ID and slug
- Shopping cart CRUD (add, update quantity, remove, stock validation)
- Server-side checkout calculation and stock deduction
- Razorpay order creation and HMAC-SHA256 signature verification
- Role-based security (blocking non-admin users from `/api/admin` with 403)
- Administrative dashboard metrics and customer directory

---

## Deployment Readiness

### Frontend (e.g. Vercel)
1. Build script: `npm run build` inside `client/`.
2. Output directory: `dist`.
3. Set environment variable: `VITE_API_URL` pointing to backend domain.

### Backend (e.g. Render / Railway)
1. Build command: `npm install && npx prisma generate && npm run build`.
2. Start command: `node dist/server.js`.
3. Set production environment variables (`DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).

---

## License

MIT License. Designed and engineered for academic evaluation and production portfolio showcase.
