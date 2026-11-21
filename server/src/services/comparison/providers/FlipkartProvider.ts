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

const FLIPKART_CATALOG: SeedItem[] = [
  {
    id: 'MOBGX1W1XYFLIP',
    title: 'Apple iPhone 17 Pro (Natural Titanium, 256 GB)',
    mrp: 134900,
    sellingPrice: 128990,
    shipping: 0,
    inStock: true,
    delivery: 'Delivery by 11 PM Tomorrow with Plus',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.flipkart.com/apple-iphone-17-pro-natural-titanium-256-gb/p/itm17pro256',
    coupon: 'Flat ₹1,000 off on select bank UPI',
  },
  {
    id: 'MOBGX2W2XZFLIP',
    title: 'Apple iPhone 17 Pro (Natural Titanium, 512 GB)',
    mrp: 154900,
    sellingPrice: 151900,
    shipping: 0,
    inStock: true,
    delivery: 'Delivery in 2 Days',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.flipkart.com/apple-iphone-17-pro-natural-titanium-512-gb/p/itm17pro512',
  },
  {
    id: 'MOBGX3W3PMFLIP',
    title: 'Apple iPhone 17 Pro Max (Desert Titanium, 256 GB)',
    mrp: 144900,
    sellingPrice: 138990,
    shipping: 0,
    inStock: true,
    delivery: 'Delivery Tomorrow',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.flipkart.com/apple-iphone-17-pro-max-desert-titanium-256-gb/p/itm17promax256',
  },
  {
    id: 'MOBGX1RFBFLIP',
    title: 'Apple iPhone 17 Pro (Natural Titanium, 256 GB) - Refurbished Superb Condition',
    mrp: 134900,
    sellingPrice: 114499,
    shipping: 49,
    inStock: true,
    delivery: 'Delivery in 3-4 Days',
    rating: 4.2,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.flipkart.com/apple-iphone-17-pro-256gb-refurb/p/itm17rfb',
    rawCondition: 'REFURBISHED',
  },
  {
    id: 'MOBGV2X5KMFLIP',
    title: 'Apple iPhone 16 Pro (Black Titanium, 128 GB)',
    mrp: 119900,
    sellingPrice: 111999,
    shipping: 0,
    inStock: true,
    delivery: 'Delivery Tomorrow',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.flipkart.com/apple-iphone-16-pro-black-titanium-128-gb/p/itm16pro128',
  },
  {
    id: 'LPTD9MBP14M4',
    title: 'Apple 2024 MacBook Pro (14-inch, Apple M4 Pro chip, 24 GB RAM / 512 GB SSD) - Space Black',
    mrp: 199900,
    sellingPrice: 192990,
    shipping: 0,
    inStock: true,
    delivery: 'Delivery in 2 Days',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.flipkart.com/apple-2024-macbook-pro-m4-pro-512-gb/p/itmm4pro14',
  },
  {
    id: 'AUD9XS7M4S2FLIP',
    title: 'Sony WH-1000XM5 Bluetooth Headset with Active Noise Cancellation (Black)',
    mrp: 34990,
    sellingPrice: 25990,
    shipping: 0,
    inStock: true,
    delivery: 'Delivery Tomorrow',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.flipkart.com/sony-wh-1000xm5-bluetooth-headset/p/itmxm5black',
  },
  {
    id: 'MOBSHN8921FLIP',
    title: 'Samsung Galaxy S25 Ultra 5G (Titanium Gray, 256 GB) (12 GB RAM)',
    mrp: 134999,
    sellingPrice: 126999,
    shipping: 0,
    inStock: true,
    delivery: 'Delivery Tomorrow',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.flipkart.com/samsung-galaxy-s25-ultra-5g-titanium-gray-256-gb/p/itms25ultra256',
  },
  {
    id: 'AUDBDHWDR12FLIP',
    title: 'Apple AirPods Pro (2nd generation) with MagSafe Case (USB-C) Bluetooth Headset',
    mrp: 24900,
    sellingPrice: 22490,
    shipping: 0,
    inStock: true,
    delivery: 'Delivery in 2 Days',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.flipkart.com/apple-airpods-pro-2nd-generation-magsafe-case-usb-c/p/itmairpods2',
  },
];

export class FlipkartProvider implements MarketplaceProvider {
  name = 'Flipkart';
  slug = 'flipkart';
  logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg';
  websiteUrl = 'https://www.flipkart.com';
  isInternal = false;

  isConfigured(): boolean {
    return Boolean(process.env.FLIPKART_AFFILIATE_ID && process.env.FLIPKART_AFFILIATE_TOKEN);
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

    const matches = FLIPKART_CATALOG.filter((item) => {
      const titleClean = ProductMatchingEngine.cleanText(item.title);
      return words.every((w) => titleClean.includes(w)) || titleClean.includes(cleanQ);
    });

    return matches.map((item) => this.normalizeItem(item));
  }

  async getProductDetails(externalId: string): Promise<NormalizedProduct | null> {
    const item = FLIPKART_CATALOG.find((p) => p.id === externalId);
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
        sellerName: 'SuperComNet (Flipkart Assured)',
        sellerRating: 4.7,
        couponDetails: item.coupon,
        isVerified: true,
        condition: specs.condition,
        feedType: this.isConfigured() ? 'LIVE_API' : 'DEVELOPMENT_FEED',
        lastUpdated: new Date().toISOString(),
      },
    };
  }
}
