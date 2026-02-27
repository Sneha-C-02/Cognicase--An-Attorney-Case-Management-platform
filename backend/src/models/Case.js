import mongoose from 'mongoose';

// Cases store the client as a simple name string for flexibility
// clientId is optional — only set if a real Client record exists
const caseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },  // optional
    clientName: String,  // plain text client name from form
    status: {
        type: String,
        enum: ['Open', 'InProgress', 'Closed'],
        default: 'Open'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    caseType: String,
    court: String,
    startDate: Date,
    deadline: Date,
    billableHours: { type: Number, default: 0 },
    tags: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });

export default mongoose.model('Case', caseSchema);
