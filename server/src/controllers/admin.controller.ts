import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      totalCustomers,
      totalProducts,
      lowStockProductsCount,
      paidPayments,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { stock: { lte: 10 }, isActive: true } }),
      prisma.payment.findMany({
        where: { status: 'PAID' },
        select: { amount: true },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          payment: { select: { status: true, method: true } },
        },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 10 }, isActive: true },
        take: 5,
        orderBy: { stock: 'asc' },
        select: { id: true, name: true, sku: true, stock: true, price: true },
      }),
    ]);

    const totalRevenue = paidPayments.reduce(
      (sum, p) => sum + p.amount.toNumber(),
      0
    );

    const formattedRecentOrders = recentOrders.map((o) => ({
      ...o,
      subtotal: o.subtotal.toNumber(),
      total: o.total.toNumber(),
    }));

    const formattedLowStock = lowStockProducts.map((p) => ({
      ...p,
      price: p.price.toNumber(),
    }));

    return sendSuccess(res, {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      lowStockCount: lowStockProductsCount,
      recentOrders: formattedRecentOrders,
      lowStockProducts: formattedLowStock,
    });
  } catch (error: any) {
    console.error('getDashboardStats error:', error);
    return sendError(res, 'Failed to fetch admin dashboard statistics', 500);
  }
};

export const getAdminOrders = async (req: Request, res: Response) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query as any;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { orderNumber: { contains: String(search), mode: 'insensitive' } },
          { shippingName: { contains: String(search), mode: 'insensitive' } },
          { user: { email: { contains: String(search), mode: 'insensitive' } } },
        ],
      }),
    };

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: true,
          payment: { select: { status: true, method: true, razorpayPaymentId: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    const formatted = orders.map((o) => ({
      ...o,
      total: o.total.toNumber(),
      subtotal: o.subtotal.toNumber(),
      items: o.items.map((i) => ({ ...i, price: i.price.toNumber() })),
    }));

    return sendSuccess(res, formatted, undefined, 200, {
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (error: any) {
    console.error('getAdminOrders error:', error);
    return sendError(res, 'Failed to fetch orders', 500);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, note } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id },
          data: { status },
        });

        for (const item of order.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status,
            note: note || 'Status updated by administrator',
            changedBy: req.user?.email || 'Admin',
          },
        });
      });
    } else {
      await prisma.$transaction([
        prisma.order.update({
          where: { id },
          data: { status },
        }),
        prisma.orderStatusHistory.create({
          data: {
            orderId: id,
            status,
            note: note || `Status updated to ${status}`,
            changedBy: req.user?.email || 'Admin',
          },
        }),
      ]);
    }

    return sendSuccess(res, null, `Order status updated to ${status}`);
  } catch (error: any) {
    console.error('updateOrderStatus error:', error);
    return sendError(res, 'Failed to update order status', 500);
  }
};

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 10 } = req.query as any;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {
      role: 'USER',
      ...(search && {
        OR: [
          { name: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } },
        ],
      }),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          _count: { select: { orders: true } },
          orders: {
            where: { payment: { status: 'PAID' } },
            select: { total: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    const formatted = users.map((u) => {
      const totalSpent = u.orders.reduce((acc, curr) => acc + curr.total.toNumber(), 0);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        createdAt: u.createdAt,
        orderCount: u._count.orders,
        totalSpent,
      };
    });

    return sendSuccess(res, formatted, undefined, 200, {
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (error: any) {
    console.error('getCustomers error:', error);
    return sendError(res, 'Failed to fetch customers', 500);
  }
};

export const getCustomerDetail = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: true,
        orders: {
          include: {
            payment: { select: { status: true, method: true } },
            items: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return sendError(res, 'Customer not found', 404);
    }

    const formattedOrders = user.orders.map((o) => ({
      ...o,
      total: o.total.toNumber(),
      items: o.items.map((i) => ({ ...i, price: i.price.toNumber() })),
    }));

    return sendSuccess(res, {
      ...user,
      orders: formattedOrders,
    });
  } catch (error: any) {
    console.error('getCustomerDetail error:', error);
    return sendError(res, 'Failed to fetch customer details', 500);
  }
};
