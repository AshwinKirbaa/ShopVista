import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { page = 1, limit = 10 } = req.query as any;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [total, orders] = await Promise.all([
      prisma.order.count({ where: { userId: req.user.id } }),
      prisma.order.findMany({
        where: { userId: req.user.id },
        include: {
          items: true,
          payment: {
            select: {
              status: true,
              method: true,
              paidAt: true,
              razorpayPaymentId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    const formatted = orders.map((o) => ({
      ...o,
      subtotal: o.subtotal.toNumber(),
      discount: o.discount.toNumber(),
      shippingCharge: o.shippingCharge.toNumber(),
      total: o.total.toNumber(),
      items: o.items.map((i) => ({
        ...i,
        price: i.price.toNumber(),
      })),
    }));

    return sendSuccess(res, formatted, undefined, 200, {
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (error: any) {
    console.error('getOrders error:', error);
    return sendError(res, 'Failed to fetch orders', 500);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const id = String(req.params.id);

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
        ...(req.user.role !== 'ADMIN' ? { userId: req.user.id } : {}),
      },
      include: {
        items: true,
        payment: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    const formatted = {
      ...order,
      subtotal: order.subtotal.toNumber(),
      discount: order.discount.toNumber(),
      shippingCharge: order.shippingCharge.toNumber(),
      total: order.total.toNumber(),
      items: order.items.map((i) => ({
        ...i,
        price: i.price.toNumber(),
      })),
      payment: order.payment
        ? {
            ...order.payment,
            amount: order.payment.amount.toNumber(),
          }
        : null,
    };

    return sendSuccess(res, formatted);
  } catch (error: any) {
    console.error('getOrderById error:', error);
    return sendError(res, 'Failed to fetch order', 500);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const id = String(req.params.id);
    const { reason } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        id,
        ...(req.user.role !== 'ADMIN' ? { userId: req.user.id } : {}),
      },
      include: { items: true },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      return sendError(
        res,
        `Cannot cancel an order that is already ${order.status.toLowerCase()}`,
        400
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
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
          orderId: order.id,
          status: 'CANCELLED',
          note: reason || 'Cancelled by customer',
          changedBy: req.user?.email || 'User',
        },
      });
    });

    return sendSuccess(res, null, 'Order cancelled successfully and stock restored');
  } catch (error: any) {
    console.error('cancelOrder error:', error);
    return sendError(res, 'Failed to cancel order', 500);
  }
};
