const { getAuth } = require('../lib/firebase-admin');
const crypto = require('crypto');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  try {
    const auth = getAuth();

    // Check if user exists
    let user;
    try {
      user = await auth.getUserByEmail(email);
    } catch (error) {
      // User not found - don't reveal this for security
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a new password has been sent.'
      });
    }

    // Generate new strong password
    const newPassword = crypto.randomBytes(12).toString('base64').slice(0, 16);

    // Update user password
    await auth.updateUser(user.uid, {
      password: newPassword
    });

    // TODO: Send email with new password
    // For now, we'll return it in the response (in production, send via email service)
    console.log(`New password for ${email}: ${newPassword}`);

    // In production, you would use a service like SendGrid, AWS SES, or Nodemailer
    // Example with Nodemailer (commented out):
    /*
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: '"UpSell AI" <noreply@upsellai.com>',
      to: email,
      subject: 'Your New Password - UpSell AI',
      html: `
        <h2>Password Reset</h2>
        <p>Your new password is: <strong>${newPassword}</strong></p>
        <p>Please login and change your password immediately.</p>
        <p><a href="https://wpupsell-dashboard.vercel.app/login">Login to Dashboard</a></p>
      `
    });
    */

    return res.status(200).json({
      success: true,
      message: 'New password has been sent to your email.',
      // REMOVE THIS IN PRODUCTION - only for testing
      tempPassword: newPassword
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to reset password. Please try again.'
    });
  }
};
