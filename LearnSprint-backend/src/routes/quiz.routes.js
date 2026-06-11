const express = require("express");
const router = express.Router();

const { generateQuiz } = require("../controllers/quiz.controller");
const { isAuthenticated } = require("../middlewares/auth");
const { validateGenerateQuiz } = require("../middlewares/validate");

// All quiz routes require authentication
router.use(isAuthenticated);

// POST /api/v1/quiz/generate
// Body: { "topic": "any topic" }
router.post("/generate", validateGenerateQuiz, generateQuiz);

module.exports = router;
