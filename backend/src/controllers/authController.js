import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendOTP } from '../utils/emailService.js';

// Simple 6-digit OTP generator
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * POST /api/auth/request-otp
 * 1. Generate 6-digit OTP
 * 2. Save OTP with 5-minute expiry in User model
 * 3. Send real OTP email via Gmail SMTP
 */
export const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Find or create user to store OTP
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        name: email.split('@')[0],
        isOnboarded: false
      });
    }

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send REAL OTP email
    // This will throw an error if sending fails, which we catch below
    await sendOTP(email, otp);



    res.status(200).json({
      message: 'Verification code sent to your email.'
    });

  } catch (error) {
    console.error('[Auth] requestOTP error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to send verification code. Please try again.'
    });
  }
};

/**
 * POST /api/auth/verify-otp
 * 1. Validate OTP and expiry
 * 2. If valid, clear code and issue JWT
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'No account found with this email.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Incorrect verification code.' });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    // Success: Clear OTP and issue session
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'cognicase_secret_key_2024',
      { expiresIn: '7d' }
    );


    res.status(200).json({
      user,
      token,
      message: 'OTP verified successfully.'
    });

  } catch (error) {
    console.error('[Auth] verifyOTP error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/auth/complete-onboarding
 * Collects remaining profile details after first legal login.
 */
export const completeOnboarding = async (req, res) => {
  try {
    const { name, role, organization, practiceArea, experienceYears } = req.body;
    const userId = req.user._id;


    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.name = name;
    user.role = role;
    user.organization = organization;
    user.practiceArea = practiceArea;
    user.experienceYears = experienceYears;
    user.isOnboarded = true;

    await user.save();

    res.status(200).json({
      message: 'Onboarding completed successfully.',
      user
    });

  } catch (error) {
    console.error('[Auth] completeOnboarding error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
