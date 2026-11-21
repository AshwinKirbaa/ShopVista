import { describe, it, expect } from 'vitest';
import { ProductMatchingEngine } from '../services/comparison/ProductMatchingEngine';
import { PriceComparisonEngine } from '../services/comparison/PriceComparisonEngine';

describe('ProductMatchingEngine', () => {
  it('strictly isolates iPhone 17 Pro 256GB from 512GB, Pro Max, and Refurbished', () => {
    const titlePro256 = 'Apple iPhone 17 Pro (256 GB) - Natural Titanium';
    const titlePro512 = 'Apple iPhone 17 Pro (512 GB) - Natural Titanium';
    const titleProMax256 = 'Apple iPhone 17 Pro Max (256 GB) - Desert Titanium';
    const titlePro256Refurb = 'Apple iPhone 17 Pro (256 GB) - Refurbished';

    const specs1 = ProductMatchingEngine.extractSpecs(titlePro256);
    const specs2 = ProductMatchingEngine.extractSpecs(titlePro512);
    const specs3 = ProductMatchingEngine.extractSpecs(titleProMax256);
    const specs4 = ProductMatchingEngine.extractSpecs(titlePro256Refurb);

    const key1 = ProductMatchingEngine.generateGroupKey(specs1);
    const key2 = ProductMatchingEngine.generateGroupKey(specs2);
    const key3 = ProductMatchingEngine.generateGroupKey(specs3);
    const key4 = ProductMatchingEngine.generateGroupKey(specs4);

    expect(specs1.model).toBe('iPhone 17 Pro');
    expect(specs1.storage).toBe('256GB');
    expect(specs1.condition).toBe('NEW');

    expect(specs2.model).toBe('iPhone 17 Pro');
    expect(specs2.storage).toBe('512GB');

    expect(specs3.model).toBe('iPhone 17 Pro Max');
    expect(specs3.storage).toBe('256GB');

    expect(specs4.condition).toBe('REFURBISHED');

    // All keys MUST be strictly different so they are NEVER compared as identical products
    expect(key1).not.toBe(key2);
    expect(key1).not.toBe(key3);
    expect(key1).not.toBe(key4);
    expect(key2).not.toBe(key3);

    // Comparable check
    expect(ProductMatchingEngine.isComparable(specs1, specs2)).toBe(false);
    expect(ProductMatchingEngine.isComparable(specs1, specs3)).toBe(false);
    expect(ProductMatchingEngine.isComparable(specs1, specs4)).toBe(false);
  });

  it('matches same variant across different retailers despite differing title phrasing', () => {
    const amz = 'Apple iPhone 17 Pro (256 GB) - Natural Titanium';
    const flp = 'Apple iPhone 17 Pro (Natural Titanium, 256 GB)';
    const croma = 'Apple iPhone 17 Pro (256GB ROM, 8GB RAM, Natural Titanium)';

    const keyAmz = ProductMatchingEngine.generateGroupKey(ProductMatchingEngine.extractSpecs(amz));
    const keyFlp = ProductMatchingEngine.generateGroupKey(ProductMatchingEngine.extractSpecs(flp));
    const keyCroma = ProductMatchingEngine.generateGroupKey(ProductMatchingEngine.extractSpecs(croma));

    expect(keyAmz).toBe(keyFlp);
    expect(keyAmz).toBe(keyCroma);
  });
});

describe('PriceComparisonEngine', () => {
  const engine = new PriceComparisonEngine();

  it('searches and compares multiple marketplaces concurrently', async () => {
    const res = await engine.searchAndCompare({ query: 'iPhone 17 Pro 256GB' });

    expect(res.providersSearched).toBe(5);
    expect(res.providersSucceeded).toBeGreaterThanOrEqual(4);
    expect(res.groups.length).toBeGreaterThan(0);

    const group = res.groups.find((g) => g.model === 'iPhone 17 Pro' && g.variant.includes('256GB') && g.condition === 'NEW');
    expect(group).toBeDefined();

    if (group) {
      expect(group.offers.length).toBeGreaterThanOrEqual(3);
      expect(group.lowestPrice).toBeDefined();
      expect(group.lowestPrice).toBeGreaterThan(100000);

      // Verify that the lowest price offer is marked with isLowestPrice: true
      const lowestOffer = group.offers.find((o) => o.isLowestPrice);
      expect(lowestOffer).toBeDefined();
      expect(lowestOffer?.inStock).toBe(true);
      expect(lowestOffer?.finalPrice).toBe(group.lowestPrice);
    }
  });

  it('never crowns an out-of-stock product as the lowest purchasable price', async () => {
    const res = await engine.searchAndCompare({ query: 'iPhone 17 Pro 512GB' });
    const group512 = res.groups.find((g) => g.variant.includes('512GB'));

    if (group512) {
      // Find out-of-stock offers
      const outOfStock = group512.offers.filter((o) => !o.inStock);
      outOfStock.forEach((o) => {
        expect(o.isLowestPrice).toBeFalsy();
      });

      if (group512.lowestPrice !== null) {
        const lowestOffer = group512.offers.find((o) => o.finalPrice === group512.lowestPrice);
        expect(lowestOffer?.inStock).toBe(true);
      }
    }
  });

  it('returns price history and trend analytics', async () => {
    const historyData = await engine.getPriceHistory('apple-iphone-17-pro-256gb-new');
    expect(historyData.history.length).toBeGreaterThan(10);
    expect(historyData.stats.lowestRecordedPrice).toBeGreaterThan(0);
    expect(historyData.stats.averagePrice).toBeGreaterThan(0);
  });
});
