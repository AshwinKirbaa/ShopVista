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
  const idx = html.indexOf('/apple-iphone-17-black-256-gb/p/itmc61b40459dd98');
  if (idx !== -1) {
    // Show next 4000 characters to see where price and title text are
    console.log(html.slice(idx + 1000, idx + 4000));
  }
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
