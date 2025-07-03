import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateUserRegistration, validateUserLogin, validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, validateRequest, register);
router.post('/login', validateUserLogin, validateRequest, login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;