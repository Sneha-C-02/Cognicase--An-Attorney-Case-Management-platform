const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'c:/Users/sneha/Downloads/Attorney-Case-Management/backend/.env' });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://01fe23bcs501_db_user:rQW1Kq13cnloMWgy@cluster0.pybq0xq.mongodb.net/legal_dashboard";

const userSchema = new mongoose.Schema({
    email: String,
    otp: String
});

const User = mongoose.model('User', userSchema);

async function getOTP() {
    try {
        await mongoose.connect(MONGO_URI);
        const user = await User.findOne({ email: 'snehacgoudar2005@gmail.com' });
        if (user) {
            console.log(`[FOUND_OTP]: ${user.otp}`);
        } else {
            console.log('User not found');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

getOTP();
