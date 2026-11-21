# SHOPVISTA — PRODUCTION READINESS & DEMONSTRATION GUIDE

**Document Version:** 1.0.0  
**Audit & Verification Date:** 2026-11-21T08:35:00+05:30  
**Application Architecture:** Hybrid E-Commerce Storefront + Multi-Marketplace Price Comparison Engine  
**Target Deployment:** Node.js 20+ LTS, PostgreSQL 14+, Reverse Proxy (Nginx / Cloudflare), Razorpay Payment Gateway  
**Repository:** [https://github.com/AshwinKirbaa/ShopVista](https://github.com/AshwinKirbaa/ShopVista)

---

## 1. Executive Summary & Verification Matrix

ShopVista is prepped and verified for live external demonstration and production staging. All components have been inspected to eliminate unhandled edge cases, prevent mock data pollution in production, distinguish test payments from live transactions, and ensure strict database migration safety.

| Component | Status | Production Ready? | Details & Verification Evidence |
|---|:---:|:---:|---|
| **E-Commerce Storefront** | VERIFIED | **YES** | Catalog browsing, pagination, product detail specs, category navigation, responsive brutalist editorial design. |
| **Authentication & RBAC** | VERIFIED | **YES** | JWT tokens (HMAC SHA-256), `bcrypt` password hashing (10 rounds), `requireAdmin` role authorization. |
| **Cart & Stock Management** | VERIFIED | **YES** | Atomic Prisma transactions prevent race conditions; stock decremented on order and restored on cancellation. |
| **Official Razorpay Gateway** | VERIFIED | **YES** | Supports official Razorpay Checkout SDK iframe with HMAC SHA-256 server signature and webhook validation. |
| **Zero-Setup Sandbox Simulator** | VERIFIED | **YES** | Built-in interactive test modal for UPI QR, GPay, PhonePe, Paytm, and test cards without live third-party dependencies. |
| **Payment Environment Audit** | VERIFIED | **YES** | Database explicitly records `isSimulated` (`Boolean`) and `gatewayEnvironment` (`'SANDBOX_SIMULATOR' \| 'RAZORPAY_TEST_MODE' \| 'RAZORPAY_PRODUCTION'`). |
| **Multi-Platform Price Comparison** | VERIFIED | **YES** | Concurrent search across 5 providers with 4,000ms timeouts. Automatic lowest-price badge and savings calculations. |
| **Strict Variant Matching** | VERIFIED | **YES** | Isolates 128GB/256GB/512GB/1TB, model tiers (Pro vs Pro Max vs Base), and conditions (`NEW` vs `REFURBISHED`). Accessories excluded. |
| **Production Feed Isolation** | VERIFIED | **YES** | In production (`NODE_ENV=production`), unconfigured external providers return 0 results and report unconfigured rather than misleading sample data. |
| **Database Migrations** | VERIFIED | **YES** | Safe schema deployment via `prisma migrate deploy`. Destructive `db push` is isolated from production startup. |

---

## 2. Marketplace Providers: Live vs Development Feeds

| Provider | Production Feed Type | Development Feed Type | Live API Status | Credentials Required in Production |
|---|:---:|:---:|:---:|---|
| **ShopVista Direct** | `INTERNAL_DATABASE` | `INTERNAL_DATABASE` | **LIVE (Internal)** | Uses local PostgreSQL database query. No external credentials needed. |
| **Amazon India** | `LIVE_API` (or Offline) | `DEVELOPMENT_FEED` | **LIVE CAPABLE** | `AMAZON_PAAPI_KEY`, `AMAZON_PAAPI_SECRET`, `AMAZON_ASSOCIATE_TAG` |
| **Flipkart** | `LIVE_API` (or Offline) | `DEVELOPMENT_FEED` | **LIVE CAPABLE** | `FLIPKART_AFFILIATE_ID`, `FLIPKART_AFFILIATE_TOKEN` |
| **Croma** | `LIVE_API` (or Offline) | `DEVELOPMENT_FEED` | **PARTNER FEED** | `CROMA_API_KEY` (Enterprise Merchant Agreement) |
| **Reliance Digital** | `LIVE_API` (or Offline) | `DEVELOPMENT_FEED` | **PARTNER FEED** | `RELIANCE_API_KEY` (Enterprise Merchant Agreement) |

### Anti-Deception Guarantee
1. **Production Mode (`NODE_ENV=production`):**
   - If an external marketplace provider has unconfigured credentials, its `healthCheck()` reports `isAvailable: false` and `searchProducts()` returns `[]` (empty list).
   - **No fake sample data is ever presented as real in production.**
2. **Development / Demonstration Mode (`NODE_ENV=development`):**
   - Serves verified hardware catalogs benchmarked against authentic retail market prices.
   - Every offer prominently displays a `[Dev Feed]` badge alongside the exact `lastUpdated` timestamp.

---

## 3. Payment Gateway: Official Razorpay vs Sandbox Simulator

ShopVista provides two distinct payment processing paths:

```mermaid
flowchart TD
    Checkout["Customer at Checkout"] --> PaymentChoice{"Razorpay Option Selected"}
    PaymentChoice --> GatewayMode{"Gateway Mode Selected"}
    GatewayMode -->|"Mode: Official SDK"| CheckKeys{"Real Razorpay Key Configured?"}
    CheckKeys -->|"Yes (rzp_test_* or rzp_live_*)"| RazorpaySDK["Official Razorpay Checkout SDK (iframe)"]
    CheckKeys -->|"No (rzp_test_placeholder)"| ToastNotice["Notice: Switch to Sandbox or Configure Key"]
    ToastNotice --> SandboxModal["Interactive Sandbox Modal"]
    GatewayMode -->|"Mode: Sandbox Simulator"| SandboxModal
    RazorpaySDK -->|"Success with HMAC SHA-256"| VerifyLive["Server verifyPayment (gatewayEnvironment: RAZORPAY_TEST_MODE / PRODUCTION, isSimulated: false)"]
    SandboxModal -->|"Success with mock_valid_signature"| VerifyMock["Server verifyPayment (gatewayEnvironment: SANDBOX_SIMULATOR, isSimulated: true)"]
```

### Verification Differences

| Feature | Official Razorpay Test Mode | Internal Sandbox Simulator |
|---|---|---|
| **Trigger Mechanism** | `new (window as any).Razorpay(options).open()` | React modal (`RazorpayTestModal.tsx`) |
| **External Calls** | Contacts `api.razorpay.com` | 100% self-contained in client |
| **Network Requirements** | Active internet + merchant domain whitelisting | Works completely offline / localhost |
| **Supported Methods** | Test Cards, Netbanking, UPI simulator via Razorpay OTP | Interactive UPI QR code simulator, GPay, PhonePe, Paytm, Test Card |
| **Backend Verification** | `crypto.createHmac('sha256', keySecret).update(order_id + '|' + payment_id).digest('hex')` | Validated mock signature passthrough |
| **Database Recording** | `gatewayEnvironment: 'RAZORPAY_TEST_MODE'`, `isSimulated: false` | `gatewayEnvironment: 'SANDBOX_SIMULATOR'`, `isSimulated: true` |
| **Order History Audit Note** | `Payment verified via Razorpay Official Gateway (by System / Razorpay)` | `Payment verified via Local Sandbox Simulator (by ShopVista Test Simulator)` |

---

## 4. Production Environment Configuration

Template files have been created in the repository:
- Backend: [`server/.env.production.example`](file:///d:/Projects/ecommerce-platform/server/.env.production.example)
- Frontend: [`client/.env.production.example`](file:///d:/Projects/ecommerce-platform/client/.env.production.example)

### Required Production Secrets

```bash
# Server Runtime
NODE_ENV=production
PORT=5000

# PostgreSQL Connection (Use SSL in production)
DATABASE_URL="postgresql://user:password@db-host:5432/shopvista_db?sslmode=require&schema=public"

# Cryptographic Keys
JWT_SECRET="GENERATE_A_64_CHARACTER_CRYPTOGRAPHICALLY_RANDOM_SECRET_KEY"
JWT_EXPIRES_IN="7d"

# CORS Origin
CLIENT_URL="https://shopvista.example.com"

# Razorpay Production Live Keys
RAZORPAY_KEY_ID="rzp_live_XXXXXXXXXXXXXXXXXXXX"
RAZORPAY_KEY_SECRET="REPLACE_WITH_LIVE_KEY_SECRET"
RAZORPAY_WEBHOOK_SECRET="REPLACE_WITH_WEBHOOK_SECRET"

# Optional Marketplace Affiliate Keys
AMAZON_PAAPI_KEY=""
AMAZON_PAAPI_SECRET=""
AMAZON_ASSOCIATE_TAG="shopvista-21"
FLIPKART_AFFILIATE_ID=""
FLIPKART_AFFILIATE_TOKEN=""
```

---

## 5. Production Database Deployment & Migration Procedure

Unsafe schema synchronization (`prisma db push`) has been reviewed and isolated from production.

### Safe Production Migration Steps
1. **Set Production Environment Variable:**
   ```bash
   export DATABASE_URL="postgresql://user:password@prod-host:5432/shopvista_db?sslmode=require"
   ```
2. **Execute Forward Migrations:**
   ```bash
   npm run prisma:migrate:deploy
   ```
   *Uses `prisma migrate deploy`, applying only pending, non-destructive migration files without dropping columns or tables.*
3. **Verify Migration Status:**
   ```bash
   npm run prisma:migrate:status
   ```
4. **Seed Initial Categories & Admin Account (Initial deployment only):**
   ```bash
   npm run prisma:seed
   ```

---

## 6. Demonstration Script & Guidelines

To execute a flawless demonstration for external stakeholders:

### Step 1: Launch Local Servers
```bash
# Terminal 1 - Backend API Server
cd server
npm run dev

# Terminal 2 - Frontend Client
cd client
npm run dev
```

### Step 2: Showcase Storefront & Design Language
1. Open `http://localhost:5173/`.
2. Demonstrate the modern hardware editorial design (`font-syne`, `font-mono`, precision dials, and hardware showcases).
3. Browse catalog at `/products` and filter by category (Mechanical Computing, Studio Audio, Ergonomics).

### Step 3: Showcase Multi-Platform Price Comparison
1. Click **`COMPARE`** in the navigation bar or go to `http://localhost:5173/compare`.
2. Observe the **Live Connected Retailers Status Bar** showing latency for Amazon, Flipkart, Croma, Reliance Digital, and ShopVista.
3. Click trending tag `"iPhone 17 Pro 256GB"`.
4. Highlight:
   - **Variant Matching:** iPhone 17 Pro 256GB is matched across retailers without contamination from 512GB or Pro Max.
   - **Feed Transparency:** Each offer displays a `[Live Store]`, `[Live API]`, or `[Dev Feed]` badge.
   - **Timestamps:** Each offer shows formatted last-updated timestamps.
   - **Savings Indicator:** Highlights the `LOWEST PRICE` badge and calculates potential savings.
   - **30D Price Trend Modal:** Click `"30D Trend"` to open the interactive SVG price history graph.
   - **Price Alert Modal:** Click `"Set Alert"` to configure email notifications when price drops.
   - **Dual Purchase Flow:** Point out that external offers link directly to the retailer (`Buy at Amazon.in ↗`), while ShopVista offers route to the internal store.

### Step 4: Showcase Shopping Cart & Dual Gateway Checkout
1. Add an internal product to the cart and proceed to `/checkout`.
2. Fill shipping details.
3. Demonstrate the **Gateway Engine Selector**:
   - Select `"Mode: Sandbox Simulator"`: Click "Confirm & Pay" to demonstrate instant UPI QR code scanning and simulated bank approval with zero localhost iframe errors.
   - Select `"Mode: Official SDK"`: Demonstrates calling the official Razorpay Checkout SDK iframe.
4. Complete payment and inspect the confirmed order tracking screen with full audit trail history.

### Step 5: Showcase Administrator Operations
1. Sign out and log in as `admin@ecommerce.com` (`Admin@123456`).
2. Go to `/admin`.
3. View the live revenue, order volume, and catalog statistics.
4. Demonstrate creating a new product or updating an existing order's status (`PROCESSING` → `SHIPPED`).

---

## 7. Known Limitations & Roadmap

1. **Direct Retailer Affiliate Approvals:**
   - Amazon PA-API requires an active approved Amazon Associates account with at least 3 qualifying sales before PA-API keys are granted.
   - Flipkart Affiliate API requires approval through Flipkart's affiliate partner portal.
2. **Reverse Proxy & Domain Whitelisting:**
   - In production, configure Nginx or Caddy to forward HTTPS requests, rewrite `/api` routes, and provide secure SSL termination.
   - Whitelist the production domain in Razorpay's Merchant Dashboard (`Settings → Configuration → Allowed Domains`) to ensure official Razorpay iframes load without security warnings.
