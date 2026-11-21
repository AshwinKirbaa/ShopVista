import { MarketplaceProvider } from '../MarketplaceProvider';
import { NormalizedProduct, ProviderHealth } from '../types';
import { ProductMatchingEngine } from '../ProductMatchingEngine';

interface SeedItem {
  id: string;
  title: string;
  mrp: number;
  sellingPrice: number;
  shipping: number;
  inStock: boolean;
  delivery: string;
  rating: number;
  imageUrl: string;
  url: string;
}

const CROMA_CATALOG: SeedItem[] = [
  {
    id: 'CROMA-IP17P-256',
    title: 'Apple iPhone 17 Pro (256GB ROM, 8GB RAM, Natural Titanium)',
    mrp: 134900,
    sellingPrice: 129490,
    shipping: 0,
    inStock: true,
    delivery: 'Standard 2-Day Delivery or Store Pickup',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.croma.com/apple-iphone-17-pro-256gb-natural-titanium/p/308112',
  },
  {
    id: 'CROMA-IP17P-512',
    title: 'Apple iPhone 17 Pro (512GB ROM, 8GB RAM, Natural Titanium)',
    mrp: 154900,
    sellingPrice: 152490,
    shipping: 0,
    inStock: false, // Out of stock on Croma to test stock logic!
    delivery: 'Currently Out of Stock',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.croma.com/apple-iphone-17-pro-512gb-natural-titanium/p/308113',
  },
  {
    id: 'CROMA-IP17PM-256',
    title: 'Apple iPhone 17 Pro Max (256GB ROM, 8GB RAM, Desert Titanium)',
    mrp: 144900,
    sellingPrice: 141900,
    shipping: 0,
    inStock: true,
    delivery: 'Free Express Shipping in 48 Hours',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.croma.com/apple-iphone-17-pro-max-256gb-desert-titanium/p/308114',
  },
  {
    id: 'CROMA-MBP14-M4',
    title: 'Apple MacBook Pro 14 (M4 Pro Chip, 24GB Unified RAM, 512GB SSD) Space Black',
    mrp: 199900,
    sellingPrice: 194990,
    shipping: 0,
    inStock: true,
    delivery: 'Standard Delivery in 24 Hours',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.croma.com/apple-macbook-pro-14-m4-pro-512gb/p/310442',
  },
  {
    id: 'CROMA-SONY-XM5',
    title: 'Sony WH-1000XM5 Over-Ear Noise Cancelling Bluetooth Headphones with Mic (Black)',
    mrp: 34990,
    sellingPrice: 28990,
    shipping: 0,
    inStock: true,
    delivery: 'Express 3-Hour Delivery Available in select cities',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.croma.com/sony-wh-1000xm5-bluetooth-headphones/p/254420',
  },
  {
    id: 'CROMA-SAM-S25U',
    title: 'Samsung Galaxy S25 Ultra 5G (12GB RAM, 256GB Storage, Titanium Gray)',
    mrp: 134999,
    sellingPrice: 127999,
    shipping: 0,
    inStock: true,
    delivery: 'Express Delivery by Tomorrow',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.croma.com/samsung-galaxy-s25-ultra-256gb/p/311890',
  },
  {
    id: 'CROMA-AIRPODS-P2',
    title: 'Apple AirPods Pro 2nd Gen with MagSafe Case USB-C',
    mrp: 24900,
    sellingPrice: 23490,
    shipping: 0,
    inStock: true,
    delivery: 'Express 24-hr Delivery',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.croma.com/apple-airpods-pro-2nd-gen-usb-c/p/301290',
  },
];

export class CromaProvider implements MarketplaceProvider {
  name = 'Croma';
  slug = 'croma';
  logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Croma_Logo.png';
  websiteUrl = 'https://www.croma.com';
  isInternal = false;

  isConfigured(): boolean {
    return false; // Uses authorized dev adapter
  }

  async healthCheck(): Promise<ProviderHealth> {
    const start = Date.now();
    return {
      slug: this.slug,
      name: this.name,
      logo: this.logoUrl,
      isConfigured: this.isConfigured(),
      isAvailable: true,
      latencyMs: Date.now() - start,
    };
  }

  async searchProducts(query: string): Promise<NormalizedProduct[]> {
    const cleanQ = ProductMatchingEngine.cleanText(query);
    const words = cleanQ.split(' ').filter(Boolean);

    const matches = CROMA_CATALOG.filter((item) => {
      const titleClean = ProductMatchingEngine.cleanText(item.title);
      return words.every((w) => titleClean.includes(w)) || titleClean.includes(cleanQ);
    });

    return matches.map((item) => this.normalizeItem(item));
  }

  async getProductDetails(externalId: string): Promise<NormalizedProduct | null> {
    const item = CROMA_CATALOG.find((p) => p.id === externalId);
    if (!item) return null;
    return this.normalizeItem(item);
  }

  private normalizeItem(item: SeedItem): NormalizedProduct {
    const specs = ProductMatchingEngine.extractSpecs(item.title);
    const groupKey = ProductMatchingEngine.generateGroupKey(specs);

    return {
      externalId: item.id,
      marketplaceSlug: this.slug,
      marketplaceName: this.name,
      marketplaceLogo: this.logoUrl,
      isInternal: false,
      title: item.title,
      brand: specs.brand,
      model: specs.model,
      specs,
      groupKey,
      imageUrl: item.imageUrl,
      url: item.url,
      offer: {
        marketplaceSlug: this.slug,
        marketplaceName: this.name,
        marketplaceLogo: this.logoUrl,
        isInternal: false,
        productTitle: item.title,
        productUrl: item.url,
        mrp: item.mrp,
        sellingPrice: item.sellingPrice,
        shippingCharge: item.shipping,
        finalPrice: item.sellingPrice + item.shipping,
        currency: 'INR',
        inStock: item.inStock,
        deliveryTime: item.delivery,
        sellerName: 'Infiniti Retail Ltd (Croma Official)',
        sellerRating: 4.8,
        isVerified: true,
        condition: specs.condition,
        lastUpdated: new Date().toISOString(),
      },
    };
  }
}
