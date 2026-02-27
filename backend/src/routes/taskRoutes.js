import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getTasksByCase, createTask, updateTask, deleteTask
} from '../controllers/taskController.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', getTasksByCase);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
