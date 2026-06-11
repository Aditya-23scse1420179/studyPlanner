const { body, param, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field:   err.path ?? err.param,  // express-validator v7 uses .path
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errorMessages,
    });
  }
  next();
};

// ─── AUTH ────────────────────────────────────────────────────────────────────

const validateSignup = [
  body("fullName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Full name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage("Full name can only contain letters and spaces"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email"),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage("Password must contain uppercase, lowercase, number and special character"),
  handleValidationErrors,
];

const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required"),
  handleValidationErrors,
];

// ─── PROFILE ─────────────────────────────────────────────────────────────────

const validateProfileUpdate = [
  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Full name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage("Full name can only contain letters and spaces"),
  body("timezone")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Timezone cannot be empty"),
  body("targetSkillId")
    .optional()
    .isMongoId()
    .withMessage("Invalid skill ID"),
  body("themePref")
    .optional()
    .isIn(["light", "dark", "system"])
    .withMessage("Theme must be light, dark, or system"),
  handleValidationErrors,
];

// ─── QUIZ ─────────────────────────────────────────────────────────────────────

const validateGenerateQuiz = [
  body("topic")
    .trim()
    .notEmpty()
    .withMessage("Topic is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Topic must be between 2 and 200 characters"),
  handleValidationErrors,
];

// ─── ASSESSMENT SUBMIT ────────────────────────────────────────────────────────

const validateSubmitAssessment = [
  body("quizId")
    .isMongoId()
    .withMessage("quizId must be a valid ID (copy it from the quiz/generate response)"),
  body("answers")
    .isArray({ min: 10, max: 10 })
    .withMessage("You must submit exactly 10 answers"),
  body("answers.*.questionId")
    .trim()
    .notEmpty()
    .withMessage("Each answer must have a questionId"),
  body("answers.*.selectedAnswer")
    .trim()
    .notEmpty()
    .withMessage("Each answer must have a selectedAnswer"),
  handleValidationErrors,
];

// ─── REMINDERS ────────────────────────────────────────────────────────────────

const validateCreateReminder = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Reminder title is required")
    .isLength({ max: 100 })
    .withMessage("Title must be under 100 characters"),
  body("scheduledAt")
    .isISO8601()
    .withMessage("scheduledAt must be a valid ISO date string"),
  handleValidationErrors,
];

const validateReminderId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid reminder ID"),
  handleValidationErrors,
];

// ─── FEEDBACK ─────────────────────────────────────────────────────────────────

const validateFeedback = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Feedback message is required")
    .isLength({ max: 2000 })
    .withMessage("Feedback must be under 2000 characters"),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateSignup,
  validateLogin,
  validateProfileUpdate,
  validateGenerateQuiz,
  validateSubmitAssessment,
  validateCreateReminder,
  validateReminderId,
  validateFeedback,
};