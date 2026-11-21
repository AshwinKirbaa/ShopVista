import api from './api';
import { ApiResponse } from '../types';

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
  finalPrice: number;
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
  matchConfidence: number;
  lowestPrice: number | null;
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

export interface ProviderDiagnostic {
  provider: string;
  slug: string;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'UNCONFIGURED';
  resultCount: number;
  responseTimeMs: number;
  feedType: 'LIVE_API' | 'DEVELOPMENT_FEED' | 'INTERNAL_DATABASE';
  errorReason?: string;
}

export interface CompareSearchResponse {
  query: string;
  totalGroups: number;
  groups: ComparisonGroup[];
  providersSearched: number;
  providersSucceeded: number;
  diagnostics?: ProviderDiagnostic[];
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

export interface PriceHistorySnapshot {
  id: string;
  marketplaceName: string;
  marketplaceLogo: string;
  marketplaceSlug: string;
  price: number;
  inStock: boolean;
  feedType: 'LIVE_API' | 'DEVELOPMENT_FEED' | 'INTERNAL_DATABASE';
  productIdentifier?: string;
  recordedAt: string;
}

export interface PriceHistoryData {
  groupKey: string;
  daysRange: number;
  history: {
    date: string;
    amazon?: number;
    flipkart?: number;
    croma?: number;
    reliance?: number;
    shopvista?: number;
    lowest?: number;
    feedType?: string;
  }[];
  snapshots?: PriceHistorySnapshot[];
  stats: {
    lowestRecordedPrice: number;
    highestRecordedPrice: number;
    averagePrice: number;
    priceDropPercentage: number;
    dataPointsCount: number;
    currentLowestPrice?: number;
    daysRange?: number;
  };
}

export const compareService = {
  async searchCompare(params: {
    q: string;
    sortBy?: string;
    marketplace?: string;
    inStock?: boolean;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const res = await api.get<ApiResponse<CompareSearchResponse>>('/compare/search', { params });
    return res.data;
  },

  async getGroupDetails(groupKey: string) {
    const res = await api.get<ApiResponse<ComparisonGroup>>(`/compare/product/${groupKey}`);
    return res.data;
  },

  async getPriceHistory(groupKey: string, days: number = 30) {
    const res = await api.get<ApiResponse<PriceHistoryData>>(`/compare/price-history/${groupKey}`, {
      params: { days },
    });
    return res.data;
  },

  async getMarketplaces() {
    const res = await api.get<ApiResponse<ProviderHealth[]>>('/compare/marketplaces');
    return res.data;
  },

  async createPriceAlert(data: {
    groupKey: string;
    productName: string;
    targetPrice: number;
    currentPrice: number;
  }) {
    const res = await api.post<ApiResponse<any>>('/compare/alerts', data);
    return res.data;
  },

  async getUserAlerts() {
    const res = await api.get<ApiResponse<any[]>>('/compare/alerts');
    return res.data;
  },

  async deleteAlert(id: string) {
    const res = await api.delete<ApiResponse<{ deleted: boolean }>>(`/compare/alerts/${id}`);
    return res.data;
  },
};
