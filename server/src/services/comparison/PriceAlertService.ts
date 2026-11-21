import { prisma } from '../../config/prisma';
import { NormalizedOffer } from './types';

export interface CreatePriceAlertDto {
  userId: string;
  groupKey: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  email?: string;
}

export interface AlertNotificationResult {
  alertId: string;
  userEmail: string;
  productName: string;
  targetPrice: number;
  triggeredPrice: number;
  marketplaceName: string;
  dealUrl: string;
  status: 'NOTIFICATION_SENT' | 'SKIPPED_DUPLICATE';
}

export class PriceAlertService {
  /**
   * Create or update a price alert
   */
  static async createAlert(data: CreatePriceAlertDto) {
    // Ensure ProductMatch exists
    const match = await prisma.productMatch.upsert({
      where: { groupKey: data.groupKey },
      update: { canonicalTitle: data.productName },
      create: {
        groupKey: data.groupKey,
        canonicalTitle: data.productName,
        brand: data.productName.split(' ')[0] || 'Generic',
        model: data.productName,
        category: 'Electronics',
        variant: 'Standard',
      },
    });

    const existing = await prisma.priceAlert.findFirst({
      where: {
        userId: data.userId,
        productMatchId: match.id,
      },
    });

    if (existing) {
      return prisma.priceAlert.update({
        where: { id: existing.id },
        data: {
          targetPrice: data.targetPrice,
          currentPrice: data.currentPrice,
          isActive: true,
          triggeredAt: null, // Reset trigger when target price is updated
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { email: true },
    });

    return prisma.priceAlert.create({
      data: {
        userId: data.userId,
        productMatchId: match.id,
        targetPrice: data.targetPrice,
        initialPrice: data.currentPrice,
        currentPrice: data.currentPrice,
        notificationEmail: data.email || user?.email || 'user@shopvista.com',
        isActive: true,
      },
    });
  }

  /**
   * Get all active alerts for a user
   */
  static async getUserAlerts(userId: string) {
    return prisma.priceAlert.findMany({
      where: { userId },
      include: {
        productMatch: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete a price alert
   */
  static async deleteAlert(id: string, userId: string) {
    return prisma.priceAlert.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }

  /**
   * Evaluates active alerts for a given product match group against fresh, verified offers.
   * Prevents duplicate notifications by inspecting triggeredAt and updating state atomically.
   */
  static async evaluateAlertsForGroup(
    groupKey: string,
    offers: NormalizedOffer[]
  ): Promise<AlertNotificationResult[]> {
    const verifiedInStockOffers = offers.filter((o) => o.inStock && o.finalPrice > 0);
    if (verifiedInStockOffers.length === 0) {
      return [];
    }

    // Find the ProductMatch
    const match = await prisma.productMatch.findUnique({
      where: { groupKey },
      include: {
        priceAlerts: {
          where: { isActive: true },
          include: { user: true },
        },
      },
    });

    if (!match || match.priceAlerts.length === 0) {
      return [];
    }

    // Identify lowest verified in-stock offer
    const lowestOffer = verifiedInStockOffers.reduce((prev, curr) =>
      curr.finalPrice < prev.finalPrice ? curr : prev
    );

    const lowestPrice = lowestOffer.finalPrice;
    const results: AlertNotificationResult[] = [];

    for (const alert of match.priceAlerts) {
      const targetPrice = Number(alert.targetPrice);

      // Check if price reached or dropped below target
      if (lowestPrice <= targetPrice) {
        // Prevent duplicate notification:
        // If alert was already triggered within the last 24 hours for the same or higher price, skip
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (alert.triggeredAt && alert.triggeredAt > oneDayAgo && Number(alert.currentPrice) <= lowestPrice) {
          results.push({
            alertId: alert.id,
            userEmail: alert.notificationEmail,
            productName: match.canonicalTitle,
            targetPrice,
            triggeredPrice: lowestPrice,
            marketplaceName: lowestOffer.marketplaceName,
            dealUrl: lowestOffer.productUrl,
            status: 'SKIPPED_DUPLICATE',
          });
          continue;
        }

        // Send Notification & Atomically Record Triggered State
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: {
            currentPrice: lowestPrice,
            triggeredAt: new Date(),
            // Keep active so user can track future drops, or can be set to inactive if one-shot
          },
        });

        // Log notification dispatch (In production: SMTP / SendGrid / Amazon SES dispatch)
        console.log(
          `[PriceAlertService] NOTIFICATION DISPATCHED: "${match.canonicalTitle}" reached ₹${lowestPrice} on ${lowestOffer.marketplaceName} (Target: ₹${targetPrice}) -> Sent to ${alert.notificationEmail}`
        );

        results.push({
          alertId: alert.id,
          userEmail: alert.notificationEmail,
          productName: match.canonicalTitle,
          targetPrice,
          triggeredPrice: lowestPrice,
          marketplaceName: lowestOffer.marketplaceName,
          dealUrl: lowestOffer.productUrl,
          status: 'NOTIFICATION_SENT',
        });
      } else {
        // Update current price record without triggering alert
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: { currentPrice: lowestPrice },
        });
      }
    }

    return results;
  }
}
