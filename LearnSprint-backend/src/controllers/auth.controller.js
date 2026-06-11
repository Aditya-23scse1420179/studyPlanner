const jwt = require("jsonwebtoken");
const catchAsyncError = require("../middlewares/catchAsyncError");
const { ErrorHandler } = require("../middlewares/error");
const User = require("../models/user.model");
const sendToken = require("../utils/sendToken");
const generateAvatar = require("../utils/generateAvatar");
const { generateOtp, getOtpExpiry, sendOtpEmail } = require("../utils/generateOtp");

// POST /api/v1/auth/signup
const signup = catchAsyncError(async (req, res, next) => {
  const { fullName, email, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new ErrorHandler("Email already registered.", 409));
  }

  const otp = generateOtp();
  const otpExpiry = getOtpExpiry();
  const avatarUrl = generateAvatar();

  const user = await User.create({
    email,
    passwordHash: password,
    otp,
    otpExpiry,
    profile: {
      fullName,
      avatarUrl,
    },
  });

  await sendOtpEmail(email, otp);

  res.status(201).json({
    success: true,
    message: "Account created. Please verify your email with the OTP sent."
  });
});

// POST /api/v1/auth/verify-otp
const verifyOtp = catchAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  if (user.isEmailVerified) {
    return next(new ErrorHandler("Email is already verified.", 400));
  }

  if (!user.otp || !user.otpExpiry) {
    return next(new ErrorHandler("No OTP found. Please request a new one.", 400));
  }

  if (new Date() > user.otpExpiry) {
    return next(new ErrorHandler("OTP has expired. Please request a new one.", 400));
  }

  if (user.otp !== otp) {
    return next(new ErrorHandler("Invalid OTP.", 400));
  }

  user.isEmailVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  sendToken(user, 200, "Email verified successfully.", res);
});

// POST /api/v1/auth/resend-otp
const resendOtp = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  if (user.isEmailVerified) {
    return next(new ErrorHandler("Email is already verified.", 400));
  }

  const otp = generateOtp();
  const otpExpiry = getOtpExpiry();

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  await sendOtpEmail(email, otp);

  res.status(200).json({
    success: true,
    message: "A new OTP has been sent to your email.",
  });
});

// POST /api/v1/auth/login
const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password.", 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid email or password.", 401));
  }

  if (!user.isEmailVerified) {
    return next(new ErrorHandler("Please verify your email before logging in.", 401));
  }

  if (user.status !== "active") {
    return next(new ErrorHandler("Your account is locked or disabled. Please contact support.", 403));
  }

  sendToken(user, 200, "Logged in successfully.", res);
});

// POST /api/v1/auth/logout
const logout = catchAsyncError(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Remove the matching token from authTokens array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { authTokens: { tokenHash: refreshToken } },
    });
  }

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  res.status(200).json({ success: true, message: "Logged out successfully." });
});

// POST /api/v1/auth/refresh
const refreshToken = catchAsyncError(async (req, res, next) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;

  if (!token) {
    return next(new ErrorHandler("Refresh token not provided.", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return next(new ErrorHandler("Invalid or expired refresh token.", 401));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new ErrorHandler("User not found.", 401));
  }

  if (user.status !== "active") {
    return next(new ErrorHandler("Account is not active.", 403));
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  res
    .cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      expires: new Date(Date.now() + 20 * 60 * 1000), // 20 mins
    })
    .cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
    .status(200)
    .json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
});

// GET /api/v1/auth/me
const getMe = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select(
    "_id email profile isEmailVerified status createdAt"
  );

  res.status(200).json({
    success: true,
    id: user._id,
    email: user.email,
    profile: user.profile,
    isEmailVerified: user.isEmailVerified,
    status: user.status,
    createdAt: user.createdAt,
  });
});

module.exports = { signup, verifyOtp, resendOtp, login, logout, refreshToken, getMe };