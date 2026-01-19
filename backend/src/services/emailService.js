import nodemailer from 'nodemailer';

// Create reusable transporter
let transporter;

const initTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

export const sendVerificationEmail = async (email, token, name) => {
  try {
    const transport = initTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Campus Connect'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${name}!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    };

    await transport.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}:`, error.message);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, token, name) => {
  try {
    const transport = initTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Campus Connect'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${name},</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2196F3; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `,
    };

    await transport.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${email}:`, error.message);
    throw error;
  }
};

export const sendModeratorInvite = async (email, name, tempPassword, campusName) => {
  try {
    const transport = initTransporter();
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Campus Connect'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Moderator Invitation - ${campusName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${name},</h2>
          <p>You've been invited to be a moderator for <strong>${campusName}</strong>!</p>
          <p>Your temporary login credentials:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
          </div>
          <p><strong>Important:</strong> Please change your password immediately after logging in.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="background-color: #FF9800; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Login Now
            </a>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            If you didn't expect this invitation, please contact the campus administrator.
          </p>
        </div>
      `,
    };

    await transport.sendMail(mailOptions);
    console.log(`✅ Moderator invite sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send moderator invite to ${email}:`, error.message);
    throw error;
  }
};

export const sendNotificationEmail = async (email, name, title, message, reportLink) => {
  try {
    const transport = initTransporter();

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Campus Connect'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${name},</h2>
          <h3>${title}</h3>
          <p>${message}</p>
          ${reportLink ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reportLink}" 
                 style="background-color: #9C27B0; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                View Report
              </a>
            </div>
          ` : ''}
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This is an automated notification from ${process.env.APP_NAME || 'Campus Connect'}.
          </p>
        </div>
      `,
    };

    await transport.sendMail(mailOptions);
    console.log(`✅ Notification email sent to ${email}: ${title}`);
  } catch (error) {
    console.error(`❌ Failed to send notification to ${email}:`, error.message);
    throw error;
  }
};

export const verifyEmailConfig = async () => {
  try {
    const transport = initTransporter();
    await transport.verify();
    console.log('✅ Email service configured successfully');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration failed:', error.message);
    return false;
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendModeratorInvite,
  sendNotificationEmail,
  verifyEmailConfig,
};