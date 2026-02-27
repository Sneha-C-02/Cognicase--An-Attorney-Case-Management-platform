import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getActivityByCase, getGlobalActivity
} from '../controllers/activityController.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', getActivityByCase);
router.get('/global', getGlobalActivity);

export default router;
