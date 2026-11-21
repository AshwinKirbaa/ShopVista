import { MarketplaceProvider } from '../MarketplaceProvider';
import { NormalizedProduct, ProviderHealth } from '../types';
import { ProductMatchingEngine } from '../ProductMatchingEngine';
import { DEV_BENCHMARK_CATALOG, matchCatalogQuery, DevCatalogItem } from '../devCatalog';

export class CromaProvider implements MarketplaceProvider {
  name = 'Croma';
  slug = 'croma';
  logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Croma_Logo.png';
  websiteUrl = 'https://www.croma.com';
  isInternal = false;

  isConfigured(): boolean {
    return Boolean(process.env.CROMA_API_KEY);
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
      error: !configured && isProduction ? 'Croma partner API credentials not configured in production' : undefined,
    };
  }

  async searchProducts(query: string): Promise<NormalizedProduct[]> {
    const isProduction = process.env.NODE_ENV === 'production';

    // In production, unconfigured external provider must not return sample data
    if (!this.isConfigured() && isProduction) {
      return [];
    }

    const matchedItems = DEV_BENCHMARK_CATALOG.filter(
      (item) => item.offers.croma && matchCatalogQuery(item, query)
    );

    return matchedItems.map((item) => this.normalizeDevItem(item));
  }

  async getProductDetails(externalId: string): Promise<NormalizedProduct | null> {
    const rawId = externalId.replace(/-croma$/, '');
    const item = DEV_BENCHMARK_CATALOG.find((p) => p.id === rawId && p.offers.croma);
    if (!item) return null;
    return this.normalizeDevItem(item);
  }

  private normalizeDevItem(item: DevCatalogItem): NormalizedProduct {
    const offer = item.offers.croma!;
    const specs = ProductMatchingEngine.extractSpecs(offer.title, item.condition, item.brand);
    if (item.storage && !specs.storage) specs.storage = item.storage;
    if (item.ram && !specs.ram) specs.ram = item.ram;
    const groupKey = ProductMatchingEngine.generateGroupKey(specs);
    const finalPrice = offer.sellingPrice + offer.shipping;

    return {
      externalId: `${item.id}-croma`,
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
        id: `${item.id}-croma-offer`,
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
        sellerName: 'Infiniti Retail Ltd (Croma Official)',
        sellerRating: offer.rating,
        isVerified: true,
        condition: item.condition,
        feedType: 'DEVELOPMENT_FEED',
        lastUpdated: new Date().toISOString(),
      },
    };
  }
}
