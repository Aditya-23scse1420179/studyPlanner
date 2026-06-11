const jwt = require("jsonwebtoken");
const catchAsyncError = require("./catchAsyncError");
const { ErrorHandler } = require("./error");
const User = require("../models/user.model");

const isAuthenticated = catchAsyncError(async (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) {
    token = req.cookies?.accessToken || req.cookies?.token;
  }


  if (!token) {
    return next(new ErrorHandler("Please login to access this resource.", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorHandler("User not found. Please login again.", 401));
    }

    if (!user.isEmailVerified) {
      return next(new ErrorHandler("Account not verified. Please verify your account.", 401));
    }

    if (user.status !== "active") {
      return next(new ErrorHandler("Your account is locked or disabled. Please contact support.", 403));
    }

    req.user = user;
    next();
  } catch {
    return next(new ErrorHandler("Invalid or expired token. Please login again.", 401));
  }
});

module.exports = { isAuthenticated };