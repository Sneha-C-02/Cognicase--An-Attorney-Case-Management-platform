import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getAllClients, getClientById, createClient, updateClient, deleteClient
} from '../controllers/clientController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
