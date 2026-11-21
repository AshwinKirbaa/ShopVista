import { MarketplaceProvider } from '../MarketplaceProvider';
import { NormalizedProduct, ProviderHealth } from '../types';
import { ProductMatchingEngine } from '../ProductMatchingEngine';
import { prisma } from '../../../config/prisma';

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
    const cleanQ = ProductMatchingEngine.cleanText(query);
    const words = cleanQ.split(' ').filter(Boolean);

    // Search internal PostgreSQL products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          ...words.map((w) => ({ name: { contains: w, mode: 'insensitive' as const } })),
        ],
      },
      include: {
        category: true,
      },
      take: 10,
    });

    return products.map((p) => {
      const specs = ProductMatchingEngine.extractSpecs(p.name);
      const groupKey = ProductMatchingEngine.generateGroupKey(specs);
      const sellingPrice = p.price.toNumber();
      const mrp = p.comparePrice ? p.comparePrice.toNumber() : sellingPrice;
      const shippingCharge = sellingPrice > 500 ? 0 : 40;
      const inStock = p.stock > 0;

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
        imageUrl: p.images[0] || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
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
          couponDetails: 'Use code FIRST10 for ₹500 off',
          isVerified: true,
          condition: specs.condition,
          feedType: 'INTERNAL_DATABASE',
          lastUpdated: p.updatedAt.toISOString(),
        },
      };
    });
  }

  async getProductDetails(externalId: string): Promise<NormalizedProduct | null> {
    const p = await prisma.product.findUnique({
      where: { id: externalId },
      include: { category: true },
    });
    if (!p) return null;

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
      imageUrl: p.images[0] || '',
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
        deliveryTime: '2-3 Business Days',
        sellerName: 'ShopVista Official Store',
        sellerRating: 4.9,
        couponDetails: 'Use code FIRST10 for ₹500 off',
        isVerified: true,
        condition: specs.condition,
        feedType: 'INTERNAL_DATABASE',
        lastUpdated: p.updatedAt.toISOString(),
      },
    };
  }
}
