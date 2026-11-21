import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ShopVista with LIVE Flipkart Products...');

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

  console.log('Cleaned old mock records');

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

  // 3. Load Scraped Live Products
  const catalogPath = path.join(__dirname, 'live_flipkart_catalog.json');
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Catalog file not found at: ${catalogPath}`);
  }
  const rawData = fs.readFileSync(catalogPath, 'utf-8');
  const liveItems: Array<{
    id: string;
    title: string;
    mrp: number;
    sellingPrice: number;
    imageUrl: string;
    url: string;
    rating: number;
    inStock: boolean;
    categorySlug: string;
    categoryName: string;
    categoryDesc: string;
    categoryImg: string;
  }> = JSON.parse(rawData);

  // 4. Create Categories
  const categoryMap = new Map<string, string>();
  const uniqueCategories = new Map<string, { name: string; desc: string; img: string }>();

  for (const item of liveItems) {
    if (!uniqueCategories.has(item.categorySlug)) {
      uniqueCategories.set(item.categorySlug, {
        name: item.categoryName,
        desc: item.categoryDesc,
        img: item.categoryImg,
      });
    }
  }

  for (const [slug, meta] of uniqueCategories.entries()) {
    const createdCat = await prisma.category.create({
      data: {
        slug,
        name: meta.name,
        description: meta.desc,
        image: meta.img,
      },
    });
    categoryMap.set(slug, createdCat.id);
  }
  console.log(`Created ${categoryMap.size} authentic product categories`);

  // 5. Insert Live Products into PostgreSQL Product table
  const createdProducts: any[] = [];
  for (let i = 0; i < liveItems.length; i++) {
    const it = liveItems[i];
    const catId = categoryMap.get(it.categorySlug);
    if (!catId) continue;

    // Create a clean URL-friendly slug
    const cleanSlug = it.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 80) + `-${it.id.slice(-6).toLowerCase()}`;

    const prod = await prisma.product.create({
      data: {
        name: it.title,
        slug: cleanSlug,
        description: `Authentic ${it.title} sourced directly with live pricing of ₹${it.sellingPrice.toLocaleString('en-IN')}. Features genuine factory specifications, manufacturer warranty, and verified listing on Flipkart India (${it.url}).`,
        price: new Prisma.Decimal(it.sellingPrice.toString()),
        comparePrice: new Prisma.Decimal(it.mrp.toString()),
        sku: `LIVE-FK-${it.id}`,
        stock: Math.floor(Math.random() * 30) + 15,
        images: [it.imageUrl],
        categoryId: catId,
        isFeatured: i % 3 === 0,
        rating: new Prisma.Decimal(it.rating.toFixed(1)),
        reviewCount: Math.floor(Math.random() * 400) + 60,
        isActive: true,
      },
    });

    createdProducts.push(prod);

    // Add verified reviews
    await prisma.review.createMany({
      data: [
        {
          productId: prod.id,
          userId: demoUser.id,
          rating: Math.min(5, Math.max(4, Math.round(it.rating))),
          comment: `Genuine ${it.title}. Delivered fast, pristine original packaging and stellar performance. Highly recommended!`,
        },
        {
          productId: prod.id,
          userId: admin.id,
          rating: 5,
          comment: 'Verified genuine product. Verified price against Flipkart live catalog.',
        },
      ],
    });
  }

  console.log(`Successfully populated ShopVista with ${createdProducts.length} authentic live products!`);

  // 6. Populate demo cart with 2 live items
  const userCart = await prisma.cart.findUnique({ where: { userId: demoUser.id } });
  if (userCart && createdProducts.length >= 2) {
    await prisma.cartItem.createMany({
      data: [
        { cartId: userCart.id, productId: createdProducts[0].id, quantity: 1 },
        { cartId: userCart.id, productId: createdProducts[1].id, quantity: 1 },
      ],
    });
    console.log(`Populated demo cart with: ${createdProducts[0].name} & ${createdProducts[1].name}`);
  }

  console.log('ShopVista database live seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
