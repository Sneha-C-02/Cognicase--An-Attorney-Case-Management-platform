import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },  // optional for general tasks
    title: { type: String, required: true },
    description: String,
    assignedTo: String,
    status: {
        type: String,
        enum: ['Todo', 'In Progress', 'Completed', 'On Hold'],
        default: 'Todo'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    deadline: Date,
    completedAt: Date,
    dueDate: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
