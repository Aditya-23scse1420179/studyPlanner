const crypto = require("crypto");
const sendEmail = require("./sendEmail");
const generateEmailTemplate = require("./generateEmailTemplate");

// Generates a cryptographically secure 6-digit OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// OTP expiry duration in milliseconds (10 minutes)
const OTP_EXPIRY_MS = 10 * 60 * 1000;

const getOtpExpiry = () => new Date(Date.now() + OTP_EXPIRY_MS);

// Sends OTP verification email to the user
const sendOtpEmail = async (email, otp) => {
  await sendEmail({
    to: email,
    subject: "Verify your LearnSprint account",
    html: generateEmailTemplate(otp),
  });
};

module.exports = { generateOtp, getOtpExpiry, sendOtpEmail };