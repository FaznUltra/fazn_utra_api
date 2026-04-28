import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@fazn.dev';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Fazn Ultra';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

export const sendVerificationEmail = async (email: string, otp: string, firstName: string): Promise<void> => {
  const subject = 'Verify Your Email Address';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 5px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border-radius: 0 0 5px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #212529;">Fazn Ultra</h1>
          </div>
          <div class="content">
            <h2>Email Verification</h2>
            <p>Hello ${firstName},</p>
            <p>Thank you for registering with Fazn Ultra. To complete your registration, please verify your email address using the code below:</p>
            <div class="otp-code">${otp}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not create an account with Fazn Ultra, please ignore this email.</p>
            <p>Best regards,<br>The Fazn Ultra Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Fazn Ultra. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ to: email, subject, html });
};

export const sendPasswordResetEmail = async (email: string, otp: string, firstName: string): Promise<void> => {
  const subject = 'Reset Your Password';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 5px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border-radius: 0 0 5px 5px; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #212529;">Fazn Ultra</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${firstName},</p>
            <p>We received a request to reset your password. Use the verification code below to proceed:</p>
            <div class="otp-code">${otp}</div>
            <p>This code will expire in 10 minutes.</p>
            <div class="warning">
              <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email and ensure your account is secure.
            </div>
            <p>Best regards,<br>The Fazn Ultra Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Fazn Ultra. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ to: email, subject, html });
};

export const sendWelcomeEmail = async (email: string, firstName: string): Promise<void> => {
  const subject = 'Welcome to Fazn Ultra';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border-radius: 0 0 5px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #212529;">Fazn Ultra</h1>
          </div>
          <div class="content">
            <h2>Welcome to Fazn Ultra!</h2>
            <p>Hello ${firstName},</p>
            <p>Your email has been successfully verified. Welcome to the Fazn Ultra community!</p>
            <p>You can now access all features of your account and start your gaming journey with us.</p>
            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The Fazn Ultra Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Fazn Ultra. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ to: email, subject, html });
};
