import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getInvoicesByCase, createInvoice, updateInvoiceStatus, deleteInvoice } from '../controllers/invoiceController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getInvoicesByCase);
router.post('/', createInvoice);
router.put('/:id', updateInvoiceStatus);
router.delete('/:id', deleteInvoice);

export default router;
