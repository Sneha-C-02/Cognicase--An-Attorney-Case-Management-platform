import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getNotesByCase, createNote, deleteNote
} from '../controllers/noteController.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', getNotesByCase);
router.post('/', createNote);
router.delete('/:id', deleteNote);

export default router;
