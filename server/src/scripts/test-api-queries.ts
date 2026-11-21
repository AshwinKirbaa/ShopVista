import axios from 'axios';

const queries = [
  'iphone',
  'samsung',
  'headphones',
  'MacBook Air M4',
  'Logitech G502',
  'nonexistentproduct123456',
];

async function verify() {
  for (const q of queries) {
    const start = Date.now();
    const url = `http://localhost:5000/api/compare/search?q=${encodeURIComponent(q)}`;
    try {
      const resp = await axios.get(url);
      const duration = Date.now() - start;
      const json = resp.data;
      console.log('================================================================');
      console.log(`QUERY: "${q}"`);
      console.log('HTTP Status:', resp.status, resp.statusText);
      console.log('Total Response Time:', `${duration}ms`);
      console.log('Total Groups Found:', json.data?.totalGroups ?? 0);
      console.log('Provider Diagnostics:');
      for (const d of json.data?.diagnostics || []) {
        console.log(`  - ${d.provider} (${d.slug}): status=${d.status}, items=${d.resultCount}, latency=${d.responseTimeMs}ms, feed=${d.feedType}`);
      }
      if (json.data?.groups && json.data.groups.length > 0) {
        console.log(`Groups Count: ${json.data.groups.length}`);
        for (const g of json.data.groups) {
          console.log(`  * Product: ${g.canonicalTitle}`);
          console.log(`    Brand: ${g.brand} | Model: ${g.model} | Offers: ${g.offers.length} | Lowest Price: ₹${g.lowestPrice}`);
          for (const o of g.offers) {
            console.log(`      [${o.marketplaceName}] ₹${o.finalPrice} (${o.feedType}) - InStock: ${o.inStock} - URL: ${o.productUrl}`);
          }
        }
      } else {
        console.log('  (Clean 0 Results - No irrelevant products returned)');
      }
    } catch (err: any) {
      console.error(`Error querying "${q}":`, err.response?.data || err.message);
    }
  }
}

verify().then(() => {
  process.exit(0);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
