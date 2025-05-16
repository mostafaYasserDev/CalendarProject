import express from 'express';
import {
  login,
  register,
  getProfile,
  updateUser,
  removeUser,
  getUsers,
  localLogin,
  checkAdminUsername,
  getSystemUsername
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/local-login', localLogin);
router.post('/check-admin-username', checkAdminUsername);
router.get('/system-username', getSystemUsername);
router.post('/register', register);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUser);
router.delete('/profile', protect, removeUser);
router.get('/users', protect, getUsers);

export default router; 