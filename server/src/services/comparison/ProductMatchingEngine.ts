import { VariantSpecs, NormalizedProduct } from './types';

export class ProductMatchingEngine {
  /**
   * Normalizes query and titles to a clean lower-case alphanumeric string
   */
  static cleanText(input: string): string {
    return input
      .toLowerCase()
      .replace(/(\d+)\s*(gb|tb|mb)\b/gi, '$1$2')
      .replace(/[\(\)\[\]\{\}\-\–\_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Strict extractor for storage capacity (128GB, 256GB, 512GB, 1TB, etc.)
   */
  static extractStorage(title: string): string | undefined {
    const match = title.match(/\b(32|64|128|256|512)\s*(gb|g)\b/i) || title.match(/\b(1|2)\s*(tb|t)\b/i);
    if (!match) return undefined;
    const num = match[1];
    const unit = match[2].toUpperCase().startsWith('T') ? 'TB' : 'GB';
    return `${num}${unit}`;
  }

  /**
   * Extractor for RAM (e.g. 8GB RAM, 16GB RAM)
   */
  static extractRam(title: string): string | undefined {
    const match = title.match(/\b(4|6|8|12|16|24|32|64)\s*(gb)?\s*(ram|memory)\b/i);
    if (match) {
      return `${match[1]}GB`;
    }
    return undefined;
  }

  /**
   * Strict extractor for Product Condition (NEW vs REFURBISHED)
   */
  static extractCondition(title: string, rawCondition?: string): 'NEW' | 'REFURBISHED' | 'OPEN_BOX' {
    if (rawCondition) {
      const c = rawCondition.toUpperCase();
      if (c.includes('REFURB') || c.includes('RENEW')) return 'REFURBISHED';
      if (c.includes('OPEN')) return 'OPEN_BOX';
    }
    const clean = title.toLowerCase();
    if (clean.includes('refurbished') || clean.includes('renewed') || clean.includes('pre-owned') || clean.includes('preowned')) {
      return 'REFURBISHED';
    }
    if (clean.includes('open box') || clean.includes('unboxed')) {
      return 'OPEN_BOX';
    }
    return 'NEW';
  }

  /**
   * Known brand identification
   */
  static detectBrand(title: string): string {
    const clean = title.toLowerCase();
    const brands: [string, RegExp][] = [
      ['Apple', /\b(apple|iphone|ipad|macbook|airpods|imac|watch)\b/i],
      ['Samsung', /\b(samsung|galaxy|odyssey)\b/i],
      ['Sony', /\b(sony|playstation|bravia|wh\s*1000xm|wf\s*1000xm)\b/i],
      ['Bose', /\b(bose|quietcomfort)\b/i],
      ['Sennheiser', /\b(sennheiser|momentum)\b/i],
      ['Logitech', /\b(logitech|g502|mx\s*mechanical|mx\s*master|mx\s*keys)\b/i],
      ['Razer', /\b(razer|deathadder|blackwidow|viper|huntsman)\b/i],
      ['SteelSeries', /\b(steelseries|apex\s*pro|arctis)\b/i],
      ['Keychron', /\b(keychron)\b/i],
      ['OnePlus', /\b(oneplus)\b/i],
      ['Google', /\b(google|pixel)\b/i],
      ['Dell', /\b(dell|xps|ultrasharp|alienware)\b/i],
      ['LG', /\b(lg|ultragear|ultrafine)\b/i],
      ['Lenovo', /\b(lenovo|thinkpad|legion)\b/i],
      ['HP', /\b(hp|pavilion|spectre|envy|omen)\b/i],
      ['Asus', /\b(asus|rog|zenbook|zephyrus)\b/i],
      ['ShopVista', /\b(shopvista|acousticpro|ergomechanical|apexfit)\b/i],
    ];

    for (const [brand, regex] of brands) {
      if (regex.test(clean)) return brand;
    }
    return 'Generic';
  }

  /**
   * Specific model extractor with strict tier separation (e.g. Pro Max != Pro != Base)
   */
  static extractModel(title: string, brand: string): string {
    const isAccessory = /\b(case|cover|protector|tempered|skin|strap|band|cable|adapter|charger|pouch|sleeve|stand|mount)\b/i.test(title);
    if (isAccessory) {
      return `${brand} Accessory`;
    }

    const clean = this.cleanText(title);

    // Apple iPhone models
    if (brand === 'Apple' || clean.includes('iphone')) {
      // Must check Pro Max BEFORE Pro!
      if (clean.includes('iphone 17 pro max')) return 'iPhone 17 Pro Max';
      if (clean.includes('iphone 17 pro')) return 'iPhone 17 Pro';
      if (clean.includes('iphone 17 plus')) return 'iPhone 17 Plus';
      if (clean.includes('iphone 17')) return 'iPhone 17';

      if (clean.includes('iphone 16 pro max')) return 'iPhone 16 Pro Max';
      if (clean.includes('iphone 16 pro')) return 'iPhone 16 Pro';
      if (clean.includes('iphone 16 plus')) return 'iPhone 16 Plus';
      if (clean.includes('iphone 16')) return 'iPhone 16';

      if (clean.includes('iphone 15 pro max')) return 'iPhone 15 Pro Max';
      if (clean.includes('iphone 15 pro')) return 'iPhone 15 Pro';
      if (clean.includes('iphone 15')) return 'iPhone 15';

      if (clean.includes('macbook pro')) {
        if (clean.includes('m4 pro')) return 'MacBook Pro M4 Pro';
        if (clean.includes('m4 max')) return 'MacBook Pro M4 Max';
        if (clean.includes('m4')) return 'MacBook Pro M4';
        if (clean.includes('m3')) return 'MacBook Pro M3';
        return 'MacBook Pro';
      }
      if (clean.includes('macbook air')) {
        if (clean.includes('m4')) return 'MacBook Air M4';
        if (clean.includes('m3')) return 'MacBook Air M3';
        if (clean.includes('m2')) return 'MacBook Air M2';
        return 'MacBook Air';
      }
      if (clean.includes('ipad pro')) return 'iPad Pro M4';
      if (clean.includes('ipad air')) return 'iPad Air M2';
      if (clean.includes('ipad')) return 'iPad';
      if (clean.includes('airpods pro')) return 'AirPods Pro 2';
      if (clean.includes('airpods max')) return 'AirPods Max';
      if (clean.includes('watch ultra 2')) return 'Apple Watch Ultra 2';
      if (clean.includes('watch series 10') || clean.includes('series 10')) return 'Apple Watch Series 10';
    }

    // Samsung Galaxy models
    if (brand === 'Samsung' || clean.includes('galaxy') || clean.includes('odyssey')) {
      if (clean.includes('s25 ultra')) return 'Galaxy S25 Ultra';
      if (clean.includes('s25 plus') || clean.includes('s25+')) return 'Galaxy S25+';
      if (clean.includes('s25')) return 'Galaxy S25';

      if (clean.includes('s24 ultra')) return 'Galaxy S24 Ultra';
      if (clean.includes('s24 plus') || clean.includes('s24+')) return 'Galaxy S24+';
      if (clean.includes('s24')) return 'Galaxy S24';

      if (clean.includes('z fold 6')) return 'Galaxy Z Fold 6';
      if (clean.includes('z flip 6')) return 'Galaxy Z Flip 6';
      if (clean.includes('watch 7')) return 'Galaxy Watch 7';
      if (clean.includes('tab s10 ultra') || clean.includes('tab s10')) return 'Galaxy Tab S10 Ultra';
      if (clean.includes('odyssey oled g9') || clean.includes('oled g9')) return 'Odyssey OLED G9';
    }

    // Google Pixel models
    if (brand === 'Google' || clean.includes('pixel')) {
      if (clean.includes('pixel 9 pro xl')) return 'Pixel 9 Pro XL';
      if (clean.includes('pixel 9 pro')) return 'Pixel 9 Pro';
      if (clean.includes('pixel 9')) return 'Pixel 9';
    }

    // OnePlus models
    if (brand === 'OnePlus' || clean.includes('oneplus')) {
      if (clean.includes('oneplus 13')) return 'OnePlus 13';
      if (clean.includes('oneplus 12')) return 'OnePlus 12';
    }

    // Dell models
    if (brand === 'Dell' || clean.includes('xps') || clean.includes('ultrasharp')) {
      if (clean.includes('xps 16') || clean.includes('9640')) return 'XPS 16';
      if (clean.includes('u2723qe') || clean.includes('ultrasharp 27')) return 'UltraSharp U2723QE';
    }

    // ASUS models
    if (brand === 'Asus' || clean.includes('zephyrus')) {
      if (clean.includes('zephyrus g16') || clean.includes('gu605')) return 'ROG Zephyrus G16';
    }

    // Lenovo models
    if (brand === 'Lenovo' || clean.includes('thinkpad')) {
      if (clean.includes('x1 carbon')) return 'ThinkPad X1 Carbon';
    }

    // Logitech models
    if (brand === 'Logitech' || clean.includes('g502') || clean.includes('mx mechanical')) {
      if (clean.includes('g502 x plus') || clean.includes('g502 x')) return 'G502 X PLUS';
      if (clean.includes('g502 hero') || clean.includes('g502')) return 'G502 HERO';
      if (clean.includes('mx mechanical')) return 'MX Mechanical';
    }

    // Razer models
    if (brand === 'Razer' || clean.includes('deathadder')) {
      if (clean.includes('deathadder v3 pro') || clean.includes('deathadder')) return 'DeathAdder V3 Pro';
    }

    // SteelSeries models
    if (brand === 'SteelSeries' || clean.includes('apex pro')) {
      if (clean.includes('apex pro tkl') || clean.includes('apex pro')) return 'Apex Pro TKL';
    }

    // Keychron models
    if (brand === 'Keychron' || clean.includes('q1 pro')) {
      if (clean.includes('q1 pro')) return 'Keychron Q1 Pro';
    }

    // LG models
    if (brand === 'LG' || clean.includes('ultragear')) {
      if (clean.includes('32gs95ue') || clean.includes('ultragear 32')) return 'UltraGear 32GS95UE';
    }

    // Audio Headphones models
    if (clean.includes('wh 1000xm5') || clean.includes('wh1000xm5')) return 'WH-1000XM5';
    if (clean.includes('wh 1000xm4') || clean.includes('wh1000xm4')) return 'WH-1000XM4';
    if (clean.includes('quietcomfort ultra')) return 'QuietComfort Ultra';
    if (clean.includes('momentum 4')) return 'Momentum 4';

    // ShopVista Hardware models
    if (clean.includes('acousticpro anc')) return 'AcousticPro ANC';
    if (clean.includes('ergomechanical')) return 'ErgoMechanical Custom Keyboard';
    if (clean.includes('apexfit pro titanium')) return 'ApexFit Pro Titanium';
    if (clean.includes('ultraslim 4k oled')) return 'UltraSlim 4K OLED Monitor';

    // Fallback: extract first 4 tokens of cleaned title
    return title.split(/\s+/).slice(0, 4).join(' ');
  }

  /**
   * Generates a strict canonical Group Key: e.g. "apple-iphone-17-pro-256gb-new"
   */
  static generateGroupKey(specs: VariantSpecs): string {
    const parts = [
      specs.brand.toLowerCase().replace(/[^a-z0-9]/g, ''),
      specs.model.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      (specs.storage || 'default').toLowerCase(),
      (specs.condition || 'new').toLowerCase(),
    ];
    return parts.join('-').replace(/\-+/g, '-');
  }

  /**
   * Parses full specs and assigns a canonical Group Key
   */
  static parseProductSpecs(title: string, rawBrand?: string, rawCondition?: string): VariantSpecs {
    const brand = rawBrand || this.detectBrand(title);
    const model = this.extractModel(title, brand);
    const storage = this.extractStorage(title);
    const ram = this.extractRam(title);
    const condition = this.extractCondition(title, rawCondition);

    return {
      brand,
      model,
      storage,
      ram,
      condition,
    };
  }

  /**
   * Alias for parseProductSpecs
   */
  static extractSpecs(title: string, rawCondition?: string, rawBrand?: string): VariantSpecs {
    return this.parseProductSpecs(title, rawBrand, rawCondition);
  }

  /**
   * Strict comparison test: Can Product A and Product B be compared for lowest price?
   * If storage differs (e.g. 256GB vs 512GB) or condition differs, returns false!
   */
  static isComparable(a: VariantSpecs, b: VariantSpecs): boolean {
    // 1. Must match brand exactly
    if (a.brand.toLowerCase() !== b.brand.toLowerCase()) return false;

    // 2. Must match model exactly
    if (a.model.toLowerCase() !== b.model.toLowerCase()) return false;

    // 3. Must match storage capacity if known on either
    if (a.storage && b.storage && a.storage.toLowerCase() !== b.storage.toLowerCase()) {
      return false;
    }
    // If one specifies storage and the other doesn't, cannot guarantee exact match
    if ((a.storage && !b.storage) || (!a.storage && b.storage)) {
      return false;
    }

    // 4. Must match condition (New vs Refurbished)
    if (a.condition !== b.condition) return false;

    return true;
  }

  /**
   * Calculates Match Confidence (0.0 to 1.0)
   */
  static calculateConfidence(a: VariantSpecs, b: VariantSpecs): number {
    if (!this.isComparable(a, b)) return 0.0;

    let score = 0.70;
    if (a.brand === b.brand) score += 0.10;
    if (a.model === b.model) score += 0.10;
    if (a.storage && a.storage === b.storage) score += 0.05;
    if (a.condition === b.condition) score += 0.05;

    return Math.min(1.0, score);
  }
}
