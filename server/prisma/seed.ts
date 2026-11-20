import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding e-commerce database...');

  // 1. Clean existing records in referential order
  await prisma.orderStatusHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleaned old records');

  // 2. Create Admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 10);
  const admin = await prisma.user.create({
    data: {
      name: process.env.ADMIN_NAME || 'Store Administrator',
      email: (process.env.ADMIN_EMAIL || 'admin@ecommerce.com').toLowerCase(),
      password: adminPassword,
      phone: '+91 9876543210',
      role: 'ADMIN',
      cart: { create: {} },
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // Create standard test demo user
  const demoUserPassword = await bcrypt.hash('User@123456', 10);
  const demoUser = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: demoUserPassword,
      phone: '+91 9123456789',
      role: 'USER',
      cart: { create: {} },
      addresses: {
        create: {
          fullName: 'John Doe',
          phone: '+91 9123456789',
          addressLine1: '42 MG Road, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          isDefault: true,
        },
      },
    },
  });
  console.log(`Created demo user: ${demoUser.email}`);

  // 3. Create Categories
  const categoriesData = [
    {
      name: 'Electronics & Gadgets',
      slug: 'electronics-gadgets',
      description: 'Cutting-edge smartphones, audio, wearables, and computing devices.',
      image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Fashion & Apparel',
      slug: 'fashion-apparel',
      description: 'Trendy clothing, luxury accessories, footwear, and designer streetwear.',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Modern furniture, minimalist home decor, kitchenware, and smart living.',
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sports & Fitness',
      slug: 'sports-fitness',
      description: 'Performance workout gear, athletic footwear, gym accessories, and outdoor essentials.',
      image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Books & Stationery',
      slug: 'books-stationery',
      description: 'Bestselling novels, business guides, aesthetic journals, and luxury writing pens.',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Beauty & Skincare',
      slug: 'beauty-skincare',
      description: 'Organic botanical skincare, luxury fragrance, and dermatological essentials.',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created.id;
  }
  console.log(`Created ${categoriesData.length} categories`);

  // 4. Create 18 Realistic Products
  const productsData = [
    // Electronics
    {
      name: 'AcousticPro ANC Wireless Headphones',
      slug: 'acousticpro-anc-wireless-headphones',
      description:
        'Studio-grade high fidelity sound featuring dual 40mm Neodymium drivers, adaptive hybrid active noise cancellation, and up to 45 hours of ultra-long battery life with rapid USB-C fast charging.',
      price: new Prisma.Decimal(12999.0),
      comparePrice: new Prisma.Decimal(17999.0),
      sku: 'ELEC-ANC-001',
      stock: 45,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['electronics-gadgets'],
      isFeatured: true,
      rating: new Prisma.Decimal(4.8),
      reviewCount: 142,
    },
    {
      name: 'Titan Smartwatch Series 7 Sapphire',
      slug: 'titan-smartwatch-series-7-sapphire',
      description:
        'AMOLED Always-On retina display with aerospace titanium casing, continuous SpO2 biometric monitoring, 5ATM waterproof resistance, and multi-day GPS sports tracking.',
      price: new Prisma.Decimal(18499.0),
      comparePrice: new Prisma.Decimal(24999.0),
      sku: 'ELEC-WAT-002',
      stock: 28,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['electronics-gadgets'],
      isFeatured: true,
      rating: new Prisma.Decimal(4.9),
      reviewCount: 98,
    },
    {
      name: 'UltraVision 4K HDR Mechanical Monitor',
      slug: 'ultravision-4k-hdr-monitor',
      description:
        '27-inch 4K IPS display featuring 99% DCI-P3 color gamut accuracy, 144Hz refresh rate, USB-C 90W single-cable power delivery, and an ergonomic full-motion stand.',
      price: new Prisma.Decimal(34999.0),
      comparePrice: new Prisma.Decimal(42999.0),
      sku: 'ELEC-MON-003',
      stock: 12,
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['electronics-gadgets'],
      isFeatured: false,
      rating: new Prisma.Decimal(4.7),
      reviewCount: 45,
    },
    {
      name: 'SoundSphere 360 Portable Speaker',
      slug: 'soundsphere-360-portable-speaker',
      description:
        'Omnidirectional 360-degree immersive soundstage with deep punchy bass, IP67 dust/waterproofing, multi-speaker party pairing, and 20-hour playback.',
      price: new Prisma.Decimal(4999.0),
      comparePrice: new Prisma.Decimal(6999.0),
      sku: 'ELEC-SPK-004',
      stock: 60,
      images: [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['electronics-gadgets'],
      isFeatured: true,
      rating: new Prisma.Decimal(4.6),
      reviewCount: 210,
    },

    // Fashion
    {
      name: 'Classic Heritage Oxford Leather Jacket',
      slug: 'classic-heritage-oxford-leather-jacket',
      description:
        'Handcrafted from 100% full-grain distressed vintage leather with antique brass YKK hardware, quilted thermal interior lining, and tailored silhouette.',
      price: new Prisma.Decimal(8999.0),
      comparePrice: new Prisma.Decimal(14999.0),
      sku: 'FASH-JKT-001',
      stock: 18,
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['fashion-apparel'],
      isFeatured: true,
      rating: new Prisma.Decimal(4.9),
      reviewCount: 84,
    },
    {
      name: 'Merino Wool Minimalist Crewneck Sweater',
      slug: 'merino-wool-crewneck-sweater',
      description:
        'Superfine 19.5-micron Italian Merino wool with natural thermoregulation, odor resistance, and an ultra-soft handfeel for versatile everyday layering.',
      price: new Prisma.Decimal(3499.0),
      comparePrice: new Prisma.Decimal(4999.0),
      sku: 'FASH-SWT-002',
      stock: 35,
      images: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['fashion-apparel'],
      isFeatured: false,
      rating: new Prisma.Decimal(4.5),
      reviewCount: 39,
    },
    {
      name: 'Voyager Urban Canvas Backpack',
      slug: 'voyager-urban-canvas-backpack',
      description:
        'Heavy-duty 16oz water-repellent waxed canvas, genuine vegetable-tanned leather accents, padded 16-inch laptop pocket, and hidden security passport sleeve.',
      price: new Prisma.Decimal(3299.0),
      comparePrice: new Prisma.Decimal(4500.0),
      sku: 'FASH-BAG-003',
      stock: 42,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['fashion-apparel'],
      isFeatured: true,
      rating: new Prisma.Decimal(4.7),
      reviewCount: 112,
    },
    {
      name: 'AeroStride Prime Knit Running Shoes',
      slug: 'aerostride-prime-knit-running-shoes',
      description:
        'Engineered seamless breathable mesh upper with responsive nitrogen-infused foam midsole providing 75% energy return on road and trail runs.',
      price: new Prisma.Decimal(5499.0),
      comparePrice: new Prisma.Decimal(7999.0),
      sku: 'FASH-SHOE-004',
      stock: 50,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['fashion-apparel'],
      isFeatured: true,
      rating: new Prisma.Decimal(4.8),
      reviewCount: 320,
    },

    // Home & Living
    {
      name: 'Nordic Oak Minimalist Table Lamp',
      slug: 'nordic-oak-minimalist-table-lamp',
      description:
        'Sustainably sourced Scandinavian solid white oak base with frosted opalescent glass diffuser and smooth touch-dimming warm ambient LED illumination.',
      price: new Prisma.Decimal(2899.0),
      comparePrice: new Prisma.Decimal(3999.0),
      sku: 'HOME-LMP-001',
      stock: 22,
      images: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['home-living'],
      isFeatured: false,
      rating: new Prisma.Decimal(4.7),
      reviewCount: 56,
    },
    {
      name: 'BaristaTouch Precision Espresso Machine',
      slug: 'baristatouch-precision-espresso-machine',
      description:
        '15-bar Italian high pressure pump, ThermoJet instant 3-second heating system, integrated conical burr grinder with 30 micro-settings, and microfoam steam wand.',
      price: new Prisma.Decimal(24999.0),
      comparePrice: new Prisma.Decimal(32999.0),
      sku: 'HOME-COF-002',
      stock: 8,
      images: [
        'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['home-living'],
      isFeatured: true,
      rating: new Prisma.Decimal(4.9),
      reviewCount: 77,
    },
    {
      name: 'Artisan Ceramic Pour-Over & Mug Set',
      slug: 'artisan-ceramic-pour-over-mug-set',
      description:
        'Hand-thrown speckled stoneware ceramic pour-over dripper with two matching 350ml ergonomic mugs finished in matte reactive mineral glaze.',
      price: new Prisma.Decimal(1899.0),
      comparePrice: new Prisma.Decimal(2499.0),
      sku: 'HOME-MUG-003',
      stock: 30,
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['home-living'],
      isFeatured: false,
      rating: new Prisma.Decimal(4.6),
      reviewCount: 41,
    },

    // Sports & Fitness
    {
      name: 'ApexPro Hex Neoprene Dumbbell Set (20kg)',
      slug: 'apexpro-hex-neoprene-dumbbell-set',
      description:
        'Anti-roll cast-iron hexagonal core encased in commercial-grade non-slip thick neoprene coating with contoured ergonomic steel handles.',
      price: new Prisma.Decimal(4499.0),
      comparePrice: new Prisma.Decimal(5999.0),
      sku: 'SPRT-DB-001',
      stock: 15,
      images: [
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['sports-fitness'],
      isFeatured: false,
      rating: new Prisma.Decimal(4.8),
      reviewCount: 93,
    },
    {
      name: 'EcoFlex Natural Tree-Rubber Yoga Mat',
      slug: 'ecoflex-natural-rubber-yoga-mat',
      description:
        '6mm ultra-cushioned eco-certified natural tree rubber providing non-slip wet grip, laser-etched posture alignment guidelines, and carrying harness.',
      price: new Prisma.Decimal(2299.0),
      comparePrice: new Prisma.Decimal(3299.0),
      sku: 'SPRT-YOG-002',
      stock: 40,
      images: [
        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['sports-fitness'],
      isFeatured: true,
      rating: new Prisma.Decimal(4.7),
      reviewCount: 165,
    },
    {
      name: 'HydroShield Vacuum Insulated Flask (1L)',
      slug: 'hydroshield-vacuum-insulated-flask-1l',
      description:
        '18/8 food-grade kitchen stainless steel with double-wall copper insulation keeping beverages ice-cold for 36 hours or piping hot for 18 hours.',
      price: new Prisma.Decimal(1299.0),
      comparePrice: new Prisma.Decimal(1799.0),
      sku: 'SPRT-BOT-003',
      stock: 75,
      images: [
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['sports-fitness'],
      isFeatured: false,
      rating: new Prisma.Decimal(4.9),
      reviewCount: 280,
    },

    // Books & Stationery
    {
      name: 'Designing Data-Intensive Applications (Hardcover)',
      slug: 'designing-data-intensive-applications-hardcover',
      description:
        'The definitive architectural masterpiece by Martin Kleppmann on distributed data systems, reliability, scalability, storage engines, and consensus algorithms.',
      price: new Prisma.Decimal(1999.0),
      comparePrice: new Prisma.Decimal(2499.0),
      sku: 'BOOK-CS-001',
      stock: 55,
      images: [
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['books-stationery'],
      isFeatured: true,
      rating: new Prisma.Decimal(5.0),
      reviewCount: 512,
    },
    {
      name: 'Handbound Leather Grimoire Journal (120gsm)',
      slug: 'handbound-leather-journal',
      description:
        'Top-grain distressed full-leather binding holding 240 pages of fountain-pen-friendly unlined 120gsm cotton rag archival paper with ribbon marker.',
      price: new Prisma.Decimal(1199.0),
      comparePrice: new Prisma.Decimal(1699.0),
      sku: 'BOOK-JRN-002',
      stock: 35,
      images: [
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['books-stationery'],
      isFeatured: false,
      rating: new Prisma.Decimal(4.8),
      reviewCount: 89,
    },

    // Beauty & Skincare
    {
      name: 'Botanical Radiance Vitamin C Serum (50ml)',
      slug: 'botanical-radiance-vitamin-c-serum',
      description:
        'Clinical 15% stabilized L-Ascorbic Acid infused with pure plant Ferulic acid, Hyaluronic acid, and Kakadu Plum for luminous skin brightening.',
      price: new Prisma.Decimal(1599.0),
      comparePrice: new Prisma.Decimal(2299.0),
      sku: 'BEAU-SRM-001',
      stock: 65,
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['beauty-skincare'],
      isFeatured: true,
      rating: new Prisma.Decimal(4.7),
      reviewCount: 194,
    },
    {
      name: 'Nocturne Eau De Parfum Natural Spray (100ml)',
      slug: 'nocturne-eau-de-parfum-100ml',
      description:
        'An opulent aromatic symphony of Calabrian Bergamot, French Lavender, Smoked Cedarwood, and Madagascar Vanilla Bourbon in a heavy crystal glass flacon.',
      price: new Prisma.Decimal(4599.0),
      comparePrice: new Prisma.Decimal(6299.0),
      sku: 'BEAU-PRF-002',
      stock: 20,
      images: [
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categories['beauty-skincare'],
      isFeatured: false,
      rating: new Prisma.Decimal(4.9),
      reviewCount: 73,
    },
  ];

  for (const prod of productsData) {
    await prisma.product.create({ data: prod });
  }
  console.log(`Created ${productsData.length} realistic products`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
