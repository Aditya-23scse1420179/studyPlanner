const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  getActiveStudyPlan,
  getProgress,
  createReminder,
  getReminders,
  completeReminder,
  submitAssessment,
  submitFeedback,
} = require("../controllers/user.controller");

const { isAuthenticated } = require("../middlewares/auth");
const {
  validateProfileUpdate,
  validateSubmitAssessment,
  validateCreateReminder,
  validateReminderId,
  validateFeedback,
} = require("../middlewares/validate");

// All user routes are protected
router.use(isAuthenticated);

// Profile
router.get("/profile",   getProfile);
router.patch("/profile", validateProfileUpdate, updateProfile);

// Study Plans
router.get("/study-plans/active", getActiveStudyPlan);

// Progress Report
router.get("/progress", getProgress);

// Assessments
router.post("/assessments/submit", validateSubmitAssessment, submitAssessment);

// Reminders
router.post("/reminders",              validateCreateReminder, createReminder);
router.get("/reminders",               getReminders);
router.post("/reminders/:id/complete", validateReminderId,     completeReminder);

// Feedback
router.post("/feedback", validateFeedback, submitFeedback);

module.exports = router;