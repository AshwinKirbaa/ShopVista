import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ShopVista e-commerce database...');

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
      name: process.env.ADMIN_NAME || 'ShopVista Administrator',
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
      name: 'Ashwin Kirbaa',
      email: 'ashwin@example.com',
      password: demoUserPassword,
      phone: '+91 9123456789',
      role: 'USER',
      cart: { create: {} },
      addresses: {
        create: {
          fullName: 'Ashwin Kirbaa',
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
      name: 'Electronics & Audio',
      slug: 'electronics-audio',
      description: 'Studio-grade headphones, OLED displays, and high-performance computing devices.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Mechanical & Computing',
      slug: 'mechanical-computing',
      description: 'Custom mechanical keyboards, precision docks, and ergonomic workstation gear.',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Wearables & Smart Tech',
      slug: 'wearables-smart-tech',
      description: 'Titanium smartwatches, biometric health bands, and modern everyday carry.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Home & Workstation',
      slug: 'home-workstation',
      description: 'Minimalist aluminum desk accessories, ambient studio lighting, and smart living.',
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Fashion & Everyday Carry',
      slug: 'fashion-edc',
      description: 'Minimalist waterproof tech packs, titanium wallets, and luxury essentials.',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryMap.set(cat.slug, created.id);
  }
  console.log(`Created ${categoriesData.length} categories`);

  // 4. Create 15 Realistic Products for ShopVista
  const productsData = [
    // Electronics & Audio
    {
      name: 'AcousticPro ANC Wireless Headphones',
      slug: 'acousticpro-anc-wireless-headphones',
      description:
        'Studio-grade high fidelity sound featuring dual 40mm Neodymium drivers, adaptive hybrid active noise cancellation, and up to 45 hours of ultra-long battery life with rapid USB-C fast charging.',
      price: new Prisma.Decimal('12999.00'),
      comparePrice: new Prisma.Decimal('17999.00'),
      sku: 'ELEC-ANC-001',
      stock: 45,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categoryMap.get('electronics-audio')!,
      isFeatured: true,
      rating: new Prisma.Decimal('4.9'),
      reviewCount: 142,
    },
    {
      name: 'UltraSlim 4K OLED Portable Monitor (15.6")',
      slug: 'ultraslim-4k-oled-portable-monitor',
      description:
        'Stunning 100% DCI-P3 color gamut, 400 nits peak brightness, 1ms response time, dual USB-C full-function ports, and magnetic origami stand case for mobile productivity.',
      price: new Prisma.Decimal('28999.00'),
      comparePrice: new Prisma.Decimal('34999.00'),
      sku: 'ELEC-MON-002',
      stock: 20,
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categoryMap.get('electronics-audio')!,
      isFeatured: true,
      rating: new Prisma.Decimal('4.8'),
      reviewCount: 88,
    },
    {
      name: 'StudioPro 360 Spatial Audio Soundbar',
      slug: 'studiopro-360-spatial-soundbar',
      description:
        'Immersive Dolby Atmos 5.1 virtual surround sound, dedicated wireless subwoofer, HDMI eARC passthrough, and lossless Bluetooth 5.3 streaming.',
      price: new Prisma.Decimal('19499.00'),
      comparePrice: new Prisma.Decimal('24999.00'),
      sku: 'ELEC-SND-003',
      stock: 30,
      images: [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categoryMap.get('electronics-audio')!,
      isFeatured: false,
      rating: new Prisma.Decimal('4.7'),
      reviewCount: 65,
    },

    // Mechanical & Computing
    {
      name: 'ErgoMechanical Custom Keyboard (Gateron Oil Kings)',
      slug: 'ergomechanical-custom-keyboard',
      description:
        'CNC anodized aluminum body with gasket-mounted polycarbonate plate, factory-lubed linear switches, hot-swappable PCB, and PBT dye-sublimated cherry profile keycaps.',
      price: new Prisma.Decimal('8499.00'),
      comparePrice: new Prisma.Decimal('11999.00'),
      sku: 'MECH-KBD-001',
      stock: 35,
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categoryMap.get('mechanical-computing')!,
      isFeatured: true,
      rating: new Prisma.Decimal('5.0'),
      reviewCount: 210,
    },
    {
      name: 'Precision Solid Aluminum Thunderbolt 4 Dock',
      slug: 'precision-aluminum-thunderbolt-dock',
      description:
        '14-in-1 aerospace aluminum hub providing 96W Power Delivery, dual 4K@120Hz display outputs, 2.5Gbps Ethernet, and 40Gbps bidirectional transfer speeds.',
      price: new Prisma.Decimal('14999.00'),
      comparePrice: new Prisma.Decimal('18999.00'),
      sku: 'MECH-DCK-002',
      stock: 25,
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categoryMap.get('mechanical-computing')!,
      isFeatured: false,
      rating: new Prisma.Decimal('4.8'),
      reviewCount: 47,
    },

    // Wearables & Smart Tech
    {
      name: 'ApexFit Pro Titanium Smartwatch',
      slug: 'apexfit-pro-titanium-smartwatch',
      description:
        'Grade 5 aerospace titanium bezel with sapphire crystal glass, 1.43" AMOLED always-on display, ECG cardiovascular monitor, dual-band GPS, and 14-day battery life.',
      price: new Prisma.Decimal('21999.00'),
      comparePrice: new Prisma.Decimal('27999.00'),
      sku: 'WEAR-WTC-001',
      stock: 40,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categoryMap.get('wearables-smart-tech')!,
      isFeatured: true,
      rating: new Prisma.Decimal('4.9'),
      reviewCount: 312,
    },
    {
      name: 'BioPulse Minimalist Smart Health Ring',
      slug: 'biopulse-smart-health-ring',
      description:
        'Titanium PVD coated smart ring tracking sleep stages, HRV, body temperature trends, and blood oxygen without screen distractions.',
      price: new Prisma.Decimal('16499.00'),
      comparePrice: new Prisma.Decimal('19999.00'),
      sku: 'WEAR-RNG-002',
      stock: 30,
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categoryMap.get('wearables-smart-tech')!,
      isFeatured: true,
      rating: new Prisma.Decimal('4.7'),
      reviewCount: 76,
    },

    // Home & Workstation
    {
      name: 'Minimalist Matte Desk Mat (Vegan Top-Grain)',
      slug: 'minimalist-matte-desk-mat',
      description:
        'Water-resistant, anti-fray stitched edge 900x400mm surface optimized for high-precision optical mouse tracking and luxurious desk aesthetics.',
      price: new Prisma.Decimal('1899.00'),
      comparePrice: new Prisma.Decimal('2599.00'),
      sku: 'HOME-MAT-001',
      stock: 80,
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categoryMap.get('home-workstation')!,
      isFeatured: true,
      rating: new Prisma.Decimal('4.9'),
      reviewCount: 184,
    },
    {
      name: 'Lumina ScreenBar Pro Monitor Light',
      slug: 'lumina-screenbar-pro-monitor-light',
      description:
        'Asymmetrical optical design that illuminates desk space with zero screen glare, auto-dimming ambient light sensor, and wireless dial controller.',
      price: new Prisma.Decimal('5999.00'),
      comparePrice: new Prisma.Decimal('7999.00'),
      sku: 'HOME-LGT-002',
      stock: 50,
      images: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categoryMap.get('home-workstation')!,
      isFeatured: false,
      rating: new Prisma.Decimal('4.8'),
      reviewCount: 95,
    },

    // Fashion & Everyday Carry
    {
      name: 'Nomad Tech Pack (Cordura 500D Waterproof)',
      slug: 'nomad-tech-pack-cordura',
      description:
        'Weatherproof 24L commuter backpack with padded 16" laptop sleeve, YKK Aquaguard zippers, hidden passport pocket, and magnetic Fidlock chest buckle.',
      price: new Prisma.Decimal('6999.00'),
      comparePrice: new Prisma.Decimal('9499.00'),
      sku: 'EDC-BAK-001',
      stock: 35,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categoryMap.get('fashion-edc')!,
      isFeatured: true,
      rating: new Prisma.Decimal('4.9'),
      reviewCount: 118,
    },
    {
      name: 'Apex Minimalist Titanium RFID Wallet',
      slug: 'apex-minimalist-titanium-wallet',
      description:
        'Engineered from dual grade 5 titanium plates with flexible silicone cash strap, holding up to 12 cards with lifetime RFID blocking protection.',
      price: new Prisma.Decimal('2999.00'),
      comparePrice: new Prisma.Decimal('4299.00'),
      sku: 'EDC-WLT-002',
      stock: 60,
      images: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categoryMap.get('fashion-edc')!,
      isFeatured: false,
      rating: new Prisma.Decimal('4.8'),
      reviewCount: 82,
    },
    {
      name: 'HydroShield Vacuum Thermal Flask (1L)',
      slug: 'hydroshield-vacuum-thermal-flask-1l',
      description:
        '18/8 food-grade kitchen stainless steel with double-wall copper insulation keeping beverages ice-cold for 36 hours or piping hot for 18 hours.',
      price: new Prisma.Decimal('1499.00'),
      comparePrice: new Prisma.Decimal('2199.00'),
      sku: 'EDC-BOT-003',
      stock: 75,
      images: [
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
      ],
      categoryId: categoryMap.get('fashion-edc')!,
      isFeatured: false,
      rating: new Prisma.Decimal('4.9'),
      reviewCount: 280,
    },
  ];

  for (const prod of productsData) {
    const created = await prisma.product.create({
      data: {
        ...prod,
        isActive: true,
      },
    });

    // Add high quality reviews
    await prisma.review.createMany({
      data: [
        {
          productId: created.id,
          userId: demoUser.id,
          rating: 5,
          comment: 'Precision engineering at its absolute finest. Exceeded all my build quality expectations.',
        },
        {
          productId: created.id,
          userId: admin.id,
          rating: 5,
          comment: 'Immaculate minimalist industrial design and flawless performance.',
        },
      ],
    });
  }

  console.log(`Created ${productsData.length} ShopVista tech products.`);

  // 5. Add demo user cart items
  const headphones = await prisma.product.findFirst({ where: { slug: 'acousticpro-anc-wireless-headphones' } });
  const keyboard = await prisma.product.findFirst({ where: { slug: 'ergomechanical-custom-keyboard' } });
  const deskMat = await prisma.product.findFirst({ where: { slug: 'minimalist-matte-desk-mat' } });

  const userCart = await prisma.cart.findUnique({ where: { userId: demoUser.id } });
  if (userCart && headphones && keyboard && deskMat) {
    await prisma.cartItem.createMany({
      data: [
        { cartId: userCart.id, productId: headphones.id, quantity: 1 },
        { cartId: userCart.id, productId: keyboard.id, quantity: 1 },
        { cartId: userCart.id, productId: deskMat.id, quantity: 1 },
      ],
    });
    console.log('Populated demo cart with 3 items');
  }

  console.log('ShopVista database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
