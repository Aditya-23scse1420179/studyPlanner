const express = require("express");
const router = express.Router();

const {
  signup,
  verifyOtp,
  resendOtp,
  login,
  logout,
  refreshToken,
  getMe,
} = require("../controllers/auth.controller");

const { isAuthenticated } = require("../middlewares/auth");
const {
  validateSignup,
  validateLogin,
} = require("../middlewares/validate");

// Public routes
router.post("/signup",      validateSignup, signup);
router.post("/verify-otp",  verifyOtp);
router.post("/resend-otp",  resendOtp);
router.post("/login",       validateLogin, login);
router.post("/refresh",     refreshToken);

// Protected routes
router.post("/logout", isAuthenticated, logout);
router.get("/me",      isAuthenticated, getMe);

module.exports = router;