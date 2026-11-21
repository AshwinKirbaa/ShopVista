import { NormalizedProduct, ProviderHealth } from './types';

export interface MarketplaceProvider {
  name: string;
  slug: string;
  logoUrl: string;
  websiteUrl: string;
  isInternal: boolean;

  /**
   * Checks whether this provider has live API credentials configured
   */
  isConfigured(): boolean;

  /**
   * Health check to test provider connectivity and response time
   */
  healthCheck(): Promise<ProviderHealth>;

  /**
   * Searches the marketplace for products matching the query
   */
  searchProducts(query: string): Promise<NormalizedProduct[]>;

  /**
   * Retrieves specific product details by marketplace external ID
   */
  getProductDetails(externalId: string): Promise<NormalizedProduct | null>;
}
