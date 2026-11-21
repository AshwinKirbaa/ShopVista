import fs from 'fs';
import { parseFlipkartLiveHtml, ScrapedFlipkartItem } from './src/services/comparison/flipkartLiveScraper';

interface CategoryGroup {
  categorySlug: string;
  categoryName: string;
  categoryDesc: string;
  categoryImg: string;
  file: string;
}

const groups: CategoryGroup[] = [
  {
    categorySlug: 'smartphones-flagships',
    categoryName: 'Smartphones & Flagships',
    categoryDesc: 'Next-gen flagship smartphones, titanium frames, pro cameras, and AI processing chips.',
    categoryImg: 'https://rukminim2.flixcart.com/image/312/312/xif0q/mobile/2/p/o/-original-imahqvad9pbyujab.jpeg?q=70',
    file: '../flip.html'
  },
  {
    categorySlug: 'smartphones-flagships',
    categoryName: 'Smartphones & Flagships',
    categoryDesc: 'Next-gen flagship smartphones, titanium frames, pro cameras, and AI processing chips.',
    categoryImg: 'https://rukminim2.flixcart.com/image/312/312/xif0q/mobile/2/p/o/-original-imahqvad9pbyujab.jpeg?q=70',
    file: '../flip_samsung.html'
  },
  {
    categorySlug: 'laptops-computing',
    categoryName: 'Laptops & Computing',
    categoryDesc: 'Ultra-portable silicon powerhouses, OLED displays, and professional workstation laptops.',
    categoryImg: 'https://rukminim2.flixcart.com/image/312/312/xif0q/computer/m/y/t/-enriched-transparent-2-original-imahzxavagexcfpp.png?q=70',
    file: '../flip_macbook.html'
  },
  {
    categorySlug: 'audio-studio-sound',
    categoryName: 'Audio & Studio Sound',
    categoryDesc: 'Audiophile active noise cancelling headphones, spatial audio earbuds, and studio monitors.',
    categoryImg: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    file: '../flip_headphones.html'
  },
  {
    categorySlug: 'wearables-smartwatches',
    categoryName: 'Wearables & Smartwatches',
    categoryDesc: 'Titanium smartwatches, biometric health monitors, GPS endurance wearables, and smart rings.',
    categoryImg: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    file: '../flip_watches.html'
  },
  {
    categorySlug: 'gaming-peripherals',
    categoryName: 'Gaming & Workstation Gear',
    categoryDesc: 'High-DPI optical sensors, ergonomic mechanical keyboards, and precision studio peripherals.',
    categoryImg: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    file: '../flip_peripherals.html'
  },
];

const allProducts: Array<ScrapedFlipkartItem & { categorySlug: string; categoryName: string; categoryDesc: string; categoryImg: string }> = [];

for (const g of groups) {
  if (fs.existsSync(g.file)) {
    const html = fs.readFileSync(g.file, 'utf-8');
    const items = parseFlipkartLiveHtml(html);
    for (const item of items) {
      if (!allProducts.some(p => p.id === item.id || p.title === item.title)) {
        allProducts.push({
          ...item,
          categorySlug: g.categorySlug,
          categoryName: g.categoryName,
          categoryDesc: g.categoryDesc,
          categoryImg: g.categoryImg
        });
      }
    }
  }
}

console.log(`Extracted total ${allProducts.length} live products across all categories.`);
fs.writeFileSync('./prisma/live_flipkart_catalog.json', JSON.stringify(allProducts, null, 2));
