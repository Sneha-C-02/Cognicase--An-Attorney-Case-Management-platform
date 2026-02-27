import Activity from '../models/Activity.js';

export const logActivity = async (caseId, type, message, user = 'System', userId) => {
    try {
        console.log("Logging Activity for user:", userId);
        await Activity.create({
            caseId,
            type,
            message,
            user,
            createdBy: userId
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};
