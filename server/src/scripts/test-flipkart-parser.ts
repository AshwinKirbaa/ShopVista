import https from 'https';

function fetchUrl(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.flipkart.com',
      path,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseFlipkartHtml(html: string) {
  const products: any[] = [];
  
  // Flipkart renders item rows or cards
  // Let's inspect titles and prices using regex
  // Titles usually appear as: <div class="KzDlHZ">Apple iPhone 17 (Black, 256 GB)</div> or alt="Apple iPhone..."
  // Prices: ₹1,28,990 inside <div class="Nx9bqj _4b5DiR">₹1,28,990</div> or similar
  
  // Match link block with title and price
  const blocks = html.split('<div class="_1AtVbE');
  console.log('Total block chunks:', blocks.length);
  
  // Also test direct image / title regex:
  const titleRegex = /<img[^>]+alt="([^"]+)"[^>]+src="([^"]+)"/g;
  let match;
  while ((match = titleRegex.exec(html)) !== null) {
    if (match[1].length > 10 && !match[1].includes('Flipkart') && !match[1].includes('Logo')) {
      products.push({ title: match[1], img: match[2] });
    }
  }

  // Price regex: ₹ followed by digits and commas
  const priceMatches = html.match(/₹[\d,]+/g) || [];
  console.log('Sample extracted prices from live page:', priceMatches.slice(0, 10));
  console.log('Extracted titles count:', products.length);
  console.log('Sample titles:', products.slice(0, 5));
}

async function main() {
  const html = await fetchUrl('/search?q=iphone+16');
  parseFlipkartHtml(html);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
