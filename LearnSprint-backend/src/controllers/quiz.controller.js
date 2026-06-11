const catchAsyncError = require("../middlewares/catchAsyncError");
const { generateQuizQuestions } = require("../utils/gemini");
const User = require("../models/user.model");

/**
 * POST /api/v1/quiz/generate
 * Body: { topic: string }
 *
 * Generates 10 MCQ questions (3 easy, 3 medium, 4 hard) using Gemini AI.
 * - Stores full questions (with correct answers) in quizHistory for server-side scoring.
 * - Returns questions WITHOUT correctAnswer so client cannot cheat.
 * - Returns a quizId to use when submitting answers.
 */
const generateQuiz = catchAsyncError(async (req, res, next) => {
  const topic = req.body.topic.trim();

  const questions = await generateQuizQuestions(topic);

  // Store full questions (including correct answers) in DB for scoring later
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {
        quizHistory: {
          topic,
          totalQuestions: questions.length,
          questions,           // full questions stored server-side
          isSubmitted: false,
          generatedAt: new Date(),
        },
      },
    },
    { new: true }
  ).select("quizHistory");

  // Get the newly created quiz session (last entry)
  const session = user.quizHistory[user.quizHistory.length - 1];

  // Return full questions including correctAnswer and explanation
  const fullQuestions = questions.map((q) => ({
    id:            q.id,
    question:      q.question,
    difficulty:    q.difficulty,
    options:       q.options,
    correctAnswer: q.correctAnswer,
    explanation:   q.explanation,
  }));

  res.status(200).json({
    success: true,
    quizId: session._id,   // use this in /assessments/submit
    topic,
    summary: {
      total:  questions.length,
      easy:   questions.filter((q) => q.difficulty === "easy").length,
      medium: questions.filter((q) => q.difficulty === "medium").length,
      hard:   questions.filter((q) => q.difficulty === "hard").length,
    },
    questions: fullQuestions,
  });
});

module.exports = { generateQuiz };
