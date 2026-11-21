import { Request, Response } from 'express';
import { PriceComparisonEngine } from '../services/comparison/PriceComparisonEngine';
import { PriceAlertService } from '../services/comparison/PriceAlertService';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

const compareEngine = new PriceComparisonEngine();

export const searchCompare = async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    const sortBy = (req.query.sortBy as any) || 'lowest_price';
    const marketplace = req.query.marketplace as string | undefined;
    const inStockOnly = req.query.inStock === 'true';
    const condition = req.query.condition as string | undefined;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;

    if (!q.trim()) {
      return sendSuccess(res, {
        query: '',
        totalGroups: 0,
        groups: [],
        providersSearched: 5,
        providersSucceeded: 5,
      });
    }

    const results = await compareEngine.searchAndCompare({
      query: q,
      sortBy,
      filterMarketplace: marketplace,
      filterInStockOnly: inStockOnly,
      filterCondition: condition,
      minPrice,
      maxPrice,
    });

    return sendSuccess(res, results, 'Price comparison search completed successfully');
  } catch (error: any) {
    console.error('searchCompare error:', error);
    return sendError(res, error.message || 'Failed to perform price comparison search', 500);
  }
};

export const getGroupDetails = async (req: Request, res: Response) => {
  try {
    const groupKey = req.params.groupKey as string;
    const group = await compareEngine.getGroupByGroupKey(groupKey);

    if (!group) {
      return sendError(res, 'Comparison group not found', 404);
    }

    return sendSuccess(res, group, 'Group details retrieved');
  } catch (error: any) {
    console.error('getGroupDetails error:', error);
    return sendError(res, 'Failed to fetch comparison group details', 500);
  }
};

export const getPriceHistory = async (req: Request, res: Response) => {
  try {
    const groupKey = req.params.groupKey as string;
    const data = await compareEngine.getPriceHistory(groupKey);
    return sendSuccess(res, data, 'Price history and statistics retrieved');
  } catch (error: any) {
    console.error('getPriceHistory error:', error);
    return sendError(res, 'Failed to fetch price history', 500);
  }
};

export const getMarketplaces = async (_req: Request, res: Response) => {
  try {
    const health = await compareEngine.getProvidersHealth();
    return sendSuccess(res, health, 'Marketplaces status retrieved');
  } catch (error: any) {
    console.error('getMarketplaces error:', error);
    return sendError(res, 'Failed to fetch marketplaces', 500);
  }
};

export const createPriceAlert = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'You must be logged in to set price alerts', 401);
    }

    const { groupKey, productName, targetPrice, currentPrice } = req.body;

    if (!targetPrice || targetPrice <= 0) {
      return sendError(res, 'Valid target price is required', 400);
    }

    const alert = await PriceAlertService.createAlert({
      userId: req.user.id,
      groupKey: groupKey || 'product-alert',
      productName: productName || 'Target Product',
      targetPrice: Number(targetPrice),
      currentPrice: Number(currentPrice || targetPrice),
      email: req.user.email,
    });

    return sendSuccess(res, alert, 'Price drop alert created successfully! We will email you when price drops.');
  } catch (error: any) {
    console.error('createPriceAlert error:', error);
    return sendError(res, 'Failed to create price alert', 500);
  }
};

export const getUserPriceAlerts = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const alerts = await PriceAlertService.getUserAlerts(req.user.id);
    return sendSuccess(res, alerts, 'Price alerts retrieved');
  } catch (error: any) {
    console.error('getUserPriceAlerts error:', error);
    return sendError(res, 'Failed to fetch price alerts', 500);
  }
};

export const deletePriceAlert = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const id = req.params.id as string;
    await PriceAlertService.deleteAlert(id, req.user.id);
    return sendSuccess(res, { deleted: true }, 'Price alert removed');
  } catch (error: any) {
    console.error('deletePriceAlert error:', error);
    return sendError(res, 'Failed to delete price alert', 500);
  }
};
