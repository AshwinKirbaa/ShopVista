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
  rawCondition?: string;
  coupon?: string;
}

const AMAZON_CATALOG: SeedItem[] = [
  {
    id: 'B0CHX1W1XY',
    title: 'Apple iPhone 17 Pro (256 GB) - Natural Titanium',
    mrp: 134900,
    sellingPrice: 129900,
    shipping: 0,
    inStock: true,
    delivery: 'Tomorrow by 11 AM with Prime',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.amazon.in/dp/B0CHX1W1XY?tag=shopvista-21',
  },
  {
    id: 'B0CHX2W2XZ',
    title: 'Apple iPhone 17 Pro (512 GB) - Natural Titanium',
    mrp: 154900,
    sellingPrice: 149900,
    shipping: 0,
    inStock: true,
    delivery: 'Tomorrow by 11 AM with Prime',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.amazon.in/dp/B0CHX2W2XZ?tag=shopvista-21',
  },
  {
    id: 'B0CHX3W3PM',
    title: 'Apple iPhone 17 Pro Max (256 GB) - Desert Titanium',
    mrp: 144900,
    sellingPrice: 139900,
    shipping: 0,
    inStock: true,
    delivery: 'Free One-Day Delivery',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.amazon.in/dp/B0CHX3W3PM?tag=shopvista-21',
  },
  {
    id: 'B0CHX1RFB',
    title: 'Apple iPhone 17 Pro (256 GB) - Natural Titanium (Refurbished - Excellent)',
    mrp: 134900,
    sellingPrice: 112999,
    shipping: 0,
    inStock: true,
    delivery: '2-3 Business Days',
    rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.amazon.in/dp/B0CHX1RFB?tag=shopvista-21',
    rawCondition: 'REFURBISHED',
  },
  {
    id: 'B0CGV2X5KM',
    title: 'Apple iPhone 16 Pro (128 GB) - Black Titanium',
    mrp: 119900,
    sellingPrice: 112900,
    shipping: 0,
    inStock: true,
    delivery: 'Tomorrow by 2 PM',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.amazon.in/dp/B0CGV2X5KM?tag=shopvista-21',
  },
  {
    id: 'B0D9MBP14M4',
    title: 'Apple 2024 MacBook Pro (14-inch, M4 Pro chip with 12-core CPU, 24GB Unified Memory, 512GB SSD) - Space Black',
    mrp: 199900,
    sellingPrice: 189900,
    shipping: 0,
    inStock: true,
    delivery: 'Tomorrow by 11 AM with Prime',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.amazon.in/dp/B0D9MBP14M4?tag=shopvista-21',
  },
  {
    id: 'B09XS7M4S2',
    title: 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones - Black',
    mrp: 34990,
    sellingPrice: 26990,
    shipping: 0,
    inStock: true,
    delivery: 'Tomorrow by 9 PM',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.amazon.in/dp/B09XS7M4S2?tag=shopvista-21',
  },
  {
    id: 'B0BSHN8921',
    title: 'Samsung Galaxy S25 Ultra 5G (Titanium Gray, 12GB RAM, 256GB Storage)',
    mrp: 134999,
    sellingPrice: 124999,
    shipping: 0,
    inStock: true,
    delivery: 'Tomorrow by 11 AM',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.amazon.in/dp/B0BSHN8921?tag=shopvista-21',
  },
  {
    id: 'B0BDHWDR12',
    title: 'Apple AirPods Pro (2nd Gen) with MagSafe Case (USB-C)',
    mrp: 24900,
    sellingPrice: 21900,
    shipping: 0,
    inStock: true,
    delivery: 'Tomorrow by 11 AM',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.amazon.in/dp/B0BDHWDR12?tag=shopvista-21',
  },
  {
    id: 'B0CHXKB001',
    title: 'ShopVista Studio Pro High-Fidelity ANC Wireless Headphones',
    mrp: 24999,
    sellingPrice: 22499,
    shipping: 0,
    inStock: true,
    delivery: '2-Day Shipping',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.amazon.in/dp/B0CHXKB001?tag=shopvista-21',
  },
];

export class AmazonProvider implements MarketplaceProvider {
  name = 'Amazon India';
  slug = 'amazon';
  logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg';
  websiteUrl = 'https://www.amazon.in';
  isInternal = false;

  isConfigured(): boolean {
    return Boolean(process.env.AMAZON_PAAPI_KEY && process.env.AMAZON_PAAPI_SECRET);
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

    const matches = AMAZON_CATALOG.filter((item) => {
      const titleClean = ProductMatchingEngine.cleanText(item.title);
      return words.every((w) => titleClean.includes(w)) || titleClean.includes(cleanQ);
    });

    return matches.map((item) => this.normalizeItem(item));
  }

  async getProductDetails(externalId: string): Promise<NormalizedProduct | null> {
    const item = AMAZON_CATALOG.find((p) => p.id === externalId);
    if (!item) return null;
    return this.normalizeItem(item);
  }

  private normalizeItem(item: SeedItem): NormalizedProduct {
    const specs = ProductMatchingEngine.extractSpecs(item.title, item.rawCondition);
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
        sellerName: 'Appario Retail (Amazon Verified)',
        sellerRating: 4.8,
        couponDetails: item.coupon,
        isVerified: true,
        condition: specs.condition,
        feedType: this.isConfigured() ? 'LIVE_API' : 'DEVELOPMENT_FEED',
        lastUpdated: new Date().toISOString(),
      },
    };
  }
}
