import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { cacheMiddleware, clearCache } from '../middleware/cache.js';

const router = express.Router();

// Public route for getting tasks
router.route('/')
  .get(cacheMiddleware(120), getTasks)
  .post(protect, async (req, res, next) => {
    // Only clear the main tasks list cache
    await clearCache('/api/tasks');
    next();
  }, createTask);

router.route('/:id')
  .put(protect, async (req, res, next) => {
    // Clear both the main list and the specific task cache
    await Promise.all([
      clearCache('/api/tasks'),
      clearCache(`/api/tasks/${req.params.id}`)
    ]);
    next();
  }, updateTask)
  .delete(protect, async (req, res, next) => {
    // Clear both the main list and the specific task cache
    await Promise.all([
      clearCache('/api/tasks'),
      clearCache(`/api/tasks/${req.params.id}`)
    ]);
    next();
  }, deleteTask);

export default router; 