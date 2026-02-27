import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['Attorney', 'Paralegal', 'Partner', 'Admin'],
        default: 'Attorney',
    },
    organization: {
        type: String,
    },
    practiceArea: {
        type: String,
    },
    experienceYears: {
        type: String,
    },
    isOnboarded: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    },
}, {
    timestamps: true,
});

export default mongoose.model('User', userSchema);
