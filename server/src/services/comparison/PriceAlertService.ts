import { prisma } from '../../config/prisma';

export interface CreatePriceAlertDto {
  userId: string;
  groupKey: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  email?: string;
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
}
