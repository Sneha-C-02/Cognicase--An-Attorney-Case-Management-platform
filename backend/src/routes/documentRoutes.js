import express from 'express';
import multer from 'multer';
import path from 'path';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getDocumentsByCase, createDocument, deleteDocument
} from '../controllers/documentController.js';

const router = express.Router({ mergeParams: true });

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

router.use(authMiddleware);

router.get('/', getDocumentsByCase);
router.post('/', upload.single('file'), createDocument);
router.delete('/:id', deleteDocument);

export default router;
