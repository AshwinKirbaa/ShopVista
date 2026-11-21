const queries = [
  'iPhone 17 Pro 256GB',
  'Samsung Galaxy S25 Ultra',
  'Sony WH-1000XM5',
  'MacBook Air M4',
  'Logitech G502',
  'nonexistent_xyz_product_999',
  'samsung',
  'headphones',
  'laptop',
];

async function run() {
  console.log('====================================================');
  console.log('MULTI-MARKETPLACE SEARCH VERIFICATION TEST RUN');
  console.log('====================================================\n');

  for (const q of queries) {
    const url = `http://localhost:5000/api/compare/search?q=${encodeURIComponent(q)}`;
    try {
      const resp = await fetch(url);
      const res: any = await resp.json();

      console.log(`[QUERY] "${q}"`);
      console.log(`  Status: ${resp.status} ${resp.statusText}`);
      console.log(`  Total Groups Found: ${res.data?.totalGroups ?? 0}`);

      if (res.data?.groups && res.data.groups.length > 0) {
        const top = res.data.groups[0];
        console.log(`  Top Match: "${top.canonicalTitle}" (${top.brand} • ${top.model} • ${top.variant})`);
        console.log(`  Retailers: ${top.retailerCount} stores | Lowest Price: ₹${top.lowestPrice?.toLocaleString('en-IN')}`);
        console.log(`  Offer Breakdown:`);
        for (const o of top.offers) {
          console.log(`    - [${o.marketplaceName}] ₹${o.finalPrice.toLocaleString('en-IN')} (Stock: ${o.inStock ? 'IN STOCK' : 'OOS'}) [${o.feedType}]`);
        }
      } else {
        console.log(`  ✓ Clean empty state verified (0 results)`);
      }

      if (res.data?.diagnostics) {
        console.log(`  Provider Diagnostics:`);
        for (const d of res.data.diagnostics) {
          console.log(`    • ${d.provider} (${d.slug}): ${d.status} | ${d.resultCount} items | ${d.responseTimeMs}ms | ${d.feedType}`);
        }
      }
      console.log('----------------------------------------------------\n');
    } catch (err: any) {
      console.error(`Error querying "${q}":`, err.message);
    }
  }
}

run();
