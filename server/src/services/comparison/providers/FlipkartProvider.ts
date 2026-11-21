import axios from 'axios';
import { MarketplaceProvider } from '../MarketplaceProvider';
import { NormalizedProduct, ProviderHealth } from '../types';
import { ProductMatchingEngine } from '../ProductMatchingEngine';
import { DEV_BENCHMARK_CATALOG, matchCatalogQuery, DevCatalogItem } from '../devCatalog';

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
    const configured = this.isConfigured();
    const isProduction = process.env.NODE_ENV === 'production';
    const isAvailable = configured || !isProduction;

    return {
      slug: this.slug,
      name: this.name,
      logo: this.logoUrl,
      isConfigured: configured,
      isAvailable,
      latencyMs: Date.now() - start,
      error: !configured && isProduction ? 'Flipkart Affiliate API credentials not configured in production' : undefined,
    };
  }

  async searchProducts(query: string): Promise<NormalizedProduct[]> {
    const isProduction = process.env.NODE_ENV === 'production';

    // 1. If configured with live affiliate credentials, make live API call
    if (this.isConfigured()) {
      try {
        return await this.fetchLiveFlipkart(query);
      } catch (err: any) {
        console.error('[FlipkartProvider] Live API request failed:', err.message);
        if (isProduction) return [];
      }
    }

    // 2. In production, unconfigured external provider must return empty results
    if (isProduction) {
      return [];
    }

    // 3. In development / demo mode: comprehensive benchmark catalog with transparent Dev Feed label
    const matchedItems = DEV_BENCHMARK_CATALOG.filter(
      (item) => item.offers.flipkart && matchCatalogQuery(item, query)
    );

    return matchedItems.map((item) => this.normalizeDevItem(item));
  }

  async getProductDetails(externalId: string): Promise<NormalizedProduct | null> {
    const rawId = externalId.replace(/-flip$/, '');
    const item = DEV_BENCHMARK_CATALOG.find((p) => p.id === rawId && p.offers.flipkart);
    if (!item) return null;
    return this.normalizeDevItem(item);
  }

  private normalizeDevItem(item: DevCatalogItem): NormalizedProduct {
    const offer = item.offers.flipkart!;
    const specs = ProductMatchingEngine.extractSpecs(offer.title, item.condition, item.brand);
    if (item.storage && !specs.storage) specs.storage = item.storage;
    if (item.ram && !specs.ram) specs.ram = item.ram;
    const groupKey = ProductMatchingEngine.generateGroupKey(specs);
    const finalPrice = offer.sellingPrice + offer.shipping;

    return {
      externalId: `${item.id}-flip`,
      marketplaceSlug: this.slug,
      marketplaceName: this.name,
      marketplaceLogo: this.logoUrl,
      isInternal: false,
      title: offer.title,
      brand: specs.brand,
      model: specs.model,
      category: item.category,
      specs,
      groupKey,
      imageUrl: item.imageUrl,
      url: offer.url,
      offer: {
        id: `${item.id}-flip-offer`,
        marketplaceSlug: this.slug,
        marketplaceName: this.name,
        marketplaceLogo: this.logoUrl,
        isInternal: false,
        productTitle: offer.title,
        productUrl: offer.url,
        mrp: offer.mrp,
        sellingPrice: offer.sellingPrice,
        shippingCharge: offer.shipping,
        finalPrice,
        currency: 'INR',
        inStock: offer.inStock,
        deliveryTime: offer.delivery,
        sellerName: 'SuperComNet (Flipkart Assured)',
        sellerRating: offer.rating,
        couponDetails: offer.coupon,
        isVerified: true,
        condition: item.condition,
        feedType: 'DEVELOPMENT_FEED',
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  private async fetchLiveFlipkart(query: string): Promise<NormalizedProduct[]> {
    const endpoint = `https://affiliate-api.flipkart.net/affiliate/1.0/search.json?query=${encodeURIComponent(query)}&resultCount=5`;
    const res = await axios.get(endpoint, {
      headers: {
        'Fk-Affiliate-Id': process.env.FLIPKART_AFFILIATE_ID,
        'Fk-Affiliate-Token': process.env.FLIPKART_AFFILIATE_TOKEN,
      },
      timeout: 3500,
    });

    const products = res.data?.products || [];
    return products.map((prod: any) => {
      const baseInfo = prod.productBaseInfoV1;
      const title = baseInfo.title || query;
      const price = baseInfo.flipkartSellingPrice?.amount || 0;
      const mrp = baseInfo.maximumRetailPrice?.amount || price;
      const specs = ProductMatchingEngine.extractSpecs(title);
      const groupKey = ProductMatchingEngine.generateGroupKey(specs);

      return {
        externalId: baseInfo.productId,
        marketplaceSlug: this.slug,
        marketplaceName: this.name,
        marketplaceLogo: this.logoUrl,
        isInternal: false,
        title,
        brand: specs.brand,
        model: specs.model,
        specs,
        groupKey,
        imageUrl: baseInfo.imageUrls?.['400x400'] || '',
        url: baseInfo.productUrl,
        offer: {
          marketplaceSlug: this.slug,
          marketplaceName: this.name,
          marketplaceLogo: this.logoUrl,
          isInternal: false,
          productTitle: title,
          productUrl: baseInfo.productUrl,
          mrp,
          sellingPrice: price,
          shippingCharge: 0,
          finalPrice: price,
          currency: 'INR',
          inStock: baseInfo.inStock ?? true,
          deliveryTime: 'Delivery in 2-3 Days',
          sellerName: 'Flipkart Certified Seller',
          sellerRating: 4.7,
          isVerified: true,
          condition: 'NEW',
          feedType: 'LIVE_API',
          lastUpdated: new Date().toISOString(),
        },
      };
    });
  }
}
