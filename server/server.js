import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Set up the transporter with real Gmail SMTP credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dhruvalgondaliya5@gmail.com', // Correct spelling
    pass: 'eyvfdeleeuddvdde', // App Password
  },
});

app.post('/api/send-email', async (req, res) => {
  const { email, otpCode } = req.body;

  if (!email || !otpCode) {
    return res.status(400).json({ success: false, error: 'Email and OTP code are required.' });
  }

  console.log(`[Backend] Attempting to send REAL Email OTP to ${email} with code: ${otpCode}`);

  try {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0f; padding: 40px; border-radius: 12px; color: #f8fafc; border: 1px solid #1e1e24;">
        <h1 style="color: #6366f1; font-size: 24px; text-align: center; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px;">Memorix</h1>
        <h2 style="font-size: 20px; font-weight: normal; margin-bottom: 30px; text-align: center;">Password Reset Request</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #a1a1aa; text-align: center;">You have requested to reset your password. Here is your one-time verification code:</p>
        <div style="background-color: #1e1e24; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center; border: 1px solid #27272a;">
          <strong style="font-size: 32px; letter-spacing: 8px; color: #4ade80;">${otpCode}</strong>
        </div>
        <p style="font-size: 14px; line-height: 1.5; color: #a1a1aa; text-align: center; margin-bottom: 40px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border-color: #27272a; border-style: solid; border-width: 1px 0 0 0; margin-bottom: 20px;" />
        <p style="font-size: 12px; color: #52525b; text-align: center;">&copy; 2025 Memorix Inc. All rights reserved.</p>
      </div>
    `;

    // Send the email from the user's authenticated Gmail account
    const info = await transporter.sendMail({
      from: '"Memorix Auth" <dhruvalgondaliya5@gmail.com>', // Correct spelling
      to: email,
      subject: "Your Memorix Verification Code",
      text: `Your Memorix OTP is: ${otpCode}. Do not share this code.`,
      html: htmlTemplate
    });

    console.log('[Backend] ✅ Email sent successfully to real inbox!');

    res.json({ success: true, message: 'OTP sent successfully to your email!' });
  } catch (error) {
    console.error('[Backend] ❌ Internal Email Error:', error);
    res.status(500).json({ success: false, error: 'Failed to send email. Check App Password and security settings.' });
  }
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Memorix REAL Email Backend is running on port ${PORT}`);
  console.log(`===============================================`);
  console.log(`Authenticated as: dhruvalgondaliya5@gmail.com`);
});
