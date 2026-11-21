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

async function test() {
  const html = await fetchUrl('/search?q=iphone+16');
  
  // Find all <a> tags with href containing /p/itm
  // Example: <a class="CGtC5Q" href="/apple-iphone-17-black-256-gb/p/itmc61b40459dd98?..." ...>
  // Inside the <a> or immediate parent, there are titles, img and prices
  const anchorRegex = /<a[^>]+href="(\/[^"]*\/p\/itm[^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  let count = 0;
  while ((match = anchorRegex.exec(html)) !== null && count < 6) {
    const link = match[1];
    const content = match[2];
    
    // Find image
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/);
    // Find title if not in alt
    const title = imgMatch ? imgMatch[2] : '';
    const img = imgMatch ? imgMatch[1] : '';

    console.log(`[Item ${count + 1}]`);
    console.log('  Title:', title);
    console.log('  Image:', img);
    console.log('  Link:', 'https://www.flipkart.com' + link.split('?')[0]);
    count++;
  }
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
