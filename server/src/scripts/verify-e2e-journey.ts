import axios from 'axios';

const API = 'http://localhost:5000/api';

async function runE2EAudit() {
  console.log('====================================================');
  console.log('SHOPVISTA END-TO-END VERIFICATION & AUDIT SUITE');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const testEmail = `audit_user_${timestamp}@shopvista.com`;
  const testPassword = 'Password@123';

  // ----------------------------------------------------
  // PART 1: CUSTOMER JOURNEY
  // ----------------------------------------------------
  console.log('>>> [1/2] EXECUTING CUSTOMER JOURNEY');

  // Step 1: Registration
  console.log('1. Customer Registration...');
  const regRes = await axios.post(`${API}/auth/register`, {
    name: 'Audit Customer',
    email: testEmail,
    password: testPassword,
    phone: '9876543210',
  });
  console.log('   ✓ Registered:', regRes.data.data.user.email, 'Role:', regRes.data.data.user.role);

  // Step 2: Login
  console.log('2. Customer Login...');
  const loginRes = await axios.post(`${API}/auth/login`, {
    email: testEmail,
    password: testPassword,
  });
  const userToken = loginRes.data.data.token;
  console.log('   ✓ Authenticated. JWT received. Length:', userToken.length);

  const customerHeaders = { Authorization: `Bearer ${userToken}` };

  // Step 3: Browse Products
  console.log('3. Browsing Products Catalog...');
  const productsRes = await axios.get(`${API}/products?limit=5`);
  const products = productsRes.data.data;
  console.log(`   ✓ Retrieved ${products.length} catalog products. First product: "${products[0].name}" (Price: ₹${products[0].price})`);

  // Step 4: Search Products
  console.log('4. Searching Products with Query "Headphones"...');
  const searchRes = await axios.get(`${API}/products?search=Headphones`);
  console.log(`   ✓ Search returned ${searchRes.data.data.length} items`);

  // Step 5: Multi-Platform Price Comparison
  console.log('5. Executing Multi-Platform Comparison Search for "iPhone 17 Pro 256GB"...');
  const compareRes = await axios.get(`${API}/compare/search?q=iPhone 17 Pro 256GB`);
  const compareData = compareRes.data.data;
  console.log(`   ✓ Multi-retailer search completed.`);
  console.log(`     - Providers searched: ${compareData.providersSearched}, Succeeded: ${compareData.providersSucceeded}`);
  console.log(`     - Distinct comparison groups: ${compareData.totalGroups}`);
  const group = compareData.groups[0];
  if (group) {
    console.log(`     - Top group: "${group.canonicalTitle}"`);
    console.log(`     - Lowest in-stock price: ₹${group.lowestPrice}`);
    console.log(`     - Competing retailers: ${group.retailerCount} stores`);
  }

  // Step 6: Add to Cart
  console.log('6. Adding Product to Shopping Cart...');
  const targetProduct = products[0];
  const addCartRes = await axios.post(
    `${API}/cart/items`,
    { productId: targetProduct.id, quantity: 1 },
    { headers: customerHeaders }
  );
  console.log(`   ✓ Item added to cart. Cart now has ${addCartRes.data.data.items.length} items.`);

  // Step 7: Checkout & Create Order
  console.log('7. Initializing Checkout & Order Creation...');
  const checkoutRes = await axios.post(
    `${API}/payments/create-order`,
    {
      shippingName: 'Audit Customer',
      shippingPhone: '9876543210',
      shippingAddress: '42 Silicon Avenue, Tech Park',
      shippingCity: 'Bengaluru',
      shippingState: 'Karnataka',
      shippingPincode: '560100',
      paymentMethod: 'RAZORPAY',
    },
    { headers: customerHeaders }
  );
  const checkoutData = checkoutRes.data.data;
  console.log(`   ✓ Order created: Order #${checkoutData.orderNumber} (Internal ID: ${checkoutData.orderId})`);
  console.log(`   ✓ Razorpay Order ID generated: ${checkoutData.razorpayOrderId}, Amount: ₹${checkoutData.amount / 100}`);

  // Step 8: Payment Verification
  console.log('8. Verifying Payment...');
  const mockPaymentId = `pay_audit_${Date.now()}`;
  const verifyRes = await axios.post(
    `${API}/payments/verify`,
    {
      orderId: checkoutData.orderId,
      razorpay_order_id: checkoutData.razorpayOrderId,
      razorpay_payment_id: mockPaymentId,
      razorpay_signature: 'mock_valid_signature',
    },
    { headers: customerHeaders }
  );
  console.log('   ✓ Payment verification response:', verifyRes.data.message);

  // Step 9: Order Tracking
  console.log('9. Tracking Order Status...');
  const orderRes = await axios.get(`${API}/orders/${checkoutData.orderId}`, {
    headers: customerHeaders,
  });
  const order = orderRes.data.data;
  console.log(`   ✓ Order Status: ${order.status}`);
  console.log(`   ✓ Payment Status: ${order.payment.status}, Environment: ${order.payment.gatewayEnvironment}, Simulated: ${order.payment.isSimulated}`);
  console.log(`   ✓ Status History entries: ${order.statusHistory.length}`);
  console.log('   ✓ Customer journey completed successfully!\n');

  // ----------------------------------------------------
  // PART 2: ADMIN JOURNEY
  // ----------------------------------------------------
  console.log('>>> [2/2] EXECUTING ADMIN JOURNEY');

  // Step 1: Admin Login
  console.log('1. Admin Authentication (admin@ecommerce.com)...');
  const adminLoginRes = await axios.post(`${API}/auth/login`, {
    email: 'admin@ecommerce.com',
    password: 'Admin@123456',
  });
  const adminToken = adminLoginRes.data.data.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  console.log('   ✓ Admin logged in successfully.');

  // Step 2: Admin Dashboard Stats
  console.log('2. Fetching Admin Dashboard Analytics...');
  const statsRes = await axios.get(`${API}/admin/dashboard`, { headers: adminHeaders });
  const stats = statsRes.data.data;
  console.log(`   ✓ Dashboard Stats: Total Orders: ${stats.totalOrders}, Revenue: ₹${stats.totalRevenue}, Products: ${stats.totalProducts}`);

  // Step 3: Admin Create Product
  console.log('3. Admin Creating New Product...');
  const categoriesRes = await axios.get(`${API}/categories`);
  const catId = categoriesRes.data.data[0].id;
  const newProductSlug = `audit-product-${timestamp}`;
  const createProductRes = await axios.post(
    `${API}/products`,
    {
      name: `Audit Test Product ${timestamp}`,
      slug: newProductSlug,
      description: 'Engineered for automated verification tests with precision chassis.',
      price: 4999,
      comparePrice: 6999,
      stock: 50,
      sku: `AUDIT-SKU-${timestamp}`,
      categoryId: catId,
      images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80'],
      isActive: true,
      isFeatured: false,
    },
    { headers: adminHeaders }
  );
  const createdProduct = createProductRes.data.data;
  console.log(`   ✓ Product created: "${createdProduct.name}" (ID: ${createdProduct.id}, Stock: ${createdProduct.stock})`);

  // Step 4: Admin Update Product & Manage Stock
  console.log('4. Admin Updating Product Price & Stock...');
  const updateProductRes = await axios.put(
    `${API}/products/${createdProduct.id}`,
    {
      price: 4499,
      stock: 45,
    },
    { headers: adminHeaders }
  );
  console.log(`   ✓ Product updated: New Price: ₹${updateProductRes.data.data.price}, New Stock: ${updateProductRes.data.data.stock}`);

  // Step 5: Admin Update Customer Order Status
  console.log(`5. Admin Updating Order #${order.orderNumber} Status to PROCESSING and SHIPPED...`);
  const updateStatus1 = await axios.patch(
    `${API}/admin/orders/${order.id}/status`,
    {
      status: 'PROCESSING',
      note: 'Order packed in ESD-safe packaging at Bengaluru fulfillment hub',
    },
    { headers: adminHeaders }
  );
  console.log(`   ✓ Status updated to: ${updateStatus1.data.data.status}`);

  const updateStatus2 = await axios.patch(
    `${API}/admin/orders/${order.id}/status`,
    {
      status: 'SHIPPED',
      note: 'Handed over to BlueDart Express. Tracking: BLU98214710',
    },
    { headers: adminHeaders }
  );
  console.log(`   ✓ Status updated to: ${updateStatus2.data.data.status}`);

  // Step 6: Verify Final Order Status & Audit Trail
  const finalOrderRes = await axios.get(`${API}/orders/${order.id}`, { headers: adminHeaders });
  const finalOrder = finalOrderRes.data.data;
  console.log(`6. Final Audit Trail: ${finalOrder.statusHistory.length} status events recorded:`);
  finalOrder.statusHistory.forEach((h: any, i: number) => {
    console.log(`   [${i + 1}] ${h.status}: ${h.note} (by ${h.changedBy})`);
  });

  console.log('\n====================================================');
  console.log('ALL CUSTOMER & ADMIN JOURNEYS VERIFIED WITH 100% SUCCESS');
  console.log('====================================================');
}

runE2EAudit().catch((err) => {
  console.error('Audit failed with error:', err.response?.data || err.message);
  process.exit(1);
});
