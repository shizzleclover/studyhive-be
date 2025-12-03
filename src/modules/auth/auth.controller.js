const authService = require('./auth.service');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/utils/constants');
const asyncHandler = require('../../shared/utils/asyncHandler');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const data = await authService.signup(name, email, password);

  const response = new ApiResponse(
    HTTP_STATUS.CREATED,
    data,
    'Account created successfully. Please check your email for the 6-digit OTP to verify your account.'
  );

  // Also expose tokens at top-level for external frontends expecting flat shape
  res.status(response.statusCode).json({
    ...response,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const data = await authService.login(email, password);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Logged in successfully'
  );

  // Also expose tokens at top-level for external frontends expecting flat shape
  res.status(response.statusCode).json({
    ...response,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const data = await authService.refreshAccessToken(refreshToken);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Token refreshed successfully'
  );

  // Also expose new accessToken at top-level
  res.status(response.statusCode).json({
    ...response,
    accessToken: data.accessToken,
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    null,
    'Logged out successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with 6-digit OTP
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const data = await authService.verifyEmail(otp);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Email verified successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const data = await authService.resendVerificationEmail(email);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Verification email sent'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset (sends 6-digit OTP)
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const data = await authService.forgotPassword(email);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'If email exists, reset OTP will be sent'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with 6-digit OTP
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { otp, newPassword } = req.body;

  const data = await authService.resetPassword(otp, newPassword);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Password reset successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (authenticated)
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const data = await authService.changePassword(
    req.user.id,
    currentPassword,
    newPassword
  );

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Password changed successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const User = require('../user/user.model');
  const user = await User.findById(req.user.id);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { user },
    'User data retrieved'
  );

  res.status(response.statusCode).json(response);
});

module.exports = {
  signup,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
};

