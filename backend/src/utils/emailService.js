import nodemailer from 'nodemailer';

/**
 * Lazy transporter creation: 
 * Ensures process.env is fully loaded before configuration.
 */
const getTransporter = () => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        throw new Error('EMAIL_USER and EMAIL_PASS are missing in environment variables.');
    }

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: user,
            pass: pass,
        },
    });
};

/**
 * Sends a premium legal-branded OTP email.
 * @param {string} email - Recipient address
 * @param {string} otp - 6-digit code
 */
export const sendOTP = async (email, otp) => {
    const transporter = getTransporter();

    const mailOptions = {
        from: `"CogniCase Auth" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'CogniCase Verification Code',
        text: `Your CogniCase verification code is: ${otp}. This code expires in 5 minutes.`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:40px 20px;">
                <tr>
                    <td align="center">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:500px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow: 0 4px 20px rgba(0,0,0,0.05);border: 1px solid #e2e8f0;">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #4c1d95, #7c3aed); padding: 40px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">⚖ CogniCase</h1>
                                    <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Secure Legal Management</p>
                                </td>
                            </tr>
                            <!-- Body -->
                            <tr>
                                <td style="padding: 40px; text-align: center;">
                                    <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 20px; font-weight: 700;">Verify Your Identity</h2>
                                    <p style="color: #64748b; margin: 0 0 32px; font-size: 16px; line-height: 1.6;">Use the verification code below to access your account. This code is valid for <strong>5 minutes</strong>.</p>
                                    
                                    <div style="background-color: #f5f3ff; border: 2px solid #ddd6fe; border-radius: 12px; padding: 24px; margin: 0 auto 32px; width: fit-content;">
                                        <div style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 800; color: #4c1d95; letter-spacing: 12px; margin-left: 12px;">
                                            ${otp}
                                        </div>
                                    </div>
                                    
                                    <p style="color: #94a3b8; font-size: 13px; margin: 0;">If you didn't request this code, you can safely ignore this email.</p>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} CogniCase SaaS. All rights reserved.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] OTP sent to ${email}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`[EmailService] Failed to send email to ${email}:`, error.message);
        throw new Error(`Email delivery failed: ${error.message}`);
    }
};
