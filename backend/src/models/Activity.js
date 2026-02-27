import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
    type: {
        type: String,
        enum: ['CASE_CREATED', 'STATUS_CHANGED', 'TASK_ADDED', 'DOCUMENT_ADDED', 'NOTE_ADDED'],
        required: true
    },
    message: String,
    user: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);
