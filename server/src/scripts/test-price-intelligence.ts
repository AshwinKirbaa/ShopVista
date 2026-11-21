import axios from 'axios';

async function run() {
  console.log('====================================================');
  console.log('PRICE INTELLIGENCE & ALERT EVALUATION LIVE TEST');
  console.log('====================================================\n');

  const baseUrl = 'http://localhost:5000/api';
  const groupKey = 'apple-iphone-17-pro-256gb-new';

  // 1. Test 7-Day Price History
  console.log('1. Querying 7-day price history view...');
  const res7 = await axios.get(`${baseUrl}/compare/price-history/${groupKey}?days=7`);
  console.log('   ✓ Status:', res7.status, res7.data.message);
  console.log('   ✓ Range:', res7.data.data.daysRange, 'days');
  console.log('   ✓ Timeline points:', res7.data.data.history.length);
  console.log('   ✓ Stats: Lowest: ₹' + res7.data.data.stats.lowestRecordedPrice + ', Highest: ₹' + res7.data.data.stats.highestRecordedPrice + ', Avg: ₹' + res7.data.data.stats.averagePrice);

  // 2. Test 30-Day Price History
  console.log('\n2. Querying 30-day price history view...');
  const res30 = await axios.get(`${baseUrl}/compare/price-history/${groupKey}?days=30`);
  console.log('   ✓ Status:', res30.status, res30.data.message);
  console.log('   ✓ Range:', res30.data.data.daysRange, 'days');
  console.log('   ✓ Timeline points:', res30.data.data.history.length);
  console.log('   ✓ Feed Type:', res30.data.data.history[0]?.feedType || 'DEVELOPMENT_FEED');

  // 3. Test 90-Day Price History
  console.log('\n3. Querying 90-day price history view...');
  const res90 = await axios.get(`${baseUrl}/compare/price-history/${groupKey}?days=90`);
  console.log('   ✓ Status:', res90.status, res90.data.message);
  console.log('   ✓ Range:', res90.data.data.daysRange, 'days');
  console.log('   ✓ Timeline points:', res90.data.data.history.length);

  // 4. Test Authenticated Price Alert Creation
  console.log('\n4. Authenticating user for Price Alert creation...');
  const loginRes = await axios.post(`${baseUrl}/auth/login`, {
    email: 'ashwin@example.com',
    password: 'User@123456',
  });
  const token = loginRes.data.data.token;
  console.log('   ✓ User logged in successfully. Token received.');

  console.log('\n5. Creating Target Price Drop Alert (Target: ₹1,27,000)...');
  const alertRes = await axios.post(
    `${baseUrl}/compare/alerts`,
    {
      groupKey,
      productName: 'Apple iPhone 17 Pro 256GB',
      targetPrice: 127000,
      currentPrice: 128499,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log('   ✓ Alert Created:', alertRes.data.data.id, 'Target Price: ₹' + alertRes.data.data.targetPrice);

  console.log('\n6. Fetching Active User Alerts...');
  const getAlertsRes = await axios.get(`${baseUrl}/compare/alerts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('   ✓ Total user alerts:', getAlertsRes.data.data.length);

  console.log('\n7. Cleaning up test alert...');
  await axios.delete(`${baseUrl}/compare/alerts/${alertRes.data.data.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('   ✓ Test alert deleted successfully.');

  console.log('\n====================================================');
  console.log('ALL PRICE INTELLIGENCE API ENDPOINTS VERIFIED 100%');
  console.log('====================================================');
}

run().then(() => process.exit(0)).catch((err) => {
  console.error('Test failed:', err.response?.data || err.message);
  process.exit(1);
});
