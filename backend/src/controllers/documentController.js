import Document from '../models/Document.js';
import { logActivity } from '../utils/activityLogger.js';
export const getDocumentsByCase = async (req, res) => {
    try {
        const { caseId, search } = req.query;
        const filter = { createdBy: req.user._id };
        if (caseId || req.params.caseId) filter.caseId = caseId || req.params.caseId;

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const documents = await Document.find(filter).populate('caseId', 'title').sort({ createdAt: -1 });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateDocument = async (req, res) => {
    try {
        const document = await Document.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            req.body,
            { returnDocument: 'after' }
        );
        if (!document) return res.status(404).json({ message: 'Document not found' });
        res.json(document);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const createDocument = async (req, res) => {
    try {
        const { name, caseId, category, description } = req.body;
        const file = req.file;

        if (!name && !file) {
            return res.status(400).json({ message: 'Document name or file is required.' });
        }

        const docData = {
            name: name || file?.originalname || 'Untitled Document',
            category: category || 'Other',
            description,
            uploadedBy: req.user?.name || req.user?.email || 'Unknown',
            fileType: file ? file.mimetype.split('/')[1].toUpperCase() : (req.body.fileType || 'PDF'),
            fileSize: file ? (file.size / 1024).toFixed(1) + ' KB' : (req.body.fileSize || 'N/A'),
            fileUrl: file ? `/uploads/${file.filename}` : '#',
            createdBy: req.user._id,
        };

        console.log("Saving Document with createdBy:", req.user._id);

        // Only set caseId if it's a valid non-empty string
        if (caseId && caseId.trim() !== '' && caseId !== 'undefined' && caseId !== 'null') {
            docData.caseId = caseId;
        }

        const document = await Document.create(docData);

        if (docData.caseId) {
            try {
                await logActivity(document.caseId, 'DOCUMENT_ADDED', `Document uploaded: "${document.name}"`, req.user?.name, req.user.id);
            } catch { /* ignore */ }
        }

        res.status(201).json(document);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteDocument = async (req, res) => {
    // Note: In a production app, we should also delete the physical file from the uploads folder.
    try {
        const document = await Document.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
        if (!document) return res.status(404).json({ message: 'Document not found' });
        res.json({ message: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
