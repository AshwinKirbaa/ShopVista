import axios from 'axios';
import { MarketplaceProvider } from '../MarketplaceProvider';
import { NormalizedProduct, ProviderHealth } from '../types';
import { ProductMatchingEngine } from '../ProductMatchingEngine';
import { DEV_BENCHMARK_CATALOG, matchCatalogQuery, DevCatalogItem } from '../devCatalog';

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
      error: !configured && isProduction ? 'Amazon PA-API credentials not configured in production' : undefined,
    };
  }

  async searchProducts(query: string): Promise<NormalizedProduct[]> {
    const isProduction = process.env.NODE_ENV === 'production';

    // 1. If authorized live credentials exist, execute live PA-API search
    if (this.isConfigured()) {
      try {
        return await this.fetchLivePAAPI(query);
      } catch (err: any) {
        console.error('[AmazonProvider] Live API request failed:', err.message);
        if (isProduction) return [];
      }
    }

    // 2. In production, unconfigured external providers must never return misleading sample data
    if (isProduction) {
      return [];
    }

    // 3. In development / demonstration mode: comprehensive benchmark catalog with transparent Dev Feed label
    const matchedItems = DEV_BENCHMARK_CATALOG.filter(
      (item) => item.offers.amazon && matchCatalogQuery(item, query)
    );

    return matchedItems.map((item) => this.normalizeDevItem(item));
  }

  async getProductDetails(externalId: string): Promise<NormalizedProduct | null> {
    const rawId = externalId.replace(/-amz$/, '');
    const item = DEV_BENCHMARK_CATALOG.find((p) => p.id === rawId && p.offers.amazon);
    if (!item) return null;
    return this.normalizeDevItem(item);
  }

  private normalizeDevItem(item: DevCatalogItem): NormalizedProduct {
    const offer = item.offers.amazon!;
    const specs = ProductMatchingEngine.extractSpecs(offer.title, item.condition, item.brand);
    // Preserve canonical storage & ram if known in benchmark item
    if (item.storage && !specs.storage) specs.storage = item.storage;
    if (item.ram && !specs.ram) specs.ram = item.ram;
    const groupKey = ProductMatchingEngine.generateGroupKey(specs);
    const finalPrice = offer.sellingPrice + offer.shipping;

    return {
      externalId: `${item.id}-amz`,
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
        id: `${item.id}-amz-offer`,
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
        sellerName: 'Appario Retail (Amazon Verified)',
        sellerRating: offer.rating,
        isVerified: true,
        condition: item.condition,
        feedType: 'DEVELOPMENT_FEED',
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  private async fetchLivePAAPI(query: string): Promise<NormalizedProduct[]> {
    const endpoint = 'https://webservices.amazon.in/paapi5/searchitems';
    const partnerTag = process.env.AMAZON_ASSOCIATE_TAG || 'shopvista-21';
    const payload = {
      Keywords: query,
      Resources: [
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible',
        'Images.Primary.Large',
      ],
      PartnerTag: partnerTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.in',
    };

    const res = await axios.post(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
        'x-paapi-key': process.env.AMAZON_PAAPI_KEY,
      },
      timeout: 3500,
    });

    const items = res.data?.SearchResult?.Items || [];
    return items.map((item: any) => {
      const title = item.ItemInfo?.Title?.DisplayValue || query;
      const price = item.Offers?.Listings?.[0]?.Price?.Amount || 0;
      const specs = ProductMatchingEngine.extractSpecs(title);
      const groupKey = ProductMatchingEngine.generateGroupKey(specs);

      return {
        externalId: item.ASIN,
        marketplaceSlug: this.slug,
        marketplaceName: this.name,
        marketplaceLogo: this.logoUrl,
        isInternal: false,
        title,
        brand: specs.brand,
        model: specs.model,
        specs,
        groupKey,
        imageUrl: item.Images?.Primary?.Large?.URL || '',
        url: item.DetailPageURL || `https://www.amazon.in/dp/${item.ASIN}?tag=${partnerTag}`,
        offer: {
          marketplaceSlug: this.slug,
          marketplaceName: this.name,
          marketplaceLogo: this.logoUrl,
          isInternal: false,
          productTitle: title,
          productUrl: item.DetailPageURL || `https://www.amazon.in/dp/${item.ASIN}?tag=${partnerTag}`,
          mrp: price,
          sellingPrice: price,
          shippingCharge: 0,
          finalPrice: price,
          currency: 'INR',
          inStock: true,
          deliveryTime: 'Prime 1-Day Delivery',
          sellerName: 'Amazon Retail',
          sellerRating: 4.8,
          isVerified: true,
          condition: 'NEW',
          feedType: 'LIVE_API',
          lastUpdated: new Date().toISOString(),
        },
      };
    });
  }
}
