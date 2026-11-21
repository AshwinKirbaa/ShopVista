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

const RELIANCE_CATALOG: SeedItem[] = [
  {
    id: 'RD-IP17P-256',
    title: 'Apple iPhone 17 Pro 256 GB, Natural Titanium',
    mrp: 134900,
    sellingPrice: 129990,
    shipping: 0,
    inStock: true,
    delivery: 'Free Express Delivery across India',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.reliancedigital.in/apple-iphone-17-pro-256-gb-natural-titanium/p/4944201',
  },
  {
    id: 'RD-IP17PM-256',
    title: 'Apple iPhone 17 Pro Max 256 GB, Desert Titanium',
    mrp: 144900,
    sellingPrice: 140990,
    shipping: 0,
    inStock: true,
    delivery: 'Express Home Delivery in 24 Hours',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.reliancedigital.in/apple-iphone-17-pro-max-256-gb-desert-titanium/p/4944202',
  },
  {
    id: 'RD-MBP14-M4',
    title: 'Apple MacBook Pro (14 inch, M4 Pro chip, 24GB, 512GB SSD) Space Black',
    mrp: 199900,
    sellingPrice: 193490,
    shipping: 0,
    inStock: true,
    delivery: 'Free Delivery by Reliance ResQ',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.reliancedigital.in/apple-macbook-pro-14-m4-pro-512gb/p/4945511',
  },
  {
    id: 'RD-SONY-XM5',
    title: 'Sony WH-1000XM5 Wireless Over the Ear Headphone with Mic, Black',
    mrp: 34990,
    sellingPrice: 27490,
    shipping: 0,
    inStock: true,
    delivery: 'Same-day store pickup or delivery',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.reliancedigital.in/sony-wh-1000xm5-wireless-headphone/p/4928509',
  },
  {
    id: 'RD-SAM-S25U',
    title: 'Samsung 256 GB, 12 GB RAM, Titanium Gray, Galaxy S25 Ultra 5G Smartphone',
    mrp: 134999,
    sellingPrice: 125999,
    shipping: 0,
    inStock: true,
    delivery: 'Express Delivery by Tomorrow',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
    url: 'https://www.reliancedigital.in/samsung-galaxy-s25-ultra-256gb/p/4946622',
  },
];

export class RelianceDigitalProvider implements MarketplaceProvider {
  name = 'Reliance Digital';
  slug = 'reliance';
  logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Reliance_Digital_logo.svg';
  websiteUrl = 'https://www.reliancedigital.in';
  isInternal = false;

  isConfigured(): boolean {
    return false;
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

    const matches = RELIANCE_CATALOG.filter((item) => {
      const titleClean = ProductMatchingEngine.cleanText(item.title);
      return words.every((w) => titleClean.includes(w)) || titleClean.includes(cleanQ);
    });

    return matches.map((item) => this.normalizeItem(item));
  }

  async getProductDetails(externalId: string): Promise<NormalizedProduct | null> {
    const item = RELIANCE_CATALOG.find((p) => p.id === externalId);
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
        sellerName: 'Reliance Retail Limited',
        sellerRating: 4.7,
        isVerified: true,
        condition: specs.condition,
        lastUpdated: new Date().toISOString(),
      },
    };
  }
}
