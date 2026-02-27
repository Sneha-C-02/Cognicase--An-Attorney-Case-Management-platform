import express from 'express';
import { requestOTP, verifyOTP, completeOnboarding } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/complete-onboarding', authMiddleware, completeOnboarding);

export default router;
