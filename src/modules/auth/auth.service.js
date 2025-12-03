const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../user/user.model');
const ApiError = require('../../shared/utils/ApiError');
const { HTTP_STATUS, TOKEN_EXPIRY } = require('../../shared/utils/constants');
const { generateToken, hashToken, generateOTP, hashOTP, verifyOTP } = require('../../shared/utils/helpers');
const { email: emailService } = require('../../config');
const config = require('../../config/env');

/**
 * Generate JWT access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
};

/**
 * Generate tokens (access + refresh)
 */
const generateTokens = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { accessToken, refreshToken };
};

/**
 * Register a new user
 */
const signup = async (name, email, password) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already registered');
  }

  // Generate 6-digit OTP
  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    emailVerificationOTP: hashedOTP,
    emailVerificationOTPExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  // Send verification email with OTP
  try {
    await emailService.sendVerificationEmail(email, otp, name);
    console.log(`✅ Verification email with OTP sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message);
    console.error('Full error:', error);
    // Don't fail signup if email fails, but log the OTP for testing
    console.log(`📝 Verification OTP for ${email}: ${otp}`);
  }

  // Generate tokens
  const tokens = generateTokens(user);

  // Save refresh token to user
  user.refreshToken = tokens.refreshToken;
  await user.save();

  const response = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    ...tokens,
  };

  // Include verification OTP in development for testing
  if (config.env === 'development') {
    response.verificationOTP = otp;
    response.message = 'Check your email for 6-digit OTP. OTP included for testing.';
  }

  return response;
};

/**
 * Login user
 */
const login = async (email, password) => {
  // Find user with password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
  }

  // Check if account is active
  if (!user.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Account is deactivated');
  }

  // Compare password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
  }

  // Generate tokens
  const tokens = generateTokens(user);

  // Update refresh token and last login
  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  await user.save();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    ...tokens,
  };
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Refresh token required');
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

    // Find user with refresh token
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid refresh token');
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    return { accessToken };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Refresh token expired');
    }
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid refresh token');
  }
};

/**
 * Logout user (invalidate refresh token)
 */
const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    refreshToken: null,
  });

  return { message: 'Logged out successfully' };
};

/**
 * Verify email with 6-digit OTP
 */
const verifyEmail = async (otp) => {
  // Validate OTP format (6 digits)
  if (!/^\d{6}$/.test(otp)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Invalid OTP format. OTP must be 6 digits.'
    );
  }

  const hashedOTP = hashOTP(otp);

  const user = await User.findOne({
    emailVerificationOTP: hashedOTP,
    emailVerificationOTPExpiry: { $gt: Date.now() },
  }).select('+emailVerificationOTP +emailVerificationOTPExpiry');

  if (!user) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Invalid or expired OTP. Please request a new OTP.'
    );
  }

  // Mark as verified
  user.isVerified = true;
  user.emailVerificationOTP = undefined;
  user.emailVerificationOTPExpiry = undefined;
  await user.save();

  return { message: 'Email verified successfully' };
};

/**
 * Resend verification email
 */
const resendVerificationEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  if (user.isVerified) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Email already verified');
  }

  // Generate new 6-digit OTP
  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);

  user.emailVerificationOTP = hashedOTP;
  user.emailVerificationOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // Send verification email with OTP
  try {
    await emailService.sendVerificationEmail(email, otp, user.name);
    console.log(`✅ Verification email with OTP sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message);
    console.log(`📝 Verification OTP for ${email}: ${otp}`);
  }

  return { message: 'Verification email sent' };
};

/**
 * Request password reset
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if user exists
    return { message: 'If email exists, reset link will be sent' };
  }

  // Generate reset token
  const resetToken = generateToken();
  const hashedToken = hashToken(resetToken);

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // Send password reset email
  try {
    await emailService.sendPasswordResetEmail(email, resetToken, user.name);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error.message);
    console.log(`📝 Reset token for ${email}: ${resetToken}`);
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'Failed to send reset email'
    );
  }

  return { message: 'If email exists, reset link will be sent' };
};

/**
 * Reset password with token
 */
const resetPassword = async (token, newPassword) => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpiry');

  if (!user) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Invalid or expired reset token'
    );
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  user.refreshToken = null; // Invalidate all sessions
  await user.save();

  return { message: 'Password reset successfully' };
};

/**
 * Change password (authenticated user)
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  user.refreshToken = null; // Invalidate all sessions
  await user.save();

  return { message: 'Password changed successfully' };
};

module.exports = {
  signup,
  login,
  refreshAccessToken,
  logout,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
};

