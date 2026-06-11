const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const morgan = require("morgan");

const { errorMiddleware } = require("./middlewares/error");
const { ErrorHandler } = require("./middlewares/error");
const { getCorsOptions } = require("./config/cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const quizRoutes = require("./routes/quiz.routes");

const app = express();

// Security
app.use(helmet());
app.use(cors(getCorsOptions()));

// Body parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
if (process.env.NODE_ENV === "production")  app.use(morgan("combined"));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many authentication attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP limiter — keyed by email, falls back to ipKeyGenerator for IPv6 safety
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: parseInt(process.env.MAX_OTP_ATTEMPTS || "5"),
  message: { success: false, message: "Too many OTP attempts. Please try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    req.body?.email ? String(req.body.email).toLowerCase() : ipKeyGenerator(req),
});

app.use("/api/", globalLimiter);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LearnSprint API is running 🚀",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/v1/auth",           authLimiter, authRoutes);
app.use("/api/v1/auth/verify-otp", otpLimiter);
app.use("/api/v1/auth/resend-otp", otpLimiter);
app.use("/api/v1",                 userRoutes);
app.use("/api/v1/quiz",            quizRoutes);

// 404
app.use((req, res, next) => {
  next(new ErrorHandler(`Route ${req.originalUrl} not found`, 404));
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;