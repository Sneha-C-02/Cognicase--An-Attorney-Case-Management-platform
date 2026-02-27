import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getAllCases, getCaseById, createCase, updateCase, deleteCase
} from '../controllers/caseController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllCases);
router.get('/:id', getCaseById);
router.post('/', createCase);
router.put('/:id', updateCase);
router.delete('/:id', deleteCase);

export default router;
