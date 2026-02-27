import Activity from '../models/Activity.js';

export const getActivityByCase = async (req, res) => {
    try {
        const activity = await Activity.find({
            caseId: req.query.caseId || req.params.caseId,
            createdBy: req.user._id
        }).sort({ createdAt: -1 });
        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getGlobalActivity = async (req, res) => {
    try {
        const activity = await Activity.find({ createdBy: req.user._id }).sort({ createdAt: -1 }).limit(20);
        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
