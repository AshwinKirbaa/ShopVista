import { MarketplaceProvider } from '../MarketplaceProvider';
import { NormalizedProduct, ProviderHealth } from '../types';
import { ProductMatchingEngine } from '../ProductMatchingEngine';
import { prisma } from '../../../config/prisma';
import { DEV_BENCHMARK_CATALOG, matchCatalogQuery } from '../devCatalog';

export class ShopVistaProvider implements MarketplaceProvider {
  name = 'ShopVista Direct';
  slug = 'shopvista';
  logoUrl = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=64&q=80';
  websiteUrl = 'http://localhost:5173';
  isInternal = true;

  isConfigured(): boolean {
    return true; // Always configured as internal store
  }

  async healthCheck(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        slug: this.slug,
        name: this.name,
        logo: this.logoUrl,
        isConfigured: true,
        isAvailable: true,
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        slug: this.slug,
        name: this.name,
        logo: this.logoUrl,
        isConfigured: true,
        isAvailable: false,
        latencyMs: Date.now() - start,
        error: err.message,
      };
    }
  }

  async searchProducts(query: string): Promise<NormalizedProduct[]> {
    if (!query || query.trim().length === 0) return [];

    const cleanQ = ProductMatchingEngine.cleanText(query);
    const stopwords = new Set([
      'product',
      'item',
      'the',
      'a',
      'an',
      'in',
      'for',
      'with',
      'and',
      'or',
      'to',
      'gb',
      'tb',
      'new',
    ]);
    const meaningfulTokens = cleanQ
      .split(' ')
      .filter((w) => w.length > 1 && !stopwords.has(w));

    const results: NormalizedProduct[] = [];
    const seenTitles = new Set<string>();

    try {
      // 1. Search internal PostgreSQL products across name, description, and category
      // Only query DB if there is a substantive query or meaningful tokens
      if (meaningfulTokens.length > 0 || cleanQ.length > 2) {
        const whereClause: any = {
          isActive: true,
          OR: [
            { name: { contains: query.trim(), mode: 'insensitive' } },
            { description: { contains: query.trim(), mode: 'insensitive' } },
            { category: { name: { contains: query.trim(), mode: 'insensitive' } } },
          ],
        };

        // If multi-token query, require all meaningful tokens to be present
        if (meaningfulTokens.length > 1) {
          whereClause.OR.push({
            AND: meaningfulTokens.map((token) => ({
              OR: [
                { name: { contains: token, mode: 'insensitive' } },
                { description: { contains: token, mode: 'insensitive' } },
                { category: { name: { contains: token, mode: 'insensitive' } } },
              ],
            })),
          });
        }

        const dbProducts = await prisma.product.findMany({
          where: whereClause,
          include: { category: true },
          take: 10,
        });

        // Relevance filter: ensure db product actually matches at least 1 meaningful token or query
        const relevantDbProducts = dbProducts.filter((p) => {
          const pText = `${p.name} ${p.description || ''} ${p.category?.name || ''}`.toLowerCase();
          if (pText.includes(cleanQ)) return true;
          return meaningfulTokens.length > 0 && meaningfulTokens.every((token) => pText.includes(token));
        });

        for (const p of relevantDbProducts) {
          const specs = ProductMatchingEngine.extractSpecs(p.name);
          const groupKey = ProductMatchingEngine.generateGroupKey(specs);
          const sellingPrice = p.price.toNumber();
          const mrp = p.comparePrice ? p.comparePrice.toNumber() : sellingPrice;
          const shippingCharge = sellingPrice > 500 ? 0 : 40;
          const inStock = p.stock > 0;

          seenTitles.add(p.name.toLowerCase().trim());

          results.push({
            externalId: p.id,
            marketplaceSlug: this.slug,
            marketplaceName: this.name,
            marketplaceLogo: this.logoUrl,
            isInternal: true,
            title: p.name,
            brand: specs.brand !== 'Generic' ? specs.brand : 'ShopVista',
            model: specs.model,
            category: p.category.name,
            specs,
            groupKey,
            imageUrl:
              p.images[0] ||
              'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
            url: `/product/${p.slug}`,
            offer: {
              id: p.id,
              marketplaceSlug: this.slug,
              marketplaceName: this.name,
              marketplaceLogo: this.logoUrl,
              isInternal: true,
              productTitle: p.name,
              productUrl: `/product/${p.slug}`,
              mrp,
              sellingPrice,
              shippingCharge,
              finalPrice: sellingPrice + shippingCharge,
              currency: 'INR',
              inStock,
              deliveryTime: '2-3 Business Days (Express Dispatch)',
              sellerName: 'ShopVista Official Store',
              sellerRating: 4.9,
              isVerified: true,
              condition: 'NEW',
              feedType: 'INTERNAL_DATABASE',
              lastUpdated: new Date().toISOString(),
            },
          });
        }
      }
    } catch (err: any) {
      console.error('[ShopVistaProvider] PostgreSQL query error:', err.message);
    }

    // 2. In development mode, check dev benchmark catalog for ShopVista direct offers
    if (process.env.NODE_ENV !== 'production') {
      const devMatches = DEV_BENCHMARK_CATALOG.filter(
        (item) => item.offers.shopvista && matchCatalogQuery(item, query)
      );

      for (const item of devMatches) {
        const offer = item.offers.shopvista!;
        if (seenTitles.has(offer.title.toLowerCase().trim())) continue;

        const specs = ProductMatchingEngine.extractSpecs(offer.title, item.condition, item.brand);
        if (item.storage && !specs.storage) specs.storage = item.storage;
        if (item.ram && !specs.ram) specs.ram = item.ram;
        const groupKey = ProductMatchingEngine.generateGroupKey(specs);
        const finalPrice = offer.sellingPrice + offer.shipping;

        results.push({
          externalId: `${item.id}-sv`,
          marketplaceSlug: this.slug,
          marketplaceName: this.name,
          marketplaceLogo: this.logoUrl,
          isInternal: true,
          title: offer.title,
          brand: specs.brand,
          model: specs.model,
          category: item.category,
          specs,
          groupKey,
          imageUrl: item.imageUrl,
          url: offer.url,
          offer: {
            id: `${item.id}-sv-offer`,
            marketplaceSlug: this.slug,
            marketplaceName: this.name,
            marketplaceLogo: this.logoUrl,
            isInternal: true,
            productTitle: offer.title,
            productUrl: offer.url,
            mrp: offer.mrp,
            sellingPrice: offer.sellingPrice,
            shippingCharge: offer.shipping,
            finalPrice,
            currency: 'INR',
            inStock: offer.inStock,
            deliveryTime: offer.delivery,
            sellerName: 'ShopVista Official Direct',
            sellerRating: offer.rating,
            isVerified: true,
            condition: item.condition,
            feedType: 'INTERNAL_DATABASE',
            lastUpdated: new Date().toISOString(),
          },
        });
      }
    }

    return results;
  }

  async getProductDetails(externalId: string): Promise<NormalizedProduct | null> {
    try {
      const p = await prisma.product.findUnique({
        where: { id: externalId },
        include: { category: true },
      });

      if (!p) {
        // Fallback to dev benchmark catalog
        const rawId = externalId.replace(/-sv$/, '');
        const devItem = DEV_BENCHMARK_CATALOG.find((item) => item.id === rawId && item.offers.shopvista);
        if (!devItem) return null;

        const offer = devItem.offers.shopvista!;
        const specs = ProductMatchingEngine.extractSpecs(offer.title, devItem.condition, devItem.brand);
        return {
          externalId,
          marketplaceSlug: this.slug,
          marketplaceName: this.name,
          marketplaceLogo: this.logoUrl,
          isInternal: true,
          title: offer.title,
          brand: specs.brand,
          model: specs.model,
          category: devItem.category,
          specs,
          groupKey: ProductMatchingEngine.generateGroupKey(specs),
          imageUrl: devItem.imageUrl,
          url: offer.url,
          offer: {
            marketplaceSlug: this.slug,
            marketplaceName: this.name,
            marketplaceLogo: this.logoUrl,
            isInternal: true,
            productTitle: offer.title,
            productUrl: offer.url,
            mrp: offer.mrp,
            sellingPrice: offer.sellingPrice,
            shippingCharge: offer.shipping,
            finalPrice: offer.sellingPrice + offer.shipping,
            currency: 'INR',
            inStock: offer.inStock,
            deliveryTime: offer.delivery,
            sellerName: 'ShopVista Official Direct',
            sellerRating: offer.rating,
            isVerified: true,
            condition: devItem.condition,
            feedType: 'INTERNAL_DATABASE',
            lastUpdated: new Date().toISOString(),
          },
        };
      }

      const specs = ProductMatchingEngine.extractSpecs(p.name);
      const groupKey = ProductMatchingEngine.generateGroupKey(specs);
      const sellingPrice = p.price.toNumber();
      const mrp = p.comparePrice ? p.comparePrice.toNumber() : sellingPrice;
      const shippingCharge = sellingPrice > 500 ? 0 : 40;

      return {
        externalId: p.id,
        marketplaceSlug: this.slug,
        marketplaceName: this.name,
        marketplaceLogo: this.logoUrl,
        isInternal: true,
        title: p.name,
        brand: specs.brand !== 'Generic' ? specs.brand : 'ShopVista',
        model: specs.model,
        category: p.category.name,
        specs,
        groupKey,
        imageUrl:
          p.images[0] ||
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
        url: `/product/${p.slug}`,
        offer: {
          id: p.id,
          marketplaceSlug: this.slug,
          marketplaceName: this.name,
          marketplaceLogo: this.logoUrl,
          isInternal: true,
          productTitle: p.name,
          productUrl: `/product/${p.slug}`,
          mrp,
          sellingPrice,
          shippingCharge,
          finalPrice: sellingPrice + shippingCharge,
          currency: 'INR',
          inStock: p.stock > 0,
          deliveryTime: '2-3 Business Days (Express Dispatch)',
          sellerName: 'ShopVista Official Store',
          sellerRating: 4.9,
          isVerified: true,
          condition: 'NEW',
          feedType: 'INTERNAL_DATABASE',
          lastUpdated: new Date().toISOString(),
        },
      };
    } catch {
      return null;
    }
  }
}
