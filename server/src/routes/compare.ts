import { Router } from 'express';
import {
  searchCompare,
  getGroupDetails,
  getPriceHistory,
  getMarketplaces,
  createPriceAlert,
  getUserPriceAlerts,
  deletePriceAlert,
} from '../controllers/compare.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public comparison endpoints
router.get('/search', searchCompare);
router.get('/marketplaces', getMarketplaces);
router.get('/product/:groupKey', getGroupDetails);
router.get('/price-history/:groupKey', getPriceHistory);

// Protected price alert endpoints
router.post('/alerts', authenticate, createPriceAlert);
router.get('/alerts', authenticate, getUserPriceAlerts);
router.delete('/alerts/:id', authenticate, deletePriceAlert);

export default router;
