import { describe, it, expect } from 'vitest';
import { ProductMatchingEngine } from '../services/comparison/ProductMatchingEngine';
import { PriceComparisonEngine } from '../services/comparison/PriceComparisonEngine';
import prisma from '../config/prisma';

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

  it('verifies exact product matches share identical canonical group key', () => {
    const spec1 = ProductMatchingEngine.extractSpecs('Sony WH-1000XM5 Wireless Noise Canceling Headphones - Black');
    const spec2 = ProductMatchingEngine.extractSpecs('Sony WH-1000XM5 Bluetooth Headset with Active Noise Cancellation (Black)');
    expect(ProductMatchingEngine.isComparable(spec1, spec2)).toBe(true);
    expect(ProductMatchingEngine.calculateConfidence(spec1, spec2)).toBeGreaterThanOrEqual(0.85);
  });

  it('rejects comparison between different storage capacities (128GB vs 256GB vs 512GB)', () => {
    const spec128 = ProductMatchingEngine.extractSpecs('Apple iPhone 16 Pro (128 GB) - Black Titanium');
    const spec256 = ProductMatchingEngine.extractSpecs('Apple iPhone 16 Pro (256 GB) - Black Titanium');
    const spec512 = ProductMatchingEngine.extractSpecs('Apple iPhone 16 Pro (512 GB) - Black Titanium');

    expect(ProductMatchingEngine.isComparable(spec128, spec256)).toBe(false);
    expect(ProductMatchingEngine.isComparable(spec256, spec512)).toBe(false);
    expect(ProductMatchingEngine.isComparable(spec128, spec512)).toBe(false);
  });

  it('rejects comparison between different model tiers (iPhone 17 vs iPhone 17 Pro vs iPhone 17 Pro Max)', () => {
    const base = ProductMatchingEngine.extractSpecs('Apple iPhone 17 (256 GB) - Blue');
    const pro = ProductMatchingEngine.extractSpecs('Apple iPhone 17 Pro (256 GB) - Natural Titanium');
    const proMax = ProductMatchingEngine.extractSpecs('Apple iPhone 17 Pro Max (256 GB) - Desert Titanium');

    expect(ProductMatchingEngine.isComparable(base, pro)).toBe(false);
    expect(ProductMatchingEngine.isComparable(pro, proMax)).toBe(false);
    expect(ProductMatchingEngine.isComparable(base, proMax)).toBe(false);
  });

  it('isolates Refurbished products from Brand New units', () => {
    const newUnit = ProductMatchingEngine.extractSpecs('Apple iPhone 17 Pro (256 GB) - Brand New');
    const refurbUnit = ProductMatchingEngine.extractSpecs('Apple iPhone 17 Pro (256 GB) - Refurbished Superb Condition');

    expect(newUnit.condition).toBe('NEW');
    expect(refurbUnit.condition).toBe('REFURBISHED');
    expect(ProductMatchingEngine.isComparable(newUnit, refurbUnit)).toBe(false);
    expect(ProductMatchingEngine.generateGroupKey(newUnit)).not.toBe(ProductMatchingEngine.generateGroupKey(refurbUnit));
  });

  it('handles missing product identifiers safely without cross-variant contamination', () => {
    const specWithStorage = ProductMatchingEngine.extractSpecs('Apple iPhone 17 Pro (256 GB)');
    const specWithoutStorage = ProductMatchingEngine.extractSpecs('Apple iPhone 17 Pro Smartphone');

    // Missing storage should NOT be assumed identical to 256GB
    expect(ProductMatchingEngine.isComparable(specWithStorage, specWithoutStorage)).toBe(false);
  });

  it('prevents similar but unrelated accessories from matching main hardware', () => {
    const accessory = ProductMatchingEngine.extractSpecs('Silicone Case for iPhone 17 Pro Max (Black)');
    const phone = ProductMatchingEngine.extractSpecs('Apple iPhone 17 Pro Max (256 GB) - Black Titanium');

    expect(accessory.model).not.toBe(phone.model);
    expect(ProductMatchingEngine.isComparable(accessory, phone)).toBe(false);
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

  it('guarantees unconfigured external providers never return misleading sample data in production', async () => {
    const origEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      // Amazon provider with unconfigured keys in production
      const { AmazonProvider } = await import('../services/comparison/providers/AmazonProvider');
      const amazon = new AmazonProvider();

      const health = await amazon.healthCheck();
      expect(health.isAvailable).toBe(false);
      expect(health.error).toBeDefined();

      const results = await amazon.searchProducts('iPhone 17 Pro');
      expect(results.length).toBe(0); // Zero fake items returned in production!
    } finally {
      process.env.NODE_ENV = origEnv;
    }
  });

  it('ensures each offer explicitly carries feedType and lastUpdated timestamp', async () => {
    const res = await engine.searchAndCompare({ query: 'iPhone 17 Pro 256GB' });
    const allOffers = res.groups.flatMap((g) => g.offers);
    expect(allOffers.length).toBeGreaterThan(0);

    for (const offer of allOffers) {
      expect(['LIVE_API', 'DEVELOPMENT_FEED', 'INTERNAL_DATABASE']).toContain(offer.feedType);
      expect(offer.lastUpdated).toBeDefined();
      expect(new Date(offer.lastUpdated).getTime()).not.toBeNaN();
    }
  });

  it('searches MacBook Air M4, Samsung Galaxy S25 Ultra, Sony WH-1000XM5, and Logitech G502 successfully', async () => {
    // 1. MacBook Air M4
    const macbookRes = await engine.searchAndCompare({ query: 'MacBook Air M4' });
    expect(macbookRes.groups.length).toBeGreaterThan(0);
    const macbookGroup = macbookRes.groups.find((g) => g.model.includes('MacBook Air M4'));
    expect(macbookGroup).toBeDefined();
    expect(macbookGroup?.offers.length).toBeGreaterThanOrEqual(3);

    // 2. Samsung Galaxy S25 Ultra
    const s25Res = await engine.searchAndCompare({ query: 'Samsung Galaxy S25 Ultra' });
    expect(s25Res.groups.length).toBeGreaterThan(0);
    const s25Group = s25Res.groups.find((g) => g.model.includes('Galaxy S25 Ultra'));
    expect(s25Group).toBeDefined();

    // 3. Sony WH-1000XM5
    const sonyRes = await engine.searchAndCompare({ query: 'Sony WH-1000XM5' });
    expect(sonyRes.groups.length).toBeGreaterThan(0);
    const sonyGroup = sonyRes.groups.find((g) => g.model.includes('WH-1000XM5'));
    expect(sonyGroup).toBeDefined();

    // 4. Logitech G502
    const logiRes = await engine.searchAndCompare({ query: 'Logitech G502' });
    expect(logiRes.groups.length).toBeGreaterThan(0);
    const logiGroup = logiRes.groups.find((g) => g.model.includes('G502'));
    expect(logiGroup).toBeDefined();
    expect(logiGroup?.brand).toBe('Logitech');
  });

  it('returns clean empty results for completely nonexistent query', async () => {
    const res = await engine.searchAndCompare({ query: 'nonexistent_xyz_product_999' });
    expect(res.groups.length).toBe(0);
    expect(res.totalGroups).toBe(0);
  });

  it('returns comprehensive provider diagnostics for each search', async () => {
    const res = await engine.searchAndCompare({ query: 'iPhone 17 Pro 256GB' });
    expect(res.diagnostics).toBeDefined();
    expect(res.diagnostics.length).toBe(5);

    const amazonDiag = res.diagnostics.find((d) => d.slug === 'amazon');
    expect(amazonDiag).toBeDefined();
    expect(amazonDiag?.status).toBe('SUCCESS');
    expect(amazonDiag?.resultCount).toBeGreaterThan(0);
    expect(amazonDiag?.responseTimeMs).toBeGreaterThanOrEqual(0);
  });

  describe('Price Intelligence & Alerts Engine', () => {
    it('generates multi-timeline price history snapshots for 7, 30, and 90 days', async () => {
      const history7 = await engine.getPriceHistory('apple-iphone-17-pro-256gb-new', 7);
      expect(history7.daysRange).toBe(7);
      expect(history7.history.length).toBeGreaterThan(0);
      expect(history7.stats.lowestRecordedPrice).toBeGreaterThan(0);
      expect(history7.stats.highestRecordedPrice).toBeGreaterThanOrEqual(history7.stats.lowestRecordedPrice);
      expect(history7.stats.averagePrice).toBeGreaterThan(0);

      const history30 = await engine.getPriceHistory('apple-iphone-17-pro-256gb-new', 30);
      expect(history30.daysRange).toBe(30);
      expect(history30.history.length).toBeGreaterThan(0);

      const history90 = await engine.getPriceHistory('apple-iphone-17-pro-256gb-new', 90);
      expect(history90.daysRange).toBe(90);
      expect(history90.history.length).toBeGreaterThan(0);
    });

    it('creates, retrieves, evaluates, and prevents duplicate price alert notifications', async () => {
      const { PriceAlertService } = await import('../services/comparison/PriceAlertService');
      const testUser = await prisma.user.findFirst();
      if (!testUser) return;

      const groupKey = 'apple-iphone-17-pro-256gb-new';

      // 1. Create alert with target price ₹1,29,000 (higher than lowest ₹1,28,499)
      const alert = await PriceAlertService.createAlert({
        userId: testUser.id,
        groupKey,
        productName: 'Apple iPhone 17 Pro 256GB',
        targetPrice: 129000,
        currentPrice: 130000,
        email: 'test@shopvista.com',
      });

      expect(alert).toBeDefined();
      expect(Number(alert.targetPrice)).toBe(129000);
      expect(alert.isActive).toBe(true);

      // 2. Fetch user alerts
      const userAlerts = await PriceAlertService.getUserAlerts(testUser.id);
      expect(userAlerts.length).toBeGreaterThan(0);
      const found = userAlerts.find((a) => a.id === alert.id);
      expect(found).toBeDefined();

      // 3. Evaluate alert matching with a verified offer of ₹1,28,499 (below ₹1,29,000)
      const mockOffers: any[] = [
        {
          marketplaceSlug: 'shopvista',
          marketplaceName: 'ShopVista Direct',
          finalPrice: 128499,
          inStock: true,
          productUrl: '/product/apple-iphone-17-pro-256gb',
        },
      ];

      const triggerResults = await PriceAlertService.evaluateAlertsForGroup(groupKey, mockOffers);
      expect(triggerResults.length).toBeGreaterThanOrEqual(1);
      const triggered = triggerResults.find((r) => r.alertId === alert.id);
      expect(triggered).toBeDefined();
      expect(triggered?.status).toBe('NOTIFICATION_SENT');
      expect(triggered?.triggeredPrice).toBe(128499);

      // 4. Evaluate again immediately -> MUST BE SKIPPED as duplicate
      const duplicateResults = await PriceAlertService.evaluateAlertsForGroup(groupKey, mockOffers);
      const dup = duplicateResults.find((r) => r.alertId === alert.id);
      expect(dup).toBeDefined();
      expect(dup?.status).toBe('SKIPPED_DUPLICATE');

      // 5. Clean up test alert
      await PriceAlertService.deleteAlert(alert.id, testUser.id);
    });
  });
});
