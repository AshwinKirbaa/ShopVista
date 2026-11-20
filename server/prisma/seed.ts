import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding brewns® specialty coffee database...');

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
      name: process.env.ADMIN_NAME || 'brewns Head Barista',
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
          addressLine1: '139 Coffee Street, SoMa',
          city: 'San Francisco',
          state: 'California',
          postalCode: '94103',
          country: 'United States',
          isDefault: true,
        },
      },
    },
  });
  console.log(`Created demo user: ${demoUser.email}`);

  // 3. Create Categories for brewns
  const categoriesData = [
    {
      name: 'Hot Brews & Espresso',
      slug: 'hot-brews-espresso',
      description: 'Single-origin double shots, silky flat whites, and slow-pour artisan coffees.',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Iced & Cold Specialty',
      slug: 'iced-cold-specialty',
      description: 'Slow-steeped cold brews, iced house lattes, and ceremonial grade Japanese matcha.',
      image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Artisan Bakery',
      slug: 'artisan-bakery',
      description: 'Fresh morning brioche, spiced cinnamon rolls, and flaky twice-baked pastries.',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Single Origin Whole Beans',
      slug: 'single-origin-beans',
      description: 'Ethically sourced, sustainably roasted whole coffee beans with rich cupping notes.',
      image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Brewing Gear & Objects',
      slug: 'brewing-gear',
      description: 'Minimalist tumblers, precision drippers, and barista accessories for home rituals.',
      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryMap.set(cat.slug, created.id);
  }
  console.log(`Created ${categoriesData.length} categories`);

  // 4. Create brewns Products
  const productsData = [
    // Hot Brews & Espresso
    {
      name: 'Single Origin Espresso',
      slug: 'single-origin-espresso',
      description: 'A concentrated double shot extracted under 9 bars of pressure. Vibrant notes of dark cacao nibs, candied orange peel, and velvety crema finish.',
      price: new Prisma.Decimal('210.00'), // ~ $2.50
      comparePrice: new Prisma.Decimal('250.00'),
      stock: 50,
      sku: 'BRW-HOT-001',
      categoryId: categoryMap.get('hot-brews-espresso')!,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['espresso', 'single-origin', 'best-seller', 'hot'],
    },
    {
      name: 'House Latte (250 ML)',
      slug: 'house-latte',
      description: 'Our iconic house beverage. Double shot of slow-roasted espresso harmonized with textured silky whole milk or organic oat milk.',
      price: new Prisma.Decimal('349.00'), // ~ $4.20
      comparePrice: new Prisma.Decimal('399.00'),
      stock: 45,
      sku: 'BRW-HOT-002',
      categoryId: categoryMap.get('hot-brews-espresso')!,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['latte', 'house-specialty', 'signature', 'hot'],
    },
    {
      name: 'Cortado 1:1',
      slug: 'cortado-one-to-one',
      description: 'Equal parts bold espresso and gently steamed microfoam milk to cut the acidity without masking the rich origin flavors.',
      price: new Prisma.Decimal('280.00'),
      comparePrice: new Prisma.Decimal('320.00'),
      stock: 35,
      sku: 'BRW-HOT-003',
      categoryId: categoryMap.get('hot-brews-espresso')!,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1534778101976-62847782c213?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['cortado', 'classic', 'hot'],
    },
    {
      name: 'Silky Flat White',
      slug: 'silky-flat-white',
      description: 'Two pure ristretto shots crowned with a velvety layer of steamed milk with microbubbles throughout the cup.',
      price: new Prisma.Decimal('320.00'),
      comparePrice: new Prisma.Decimal('360.00'),
      stock: 40,
      sku: 'BRW-HOT-004',
      categoryId: categoryMap.get('hot-brews-espresso')!,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['flat-white', 'ristretto', 'hot'],
    },

    // Iced & Cold Specialty
    {
      name: 'Iced Ceremonial Matcha Latte',
      slug: 'iced-ceremonial-matcha-latte',
      description: 'First-harvest Uji ceremonial matcha hand-whisked to order, layered delicately over chilled organic oat milk and ice.',
      price: new Prisma.Decimal('375.00'), // ~ $4.50
      comparePrice: new Prisma.Decimal('420.00'),
      stock: 30,
      sku: 'BRW-COLD-001',
      categoryId: categoryMap.get('iced-cold-specialty')!,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['matcha', 'iced', 'best-seller', 'ceremonial'],
    },
    {
      name: 'Cold Brew Reserve (24-Hour)',
      slug: 'cold-brew-reserve',
      description: 'Steeped for 24 hours in ice-cold filtered spring water. Incredibly smooth, low in acid, bursting with cocoa and caramel nuances.',
      price: new Prisma.Decimal('350.00'),
      comparePrice: new Prisma.Decimal('390.00'),
      stock: 35,
      sku: 'BRW-COLD-002',
      categoryId: categoryMap.get('iced-cold-specialty')!,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['cold-brew', 'refreshing', 'iced', 'signature'],
    },
    {
      name: 'Iced Tonic Espresso',
      slug: 'iced-tonic-espresso',
      description: 'Crisp artisanal botanical tonic poured over cracked ice, topped with a floating double shot of fruity single origin espresso and citrus twist.',
      price: new Prisma.Decimal('340.00'),
      comparePrice: new Prisma.Decimal('380.00'),
      stock: 25,
      sku: 'BRW-COLD-003',
      categoryId: categoryMap.get('iced-cold-specialty')!,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['tonic', 'sparkling', 'iced', 'modern'],
    },

    // Artisan Bakery
    {
      name: 'Artisan Cinnamon Roll',
      slug: 'artisan-cinnamon-roll',
      description: 'Slow-proved brioche pastry rolled with Indonesian cinnamon, Muscovado brown sugar, and finished with a delicate Madagascar vanilla glaze.',
      price: new Prisma.Decimal('315.00'), // ~ $3.80
      comparePrice: new Prisma.Decimal('350.00'),
      stock: 25,
      sku: 'BRW-BAKE-001',
      categoryId: categoryMap.get('artisan-bakery')!,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['bakery', 'cinnamon-roll', 'fresh-daily', 'pastry'],
    },
    {
      name: 'Twice-Baked Almond Croissant',
      slug: 'twice-baked-almond-croissant',
      description: 'Flaky pure butter croissant filled with rich almond frangipane cream and encrusted with toasted sliced almonds.',
      price: new Prisma.Decimal('290.00'),
      comparePrice: new Prisma.Decimal('330.00'),
      stock: 20,
      sku: 'BRW-BAKE-002',
      categoryId: categoryMap.get('artisan-bakery')!,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['croissant', 'bakery', 'french-pastry'],
    },
    {
      name: 'Matcha Basque Burnt Cheesecake',
      slug: 'matcha-basque-cheesecake',
      description: 'Caramelized burnt exterior with an ultra-creamy, molten interior infused with premium Uji matcha powder.',
      price: new Prisma.Decimal('380.00'),
      comparePrice: new Prisma.Decimal('420.00'),
      stock: 18,
      sku: 'BRW-BAKE-003',
      categoryId: categoryMap.get('artisan-bakery')!,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['cheesecake', 'matcha', 'dessert'],
    },

    // Single Origin Whole Beans
    {
      name: 'Slow Roast House Blend (250g)',
      slug: 'slow-roast-house-blend',
      description: 'Our flagship roaster blend. Medium roast featuring cupping notes of salted caramel, brown sugar, roasted almond, and sweet chocolate finish.',
      price: new Prisma.Decimal('790.00'),
      comparePrice: new Prisma.Decimal('890.00'),
      stock: 60,
      sku: 'BRW-BEAN-001',
      categoryId: categoryMap.get('single-origin-beans')!,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['whole-bean', 'slow-roast', 'signature', 'caramel'],
    },
    {
      name: 'Ethiopia Yirgacheffe Washed (250g)',
      slug: 'ethiopia-yirgacheffe-beans',
      description: 'Heirloom varietal grown at 2,000m altitude. Incredibly tea-like body with floral jasmine aroma, bergamot, and ripe yellow peach notes.',
      price: new Prisma.Decimal('890.00'),
      comparePrice: new Prisma.Decimal('990.00'),
      stock: 35,
      sku: 'BRW-BEAN-002',
      categoryId: categoryMap.get('single-origin-beans')!,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['ethiopia', 'single-origin', 'floral', 'whole-bean'],
    },
    {
      name: 'Colombia Pink Bourbon Reserve (250g)',
      slug: 'colombia-pink-bourbon-beans',
      description: 'Rare Pink Bourbon micro-lot. Thermal shock anaerobic processing reveals notes of pink guava, candied lime, and honey blossom.',
      price: new Prisma.Decimal('980.00'),
      comparePrice: new Prisma.Decimal('1100.00'),
      stock: 25,
      sku: 'BRW-BEAN-003',
      categoryId: categoryMap.get('single-origin-beans')!,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['colombia', 'anaerobic', 'rare-microlot'],
    },

    // Gear & Merchandise
    {
      name: 'brewns® Matte Ceramic Tumbler',
      slug: 'brewns-matte-ceramic-tumbler',
      description: 'Double-walled insulated ceramic commuter tumbler (350ml). Keeps your espresso hot for 6 hours while maintaining pure flavor integrity.',
      price: new Prisma.Decimal('1250.00'),
      comparePrice: new Prisma.Decimal('1499.00'),
      stock: 40,
      sku: 'BRW-GEAR-001',
      categoryId: categoryMap.get('brewing-gear')!,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['merch', 'tumbler', 'ceramic', 'brewns-gear'],
    },
    {
      name: 'Precision Matte Black V60 Dripper',
      slug: 'precision-matte-black-v60',
      description: 'Ceramic 02 pour-over dripper with interior spiral ribs to optimize water flow and maximize extraction balance.',
      price: new Prisma.Decimal('1100.00'),
      comparePrice: new Prisma.Decimal('1300.00'),
      stock: 30,
      sku: 'BRW-GEAR-002',
      categoryId: categoryMap.get('brewing-gear')!,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['v60', 'pour-over', 'equipment'],
    },
  ];

  for (const prod of productsData) {
    const { tags, ...prodData } = prod as any;
    const created = await prisma.product.create({
      data: {
        ...prodData,
        isActive: true,
        rating: new Prisma.Decimal('4.9'),
        reviewCount: 2,
      },
    });

    // Add high quality reviews
    await prisma.review.createMany({
      data: [
        {
          productId: created.id,
          userId: demoUser.id,
          rating: 5,
          comment: 'Outstanding depth of flavor and immaculate roasting. Easily the best coffee house experience.',
        },
        {
          productId: created.id,
          userId: admin.id,
          rating: 5,
          comment: 'Crafted with absolute precision. Essential for any serious coffee connoisseur.',
        },
      ],
    });
  }

  console.log(`Created ${productsData.length} brewns® products with reviews.`);

  // 5. Add demo user cart items
  const latte = await prisma.product.findFirst({ where: { slug: 'house-latte' } });
  const matcha = await prisma.product.findFirst({ where: { slug: 'iced-ceremonial-matcha-latte' } });
  const cinnamon = await prisma.product.findFirst({ where: { slug: 'artisan-cinnamon-roll' } });

  const userCart = await prisma.cart.findUnique({ where: { userId: demoUser.id } });
  if (userCart && latte && matcha && cinnamon) {
    await prisma.cartItem.createMany({
      data: [
        { cartId: userCart.id, productId: latte.id, quantity: 2 },
        { cartId: userCart.id, productId: matcha.id, quantity: 1 },
        { cartId: userCart.id, productId: cinnamon.id, quantity: 1 },
      ],
    });
    console.log('Populated demo cart with 4 items');
  }

  console.log('brewns® seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
