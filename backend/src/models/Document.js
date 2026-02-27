import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },  // optional
    name: { type: String, required: true },
    type: String,
    category: String,
    fileUrl: String,
    fileSize: String,
    fileType: String,
    description: String,
    status: String,
    uploadedBy: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);
