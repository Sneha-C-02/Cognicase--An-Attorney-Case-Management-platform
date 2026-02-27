/**
 * CogniCase — Gmail SMTP Diagnostic Script
 * Run: node test-email.js your_test_email@example.com
 *
 * This sends a real test OTP to the address you provide.
 * It will tell you EXACTLY what's wrong if the email fails.
 */

import 'dotenv/config';
import nodemailer from 'nodemailer';

const target = process.argv[2];
if (!target) {
    console.error('\n❌  Usage: node test-email.js <recipient@example.com>\n');
    process.exit(1);
}

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

console.log('\n──────────────────────────────────────────');
console.log('  CogniCase Email Diagnostic');
console.log('──────────────────────────────────────────');
console.log(`  Sender  : ${EMAIL_USER || '❌ NOT SET'}`);
console.log(`  Password: ${EMAIL_PASS ? '✅ set (' + EMAIL_PASS.length + ' chars)' : '❌ NOT SET'}`);
console.log(`  Send to : ${target}`);
console.log('──────────────────────────────────────────\n');

if (!EMAIL_USER || EMAIL_USER === 'your_gmail@gmail.com') {
    console.error('❌  EMAIL_USER is not set in backend/.env');
    console.error('    → Open backend/.env and set EMAIL_USER=yourname@gmail.com\n');
    process.exit(1);
}
if (!EMAIL_PASS || EMAIL_PASS === 'your_16char_app_password') {
    console.error('❌  EMAIL_PASS is not set in backend/.env');
    console.error('    → You need a Gmail APP PASSWORD (not your login password)');
    console.error('    → Steps: myaccount.google.com → Security → 2-Step Verification → App passwords\n');
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

console.log('⏳  Verifying Gmail credentials...');
try {
    await transporter.verify();
    console.log('✅  Gmail credentials are VALID — server accepted them.\n');
} catch (err) {
    console.error('❌  Gmail REJECTED the credentials.\n');
    console.error('    Error code :', err.code);
    console.error('    Error msg  :', err.message);
    console.error('');
    if (err.responseCode === 535 || err.message.includes('Username and Password not accepted')) {
        console.error('  Common fixes:');
        console.error('  1. Make sure 2-Step Verification is ON for this Google account.');
        console.error('     → myaccount.google.com → Security → 2-Step Verification');
        console.error('');
        console.error('  2. Generate an App Password (NOT your Gmail login password):');
        console.error('     → myaccount.google.com → Security → "App passwords"');
        console.error('     → App name: CogniCase → Click Create');
        console.error('     → Copy the 16-char code → paste into EMAIL_PASS in backend/.env');
        console.error('');
        console.error('  3. Paste the App Password WITHOUT spaces:');
        console.error('     EMAIL_PASS=abcdefghijklmnop   ← correct');
        console.error('     EMAIL_PASS=abcd efgh ijkl mn  ← also works');
    }
    process.exit(1);
}

console.log(`⏳  Sending test OTP email to ${target}...`);
try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await transporter.sendMail({
        from: `"CogniCase Test" <${EMAIL_USER}>`,
        to: target,
        subject: `CogniCase Test — OTP is ${otp}`,
        html: `<div style="font-family:sans-serif;padding:24px;">
          <h2 style="color:#7c3aed;">⚖ CogniCase — Test Email</h2>
          <p>Your test OTP is: <strong style="font-size:28px;letter-spacing:6px;">${otp}</strong></p>
          <p style="color:#64748b;font-size:13px;">Gmail SMTP is working correctly.</p>
        </div>`,
    });
    console.log(`\n✅  SUCCESS — Email sent to ${target}`);
    console.log(`    OTP was: ${otp}`);
    console.log('    Check your inbox (and spam folder).\n');
} catch (sendErr) {
    console.error('\n❌  Credentials verified but send failed:', sendErr.message, '\n');
    process.exit(1);
}
