import https from 'https';

export interface ScrapedFlipkartItem {
  id: string;
  title: string;
  mrp: number;
  sellingPrice: number;
  imageUrl: string;
  url: string;
  rating?: number;
  inStock: boolean;
}

export function fetchFlipkartLive(query: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.flipkart.com',
      path: '/search?q=' + encodeURIComponent(query),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
    };
    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(4000, () => {
      req.destroy();
      reject(new Error('Flipkart request timeout'));
    });
  });
}

export function parseFlipkartLiveHtml(html: string): ScrapedFlipkartItem[] {
  const items: ScrapedFlipkartItem[] = [];

  // Match each product container anchor
  // href="(/[^"]*?/p/itm[^"]*?)"
  const anchorRegex = /<a[^>]+href="(\/[^"]*?\/p\/itm[^"]*?)"[^>]*>([\s\S]*?)<\/a>/g;
  let match;

  while ((match = anchorRegex.exec(html)) !== null) {
    const rawUrl = match[1];
    const content = match[2];

    // Image & Title
    // <img ... alt="Apple iPhone 17 (Black, 256 GB)" src="https://rukminim2..."
    const imgMatch = content.match(/<img[^>]+alt="([^"]+)"[^>]+src="([^"]+)"/) ||
                     content.match(/<img[^>]+src="([^"]+)"[^>]+alt="([^"]+)"/);

    // Title from alt or title div
    let title = '';
    let imageUrl = '';
    if (imgMatch) {
      if (imgMatch[1].startsWith('http')) {
        imageUrl = imgMatch[1];
        title = imgMatch[2];
      } else {
        title = imgMatch[1];
        imageUrl = imgMatch[2];
      }
    }

    if (!title) {
      // Look for title in div
      const titleDiv = content.match(/<div class="[^"]*?(?:RG5Slk|KzDlHZ|wjcEIp|cPHDOP)[^"]*?">([^<]+)<\/div>/);
      if (titleDiv) title = titleDiv[1];
    }

    // Filter non-product titles
    if (!title || title.length < 5 || title.includes('Flipkart') || title.includes('Buying Guide')) {
      continue;
    }

    // Extract Selling Price: e.g. ₹89,100 or ₹24,989
    // In Flipkart HTML: check content first, or look in adjacent HTML (grid layout up to 5000 chars)
    let priceMatch = content.match(/₹\s*([\d,]+)/);
    let nearby = '';
    if (!priceMatch) {
      nearby = html.slice(match.index, match.index + 5000);
      priceMatch = nearby.match(/₹\s*([\d,]+)/);
    }
    const sellingPrice = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : 0;
    if (sellingPrice <= 0) continue;

    // Extract MRP
    if (!nearby) nearby = html.slice(match.index, match.index + 5000);
    const mrpMatch = nearby.match(/₹<!-- -->\s*([\d,]+)/) || nearby.match(/₹\s*([\d,]+)[\s\S]*?₹\s*([\d,]+)/);
    let mrp = sellingPrice;
    if (mrpMatch) {
      const parsedMrp = parseInt((mrpMatch[2] || mrpMatch[1]).replace(/,/g, ''), 10);
      if (parsedMrp > sellingPrice) mrp = parsedMrp;
    }

    // Extract Rating: e.g. <div class="MKiFS6">4.6<img...
    const ratingMatch = (content + nearby).match(/<div class="[^"]*?(?:MKiFS6|XDXdAE)[^"]*?">([\d\.]+)/);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 4.5;

    // FSN / Product ID from url
    const pidMatch = rawUrl.match(/pid=([A-Z0-9]+)/);
    const fsn = pidMatch ? pidMatch[1] : `flip_${Math.random().toString(36).slice(2, 8)}`;

    const cleanUrl = 'https://www.flipkart.com' + rawUrl.split('?')[0];

    // Deduplicate
    if (!items.some((i) => i.id === fsn || i.url === cleanUrl)) {
      items.push({
        id: fsn,
        title: title.replace(/&amp;/g, '&'),
        mrp,
        sellingPrice,
        imageUrl,
        url: cleanUrl,
        rating,
        inStock: true,
      });
    }

    if (items.length >= 35) break;
  }

  return items;
}

