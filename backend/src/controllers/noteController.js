import Note from '../models/Note.js';
import { logActivity } from '../utils/activityLogger.js';

export const getNotesByCase = async (req, res) => {
    try {
        const notes = await Note.find({
            caseId: req.query.caseId || req.params.caseId,
            createdBy: req.user._id
        });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createNote = async (req, res) => {
    try {
        console.log("Saving Note with createdBy:", req.user._id);
        const note = await Note.create({ ...req.body, createdBy: req.user._id });
        await logActivity(note.caseId, 'NOTE_ADDED', `New note added.`, req.user.name, req.user._id);
        res.status(201).json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
        if (!note) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
