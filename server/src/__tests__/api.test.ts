import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';
import crypto from 'crypto';
import { config } from '../config';

describe('E-Commerce Backend API Test Suite', () => {
  let userToken: string;
  let adminToken: string;
  let testProductId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    // 1. Get an existing product and category from seeded data
    const product = await prisma.product.findFirst({ where: { isActive: true } });
    if (product) testProductId = product.id;

    const category = await prisma.category.findFirst();
    if (category) testCategoryId = category.id;

    // 2. Login as admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@ecommerce.com', password: 'Admin@123456' });

    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Health Check Endpoint', () => {
    it('GET /api/health returns status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('2. Authentication APIs', () => {
    const testEmail = `tester_${Date.now()}@example.com`;

    it('POST /api/auth/register registers a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Integration Tester',
          email: testEmail,
          password: 'Password@123',
          phone: '+91 9999988888',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.token).toBeDefined();

      userToken = res.body.data.token;
    });

    it('POST /api/auth/register rejects duplicate registration with 409', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Integration Tester',
          email: testEmail,
          password: 'Password@123',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login succeeds with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testEmail, password: 'Password@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('POST /api/auth/login fails with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testEmail, password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me returns current user profile when authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.user.role).toBe('USER');
    });

    it('GET /api/auth/me returns 401 when token is missing', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('3. Products & Categories APIs', () => {
    it('GET /api/categories returns active categories list', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/products returns paginated products with metadata', async () => {
      const res = await request(app).get('/api/products?page=1&limit=6');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBeGreaterThan(0);
    });

    it('GET /api/products supports filtering by search and sort', async () => {
      const res = await request(app).get('/api/products?search=Wireless&sort=price_desc');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/products/:id returns detailed product information', async () => {
      const res = await request(app).get(`/api/products/${testProductId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(testProductId);
      expect(res.body.data.category).toBeDefined();
    });
  });

  describe('4. Shopping Cart APIs', () => {
    let cartItemId: string;

    it('GET /api/cart returns user cart', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('POST /api/cart/items adds product to cart and validates stock', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: testProductId, quantity: 2 });

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      const added = res.body.data.items.find((i: any) => i.productId === testProductId);
      expect(added).toBeDefined();
      expect(added.quantity).toBe(2);
      cartItemId = added.id;
    });

    it('PUT /api/cart/items/:id updates item quantity', async () => {
      const res = await request(app)
        .put(`/api/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 3 });

      expect(res.status).toBe(200);
      const updated = res.body.data.items.find((i: any) => i.id === cartItemId);
      expect(updated.quantity).toBe(3);
    });

    it('DELETE /api/cart/items/:id removes item from cart', async () => {
      const res = await request(app)
        .delete(`/api/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      const remaining = res.body.data.items.find((i: any) => i.id === cartItemId);
      expect(remaining).toBeUndefined();
    });
  });

  describe('5. Checkout & Razorpay Payment Integration', () => {
    it('POST /api/payments/create-order creates an order and initializes Razorpay order', async () => {
      // First add an item back to cart
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: testProductId, quantity: 1 });

      const checkoutPayload = {
        shippingName: 'Integration Tester',
        shippingPhone: '9876543210',
        shippingAddress: '123 Test Street, Cyber Hub',
        shippingCity: 'Gurugram',
        shippingState: 'Haryana',
        shippingPincode: '122002',
        paymentMethod: 'RAZORPAY',
      };

      const res = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${userToken}`)
        .send(checkoutPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderId).toBeDefined();
      expect(res.body.data.razorpayOrderId).toBeDefined();
      expect(res.body.data.amount).toBeGreaterThan(0);

      // Verify server-side payment signature verification
      const verifyRes = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: res.body.data.orderId,
          razorpay_order_id: res.body.data.razorpayOrderId,
          razorpay_payment_id: 'pay_test_' + Date.now(),
          razorpay_signature: 'mock_valid_signature',
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.success).toBe(true);
    });
  });

  describe('6. Security & Admin Role Authorization', () => {
    it('Rejects non-admin users from accessing GET /api/admin/dashboard with 403', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Allows admin user to access GET /api/admin/dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalRevenue).toBeDefined();
      expect(res.body.data.totalProducts).toBeGreaterThan(0);
    });

    it('Allows admin to fetch customer list and order list', async () => {
      const [customersRes, ordersRes] = await Promise.all([
        request(app).get('/api/admin/customers').set('Authorization', `Bearer ${adminToken}`),
        request(app).get('/api/admin/orders').set('Authorization', `Bearer ${adminToken}`),
      ]);

      expect(customersRes.status).toBe(200);
      expect(ordersRes.status).toBe(200);
      expect(Array.isArray(customersRes.body.data)).toBe(true);
      expect(Array.isArray(ordersRes.body.data)).toBe(true);
    });
  });
});
