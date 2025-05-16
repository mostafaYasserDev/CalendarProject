import express from 'express';
import {
  login,
  getUserProfile,
  createUser,
  updateUser,
  deleteUser,
  getUsers
} from '../controllers/userController.js';
import { protect, admin, owner } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);

router.route('/profile')
  .get(protect, getUserProfile);

router.use(protect);

router.route('/')
  .get(admin, getUsers)
  .post(owner, createUser);

router.route('/:id')
  .put(admin, updateUser)
  .delete(owner, deleteUser);

export default router;