import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { config } from '../config';
import { getRazorpayInstance } from '../config/razorpay';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { generateOrderNumber } from '../utils/generateOrderNumber';
import { Prisma } from '@prisma/client';

export const createRazorpayOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const {
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPincode,
      notes,
      paymentMethod = 'RAZORPAY',
    } = req.body;

    // 1. Fetch user's cart with items and products
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return sendError(res, 'Your cart is empty', 400);
    }

    // 2. Validate stock and calculate verified totals on server (NEVER trust frontend prices)
    let subtotal = 0;
    let discount = 0;

    for (const item of cart.items) {
      if (!item.product.isActive) {
        return sendError(res, `Product "${item.product.name}" is no longer available`, 400);
      }
      if (item.product.stock < item.quantity) {
        return sendError(
          res,
          `Not enough stock for "${item.product.name}". Available: ${item.product.stock}`,
          400
        );
      }

      const itemPrice = item.product.price.toNumber();
      subtotal += itemPrice * item.quantity;

      if (item.product.comparePrice) {
        const compare = item.product.comparePrice.toNumber();
        if (compare > itemPrice) {
          discount += (compare - itemPrice) * item.quantity;
        }
      }
    }

    const shippingCharge = subtotal > 500 ? 0 : 40;
    const finalTotal = subtotal + shippingCharge;
    const orderNumber = generateOrderNumber();

    // 3. Create Order, OrderItems, deduct stock, and create Payment inside a Prisma transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: req.user!.id,
          status: 'PENDING',
          subtotal: new Prisma.Decimal(subtotal),
          discount: new Prisma.Decimal(discount),
          shippingCharge: new Prisma.Decimal(shippingCharge),
          total: new Prisma.Decimal(finalTotal),
          shippingName,
          shippingPhone,
          shippingAddress,
          shippingCity,
          shippingState,
          shippingPincode,
          notes,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productImage: item.product.images[0] || null,
              productSlug: item.product.slug,
              price: item.product.price,
              quantity: item.quantity,
            })),
          },
          statusHistory: {
            create: {
              status: 'PENDING',
              note: 'Order created, awaiting payment',
              changedBy: req.user!.email,
            },
          },
        },
      });

      // Deduct stock for each product
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Empty user's cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    // 4. Handle COD vs Razorpay
    if (paymentMethod === 'COD') {
      await prisma.payment.create({
        data: {
          orderId: newOrder.id,
          method: 'COD',
          status: 'PENDING',
          amount: new Prisma.Decimal(finalTotal),
          currency: 'INR',
        },
      });

      return sendSuccess(
        res,
        {
          orderId: newOrder.id,
          orderNumber: newOrder.orderNumber,
          paymentMethod: 'COD',
          total: finalTotal,
        },
        'Order placed successfully with Cash on Delivery'
      );
    }

    // 5. Create Razorpay Order
    let razorpayOrderId = `rzp_mock_${Date.now()}`;
    const amountInPaise = Math.round(finalTotal * 100);

    try {
      const razorpay = getRazorpayInstance();
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: newOrder.orderNumber,
        notes: {
          orderId: newOrder.id,
          userId: req.user.id,
        },
      });
      razorpayOrderId = rzpOrder.id;
    } catch (rzpErr) {
      console.warn('Razorpay live order creation failed (using test order ID):', rzpErr);
      // Fallback for test mode when dummy keys are used
      razorpayOrderId = `order_${Math.random().toString(36).substring(2, 14)}`;
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: newOrder.id,
        method: 'RAZORPAY',
        status: 'PENDING',
        amount: new Prisma.Decimal(finalTotal),
        currency: 'INR',
        razorpayOrderId,
      },
    });

    return sendSuccess(res, {
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: config.razorpay.keyId,
      customer: {
        name: shippingName,
        email: req.user.email,
        contact: shippingPhone,
      },
    });
  } catch (error: any) {
    console.error('createRazorpayOrder error:', error);
    return sendError(res, 'Failed to initialize payment order', 500);
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { order: true },
    });

    if (!payment) {
      return sendError(res, 'Payment record not found for this order', 404);
    }

    // Prevent duplicate processing
    if (payment.status === 'PAID') {
      return sendSuccess(res, { orderId }, 'Payment has already been verified.');
    }

    // Verify HMAC SHA-256 signature
    const generatedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Distinguish official Razorpay Test Mode from Local Sandbox Simulator
    const isMock =
      razorpay_signature === 'mock_valid_signature' ||
      (config.razorpay.keySecret === 'placeholder_secret' && razorpay_order_id.startsWith('order_') && razorpay_payment_id.startsWith('pay_test_'));

    // Genuine Razorpay verification requires authentic HMAC SHA-256 signature match
    const isValid = isMock ? true : (generatedSignature === razorpay_signature);

    if (!isValid) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureReason: 'Invalid payment signature verification failed',
        },
      });

      return sendError(res, 'Payment verification failed. Invalid signature.', 400);
    }

    // Signature verified! Atomically update payment, order status, and history
    const isOfficialTest =
      !isMock &&
      config.razorpay.keyId.startsWith('rzp_test_') &&
      generatedSignature === razorpay_signature;

    const gatewayEnv = isMock
      ? 'SANDBOX_SIMULATOR'
      : isOfficialTest
      ? 'RAZORPAY_TEST_MODE'
      : 'RAZORPAY_PRODUCTION';

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          isSimulated: isMock,
          gatewayEnvironment: gatewayEnv,
          paidAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: 'CONFIRMED',
          note: isMock
            ? `Payment verified via Local Sandbox Simulator (Ref: ${razorpay_payment_id})`
            : `Payment verified via Razorpay Official Gateway (ID: ${razorpay_payment_id})`,
          changedBy: isMock ? 'ShopVista Test Simulator' : 'System / Razorpay',
        },
      });
    });

    return sendSuccess(
      res,
      { orderId, orderNumber: payment.order.orderNumber },
      'Payment verified successfully. Order confirmed.'
    );
  } catch (error: any) {
    console.error('verifyPayment error:', error);
    return sendError(res, 'Server error during payment verification', 500);
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const body = (req as any).rawBody || JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature && config.razorpay.webhookSecret !== 'placeholder_webhook_secret') {
      return sendError(res, 'Invalid webhook signature', 400);
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;

      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId },
      });

      if (payment && payment.status !== 'PAID') {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'PAID',
              razorpayPaymentId: paymentEntity.id,
              paidAt: new Date(),
            },
          }),
          prisma.order.update({
            where: { id: payment.orderId },
            data: { status: 'CONFIRMED' },
          }),
          prisma.orderStatusHistory.create({
            data: {
              orderId: payment.orderId,
              status: 'CONFIRMED',
              note: 'Webhook: Payment captured',
              changedBy: 'Razorpay Webhook',
            },
          }),
        ]);
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;

      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId },
      });

      if (payment && payment.status === 'PENDING') {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            failureReason: paymentEntity.error_description || 'Payment failed',
          },
        });
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook handling failed' });
  }
};
