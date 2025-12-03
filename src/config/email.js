const config = require('./env');

/**
 * MailerSend API Configuration
 * Using MailerSend REST API for reliable email delivery
 */
const MAILERSEND_API_URL = 'https://api.mailersend.com/v1';
const MAILERSEND_API_KEY = config.mailersend.apiKey;
const MAILERSEND_FROM_EMAIL = config.mailersend.fromEmail;
const MAILERSEND_FROM_NAME = config.mailersend.fromName || 'StudyHive';

/**
 * Send email using MailerSend API
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Email plain text content
 * @returns {Promise<Object>} Email info
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    console.log('\n📧 Preparing to send email via MailerSend...');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   From: ${MAILERSEND_FROM_NAME} <${MAILERSEND_FROM_EMAIL}>`);
    
    const emailData = {
      from: {
        email: MAILERSEND_FROM_EMAIL,
        name: MAILERSEND_FROM_NAME,
      },
      to: [
        {
          email: to,
        },
      ],
      subject: subject,
      html: html,
      text: text,
    };
    
    console.log('🔄 Sending email via MailerSend API...');
    
    const response = await fetch(`${MAILERSEND_API_URL}/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
      },
      body: JSON.stringify(emailData),
    });
    
    if (response.status === 202) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ Email sent successfully via MailerSend!');
      console.log('✅ Status: 202 Accepted (no content)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return {
        messageId: null,
        response: 'Email accepted by MailerSend',
      };
    }
    
    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
        errorBody = JSON.parse(errorBody);
      } catch (err) {
        // ignore parse errors
      }
      throw new Error(`MailerSend API error: ${JSON.stringify(errorBody)}`);
    }
    
    // Some endpoints may still return JSON, handle gracefully
    let result = {};
    try {
      result = await response.json();
    } catch (err) {
      // ignore parse errors for non-JSON success responses
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Email sent successfully via MailerSend!');
    if (result.message_id) {
      console.log(`   Message ID: ${result.message_id}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return {
      messageId: result.message_id || null,
      response: 'Email sent via MailerSend',
    };
  } catch (error) {
    console.error('\n❌ Email send failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`❌ Error: ${error.message}`);
    
    if (error.response) {
      console.error(`❌ Response: ${JSON.stringify(error.response)}`);
    }
    
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    throw error;
  }
};

/**
 * Verify MailerSend connection
 * Tests the API key by making a simple request
 */
const verifyConnection = async () => {
  try {
    console.log('\n🔍 Verifying MailerSend connection...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log(`📋 Configuration:`);
    console.log(`   API URL: ${MAILERSEND_API_URL}`);
    console.log(`   From Email: ${MAILERSEND_FROM_EMAIL}`);
    console.log(`   From Name: ${MAILERSEND_FROM_NAME}`);
    console.log(`   API Key: ${MAILERSEND_API_KEY.substring(0, 10)}...`);
    
    // Test API key by checking domains (simpler endpoint)
    console.log('\n🔄 Testing API connection...');
    
    const response = await fetch(`${MAILERSEND_API_URL}/domains`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`MailerSend API error: ${errorData.message || response.statusText}`);
    }
    
    const domains = await response.json();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ MailerSend connection verified successfully!');
    console.log(`   Verified domains: ${domains.data?.length || 0}`);
    console.log('✅ Ready to send emails');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return true;
  } catch (error) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ MailerSend connection verification failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`\n❌ Error: ${error.message}`);
    
    console.error('\n📋 Troubleshooting Guide:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('⚠️  API KEY ERROR');
    console.error('   1. Verify your MailerSend API key is correct');
    console.error('   2. Check that the API key has email sending permissions');
    console.error('   3. Ensure the API key is not expired');
    console.error('   4. Verify the from email is verified in MailerSend');
    console.error('   5. Check MailerSend dashboard for account status');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return false;
  }
};

/**
 * Send verification email with 6-digit OTP
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP
 * @param {string} userName - User name
 */
const sendVerificationEmail = async (email, otp, userName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🎓 StudyHive</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
        <h2 style="color: #111827; margin-top: 0;">Welcome, ${userName}!</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Thank you for signing up for StudyHive. To complete your registration, please verify your email address using the OTP below.
        </p>
        
        <div style="background: #f9fafb; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
          <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            ${otp}
          </div>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin: 20px 0;">
          Enter this code in the verification page to activate your account. This code will expire in <strong>10 minutes</strong>.
        </p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #92400e; font-size: 13px; margin: 0;">
            <strong>⚠️ Security Tip:</strong> Never share this code with anyone. StudyHive staff will never ask for your verification code.
          </p>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          If you didn't create an account with StudyHive, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  const text = `
    Welcome to StudyHive, ${userName}!
    
    Your email verification code is: ${otp}
    
    Enter this 6-digit code to verify your email address.
    
    This code will expire in 10 minutes.
    
    If you didn't create an account with StudyHive, you can safely ignore this email.
  `;

  await sendEmail({
    to: email,
    subject: 'Verify your StudyHive account - Your OTP',
    html,
    text,
  });
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User name
 */
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request 🔐</h2>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your StudyHive password.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" 
         style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Reset Password
      </a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #6B7280; word-break: break-all;">${resetUrl}</p>
      <p style="color: #6B7280; font-size: 14px;">This link will expire in 1 hour.</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #E5E7EB;">
      <p style="color: #9CA3AF; font-size: 12px;">
        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      </p>
    </div>
  `;

  const text = `
    Password Reset Request
    
    Hi ${userName},
    
    We received a request to reset your StudyHive password.
    
    Reset your password by clicking this link: ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you didn't request a password reset, please ignore this email.
  `;

  await sendEmail({
    to: email,
    subject: 'Reset your StudyHive password',
    html,
    text,
  });
};

module.exports = {
  verifyConnection,
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
