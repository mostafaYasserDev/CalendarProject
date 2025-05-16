import express from 'express';
import {
  getSpecialDays,
  createSpecialDay,
  updateSpecialDay,
  deleteSpecialDay
} from '../controllers/specialDayController.js';
import { protect } from '../middleware/authMiddleware.js';
import { cacheMiddleware, clearCache } from '../middleware/cache.js';

const router = express.Router();

// Cache special days list for 5 minutes (300 seconds)
router.route('/')
  .get(cacheMiddleware(300), getSpecialDays)
  .post(protect, async (req, res, next) => {
    await clearCache('*/api/special-days*');
    next();
  }, createSpecialDay);

router.route('/:id')
  .put(protect, async (req, res, next) => {
    await clearCache('*/api/special-days*');
    next();
  }, updateSpecialDay)
  .delete(protect, async (req, res, next) => {
    await clearCache('*/api/special-days*');
    next();
  }, deleteSpecialDay);

export default router; 