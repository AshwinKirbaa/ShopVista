import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                comparePrice: true,
                images: true,
                stock: true,
                isActive: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: { items: { include: { product: true } } },
      });
    }

    let subtotal = 0;
    const formattedItems = cart.items.map((item) => {
      const price = item.product.price.toNumber();
      const comparePrice = item.product.comparePrice
        ? item.product.comparePrice.toNumber()
        : null;
      const lineTotal = price * item.quantity;
      subtotal += lineTotal;

      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          ...item.product,
          price,
          comparePrice,
        },
        lineTotal,
      };
    });

    const shippingCharge = subtotal > 500 || subtotal === 0 ? 0 : 40;
    const total = subtotal + shippingCharge;

    return sendSuccess(res, {
      id: cart.id,
      items: formattedItems,
      itemCount: formattedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      subtotal,
      shippingCharge,
      total,
    });
  } catch (error: any) {
    console.error('getCart error:', error);
    return sendError(res, 'Failed to fetch cart', 500);
  }
};

export const addItemToCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { productId, quantity } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return sendError(res, 'Product not found or inactive', 404);
    }

    if (product.stock < quantity) {
      return sendError(
        res,
        `Cannot add ${quantity} items. Only ${product.stock} left in stock.`,
        400
      );
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
      });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return sendError(
          res,
          `Cannot add more. You have ${existingItem.quantity} in cart and available stock is ${product.stock}.`,
          400
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return getCart(req, res);
  } catch (error: any) {
    console.error('addItemToCart error:', error);
    return sendError(res, 'Failed to add item to cart', 500);
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const id = String(req.params.id);
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem || cartItem.cart.userId !== req.user.id) {
      return sendError(res, 'Cart item not found', 404);
    }

    if (quantity > cartItem.product.stock) {
      return sendError(
        res,
        `Requested quantity exceeds available stock (${cartItem.product.stock})`,
        400
      );
    }

    await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    return getCart(req, res);
  } catch (error: any) {
    console.error('updateCartItem error:', error);
    return sendError(res, 'Failed to update cart item', 500);
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const id = String(req.params.id);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== req.user.id) {
      return sendError(res, 'Cart item not found', 404);
    }

    await prisma.cartItem.delete({ where: { id } });

    return getCart(req, res);
  } catch (error: any) {
    console.error('removeCartItem error:', error);
    return sendError(res, 'Failed to remove item from cart', 500);
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return sendSuccess(res, null, 'Cart cleared successfully');
  } catch (error: any) {
    console.error('clearCart error:', error);
    return sendError(res, 'Failed to clear cart', 500);
  }
};
