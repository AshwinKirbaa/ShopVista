export interface VariantSpecs {
  brand: string;
  model: string;
  storage?: string; // e.g. "128GB", "256GB", "512GB", "1TB"
  ram?: string;     // e.g. "8GB", "12GB", "16GB"
  color?: string;
  condition: 'NEW' | 'REFURBISHED' | 'OPEN_BOX';
  gtin?: string;    // UPC / EAN
}

export interface NormalizedOffer {
  id?: string;
  marketplaceSlug: string;
  marketplaceName: string;
  marketplaceLogo: string;
  isInternal: boolean;
  productTitle: string;
  productUrl: string;
  mrp: number;
  sellingPrice: number;
  shippingCharge: number;
  finalPrice: number; // sellingPrice + shippingCharge
  currency: string;
  inStock: boolean;
  deliveryTime?: string;
  sellerName?: string;
  sellerRating?: number;
  couponDetails?: string;
  isVerified: boolean;
  condition: 'NEW' | 'REFURBISHED' | 'OPEN_BOX';
  feedType: 'LIVE_API' | 'DEVELOPMENT_FEED' | 'INTERNAL_DATABASE';
  isLowestPrice?: boolean;
  lastUpdated: string;
}

export interface NormalizedProduct {
  externalId: string;
  marketplaceSlug: string;
  marketplaceName: string;
  marketplaceLogo: string;
  isInternal: boolean;
  title: string;
  brand: string;
  model?: string;
  category?: string;
  specs: VariantSpecs;
  groupKey: string; // generated canonical group key
  imageUrl: string;
  url: string;
  offer: NormalizedOffer;
}

export interface ProviderHealth {
  slug: string;
  name: string;
  logo: string;
  isConfigured: boolean;
  isAvailable: boolean;
  latencyMs: number;
  error?: string;
}

export interface ProviderDiagnostic {
  provider: string;
  slug: string;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'UNCONFIGURED';
  resultCount: number;
  responseTimeMs: number;
  feedType: 'LIVE_API' | 'DEVELOPMENT_FEED' | 'INTERNAL_DATABASE';
  errorReason?: string;
}

export interface ComparisonGroup {
  groupKey: string;
  canonicalTitle: string;
  brand: string;
  model: string;
  category: string;
  variant: string;
  color?: string;
  condition: string;
  imageUrl: string;
  matchConfidence: number; // 0.0 to 1.0
  lowestPrice: number | null; // purchasable in-stock lowest
  highestPrice: number | null;
  potentialSavings: number | null;
  savingsPercentage: number | null;
  retailerCount: number;
  inStockRetailerCount: number;
  offers: NormalizedOffer[];
  priceRange: {
    min: number;
    max: number;
  };
}

export interface PriceHistoryItem {
  id: string;
  marketplaceName: string;
  marketplaceLogo: string;
  price: number;
  recordedAt: string;
}

export interface PriceStatistics {
  lowestRecordedPrice: number;
  highestRecordedPrice: number;
  averagePrice: number;
  priceDropPercentage: number;
  dataPointsCount: number;
}
