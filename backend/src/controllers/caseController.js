import Case from '../models/Case.js';
import { logActivity } from '../utils/activityLogger.js';

export const getAllCases = async (req, res) => {
    try {
        const { status, priority, clientId, search } = req.query;
        let query = {};
        if (status && status !== 'All') query.status = status;
        if (priority) query.priority = priority;
        if (clientId) query.clientId = clientId;
        if (search) query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { clientName: { $regex: search, $options: 'i' } }
        ];

        // Strict scoping
        query.createdBy = req.user._id;

        const cases = await Case.find(query).populate('clientId').populate('createdBy', 'name').sort({ createdAt: -1 });
        res.json(cases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCaseById = async (req, res) => {
    try {
        const caseData = await Case.findOne({ _id: req.params.id, createdBy: req.user._id }).populate('clientId').populate('createdBy', 'name');
        if (!caseData) return res.status(404).json({ message: 'Case not found' });
        res.json(caseData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCase = async (req, res) => {
    try {
        const { title, client, type, status, description, priority, court, deadline } = req.body;

        if (!title) return res.status(400).json({ message: 'Case title is required.' });

        const caseData = {
            title,
            clientName: client || '',   // from form field "client" (plain text)
            caseType: type,
            status: status || 'Open',
            priority: priority || 'Medium',
            description,
            court,
            deadline,
            startDate,
            billableHours: parseFloat(req.body.billableHours) || 0,
            createdBy: req.user._id,
        };

        console.log("Saving Case with createdBy:", req.user._id);

        const newCase = await Case.create(caseData);
        // logActivity is optional — don't fail if it errors
        try {
            await logActivity(newCase._id, 'CASE_CREATED', `Case "${newCase.title}" was created.`, req.user?.name, req.user.id);
        } catch { /* ignore activity log errors */ }

        res.status(201).json(newCase);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateCase = async (req, res) => {
    try {
        const oldCase = await Case.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!oldCase) return res.status(404).json({ message: 'Case not found' });

        const updateData = { ...req.body };
        if (updateData.billableHours !== undefined) {
            updateData.billableHours = parseFloat(updateData.billableHours) || 0;
        }

        console.log("Updating Case:", req.params.id, "with data:", updateData);

        const updatedCase = await Case.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (oldCase.status !== updatedCase.status) {
            try {
                await logActivity(updatedCase._id, 'STATUS_CHANGED', `Status changed from ${oldCase.status} to ${updatedCase.status}.`, req.user?.name, req.user.id);
            } catch { /* ignore */ }
        }

        res.json(updatedCase);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteCase = async (req, res) => {
    try {
        const deletedCase = await Case.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
        if (!deletedCase) return res.status(404).json({ message: 'Case not found' });
        res.json({ message: 'Case deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
