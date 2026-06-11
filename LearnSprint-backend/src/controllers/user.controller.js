const catchAsyncError = require("../middlewares/catchAsyncError");
const { ErrorHandler } = require("../middlewares/error");
const User = require("../models/user.model");

// ─── PROFILE ────────────────────────────────────────────────────────────────

// GET /api/v1/profile
const getProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select("profile")
    .populate("profile.targetSkillId", "skillName category");

  res.status(200).json({
    success: true,
    profile: user.profile,
  });
});

// PATCH /api/v1/profile
const updateProfile = catchAsyncError(async (req, res, next) => {
  const { fullName, timezone, targetSkillId, themePref } = req.body;

  const updateFields = {};
  if (fullName)      updateFields["profile.fullName"]      = fullName;
  if (timezone)      updateFields["profile.timezone"]      = timezone;
  if (targetSkillId) updateFields["profile.targetSkillId"] = targetSkillId;
  if (themePref)     updateFields["profile.themePref"]     = themePref;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("profile");

  res.status(200).json({
    success: true,
    message: "Profile updated.",
    profile: user.profile,
  });
});

// ─── STUDY PLANS ────────────────────────────────────────────────────────────

// GET /api/v1/study-plans/active
const getActiveStudyPlan = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("studyPlans");

  const activePlan = user.studyPlans.find((p) => p.status === "active");
  if (!activePlan) {
    return next(new ErrorHandler("No active study plan found.", 404));
  }

  res.status(200).json({
    success: true,
    planId: activePlan._id,
    skillId: activePlan.skillId,
    status: activePlan.status,
    durationDays: activePlan.durationDays,
    dailyHours: activePlan.dailyHours,
    startDate: activePlan.startDate,
    endDate: activePlan.endDate,
    modules: activePlan.modules,
  });
});

// ─── REMINDERS ──────────────────────────────────────────────────────────────

// POST /api/v1/reminders
const createReminder = catchAsyncError(async (req, res, next) => {
  const { title, scheduledAt } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {
        reminders: { title, scheduledAt: new Date(scheduledAt), status: "pending" },
      },
    },
    { new: true, runValidators: true }
  ).select("reminders");

  const created = user.reminders[user.reminders.length - 1];

  res.status(201).json({
    success: true,
    reminderId: created._id,
    title: created.title,
    scheduledAt: created.scheduledAt,
    status: created.status,
  });
});

// GET /api/v1/reminders
const getReminders = catchAsyncError(async (req, res, next) => {
  const { status } = req.query;

  const user = await User.findById(req.user._id).select("reminders");

  const reminders = status
    ? user.reminders.filter((r) => r.status === status)
    : user.reminders;

  res.status(200).json({
    success: true,
    reminders: reminders.map((r) => ({
      reminderId: r._id,
      title: r.title,
      scheduledAt: r.scheduledAt,
      status: r.status,
      snoozeUntil: r.snoozeUntil || null,
    })),
  });
});

// POST /api/v1/reminders/:id/complete
const completeReminder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(req.user._id).select("reminders");

  const reminder = user.reminders.id(id);
  if (!reminder) {
    return next(new ErrorHandler("Reminder not found.", 404));
  }

  reminder.status = "completed";
  await user.save();

  res.status(200).json({ success: true, message: "Reminder marked as completed." });
});

// ─── STREAK HELPER ──────────────────────────────────────────────────────────

/**
 * Updates the user's streak based on today's date.
 * - Same day as lastActiveDate → no change (already counted)
 * - Exactly 1 day gap          → increment streak
 * - Gap > 1 day                → reset streak to 1
 * Always updates lastActiveDate to today and bestStreak if exceeded.
 */
const updateStreak = (streak) => {
  const today     = new Date();
  const todayStr  = today.toISOString().split("T")[0]; // "YYYY-MM-DD"

  if (!streak.lastActiveDate) {
    // First ever activity
    streak.currentStreak  = 1;
    streak.bestStreak     = 1;
    streak.lastActiveDate = today;
    return;
  }

  const lastStr  = streak.lastActiveDate.toISOString().split("T")[0];

  if (lastStr === todayStr) {
    // Already active today — no change
    return;
  }

  // Calculate day gap
  const lastDate = new Date(lastStr);
  const todayDate = new Date(todayStr);
  const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day — increment
    streak.currentStreak += 1;
  } else {
    // Gap > 1 day — reset
    streak.currentStreak = 1;
  }

  // Update best streak
  if (streak.currentStreak > streak.bestStreak) {
    streak.bestStreak = streak.currentStreak;
  }

  streak.lastActiveDate = today;
};

// ─── ASSESSMENTS ────────────────────────────────────────────────────────────

// POST /api/v1/assessments/submit
// Body: { quizId, answers: [{ questionId, selectedAnswer }] }
const submitAssessment = catchAsyncError(async (req, res, next) => {
  const { quizId, answers } = req.body;

  const TOTAL_QUESTIONS = 10;

  // Enforce exactly 10 answers
  if (answers.length !== TOTAL_QUESTIONS) {
    return next(
      new ErrorHandler(`You must submit exactly ${TOTAL_QUESTIONS} answers. Received ${answers.length}.`, 400)
    );
  }

  // Load user and find the quiz session
  const user = await User.findById(req.user._id).select("quizHistory assessmentHistory streak");

  const session = user.quizHistory.id(quizId);
  if (!session) {
    return next(new ErrorHandler("Quiz session not found. Please generate a quiz first.", 404));
  }

  if (session.isSubmitted) {
    return next(new ErrorHandler("This quiz has already been submitted.", 400));
  }

  // Build answer key from stored questions: { questionId -> correctAnswer }
  const answerKey = {};
  for (const q of session.questions) {
    answerKey[q.id] = { correctAnswer: q.correctAnswer, explanation: q.explanation };
  }

  // Score each submitted answer
  let correctCount = 0;
  const breakdown = answers.map((a) => {
    const stored   = answerKey[a.questionId];
    const isCorrect = stored !== undefined && a.selectedAnswer === stored.correctAnswer;
    if (isCorrect) correctCount++;
    return {
      questionId:     a.questionId,
      selectedAnswer: a.selectedAnswer,
      correctAnswer:  stored?.correctAnswer || null,
      explanation:    stored?.explanation   || null,
      isCorrect,
    };
  });

  const wrongCount   = TOTAL_QUESTIONS - correctCount;
  const percentage   = parseFloat(((correctCount / TOTAL_QUESTIONS) * 100).toFixed(2));
  const score        = correctCount; // out of 10

  let classification = "beginner";
  if (score >= 7)      classification = "advanced";
  else if (score >= 4) classification = "intermediate";

  // Mark quiz session as submitted + write score back to quizHistory
  session.isSubmitted    = true;
  session.score          = score;
  session.percentage     = percentage;
  session.classification = classification;
  session.submittedAt    = new Date();

  // Also persist in assessmentHistory for dedicated history queries
  user.assessmentHistory.push({
    quizId:         session._id,
    topic:          session.topic,
    totalQuestions: TOTAL_QUESTIONS,
    correctAnswers: correctCount,
    wrongAnswers:   wrongCount,
    score,
    percentage,
    classification,
  });

  // Update streak
  updateStreak(user.streak);

  await user.save();

  res.status(200).json({
    success: true,
    topic: session.topic,
    result: {
      score:          `${score} / ${TOTAL_QUESTIONS}`,
      correctAnswers: correctCount,
      wrongAnswers:   wrongCount,
      totalQuestions: TOTAL_QUESTIONS,
      percentage:     `${percentage}%`,
      classification,
    },
    streak: {
      currentStreak:  user.streak.currentStreak,
      bestStreak:     user.streak.bestStreak,
      lastActiveDate: user.streak.lastActiveDate,
    },
    breakdown,
  });
});

// ─── FEEDBACK ───────────────────────────────────────────────────────────────

// POST /api/v1/feedback
const submitFeedback = catchAsyncError(async (req, res, next) => {
  const { message } = req.body;

  await User.findByIdAndUpdate(req.user._id, {
    $push: { feedbackSubmitted: { message } },
  });

  res.status(201).json({ success: true, message: "Feedback submitted successfully." });
});

// ─── PROGRESS REPORT ────────────────────────────────────────────────────────

// GET /api/v1/progress
const getProgress = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select(
    "profile streak quizHistory assessmentHistory studyPlans reminders"
  ).populate("profile.targetSkillId", "skillName category");

  // ── Quiz stats ────────────────────────────────────────────────────────────
  const submitted  = user.quizHistory.filter((q) => q.isSubmitted);
  const scores     = submitted.map((q) => q.score).filter((s) => s !== null);
  const totalQuizzes    = user.quizHistory.length;
  const totalSubmitted  = submitted.length;
  const avgScore        = scores.length
    ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
    : null;
  const bestScore       = scores.length ? Math.max(...scores) : null;
  const avgPercentage   = submitted.length
    ? parseFloat(
        (submitted.reduce((a, q) => a + (q.percentage || 0), 0) / submitted.length).toFixed(2)
      )
    : null;

  // Level counts
  const levelCounts = { beginner: 0, intermediate: 0, advanced: 0 };
  submitted.forEach((q) => { if (q.classification) levelCounts[q.classification]++; });

  // Topic breakdown
  const topicMap = {};
  submitted.forEach((q) => {
    if (!topicMap[q.topic]) topicMap[q.topic] = { attempts: 0, bestScore: 0, latestScore: 0 };
    topicMap[q.topic].attempts++;
    topicMap[q.topic].bestScore   = Math.max(topicMap[q.topic].bestScore, q.score || 0);
    topicMap[q.topic].latestScore = q.score || 0;
  });
  const topicBreakdown = Object.entries(topicMap).map(([topic, data]) => ({ topic, ...data }));

  // ── Quiz history (most recent first, no questions array) ──────────────────
  const quizHistory = user.quizHistory
    .slice()
    .reverse()
    .map((q) => ({
      quizId:         q._id,
      topic:          q.topic,
      isSubmitted:    q.isSubmitted,
      score:          q.score !== null ? `${q.score} / 10` : null,
      percentage:     q.percentage !== null ? `${q.percentage}%` : null,
      classification: q.classification,
      generatedAt:    q.generatedAt,
      submittedAt:    q.submittedAt,
    }));

  // ── Study plans ───────────────────────────────────────────────────────────
  const studyPlans = user.studyPlans.map((p) => ({
    planId:       p._id,
    status:       p.status,
    durationDays: p.durationDays,
    dailyHours:   p.dailyHours,
    startDate:    p.startDate,
    endDate:      p.endDate,
    totalModules: p.modules.length,
    completedModules: p.modules.filter((m) => m.completedAt).length,
  }));

  // ── Reminders summary ─────────────────────────────────────────────────────
  const reminderStats = {
    total:     user.reminders.length,
    pending:   user.reminders.filter((r) => r.status === "pending").length,
    completed: user.reminders.filter((r) => r.status === "completed").length,
  };

  // ── Response ──────────────────────────────────────────────────────────────
  res.status(200).json({
    success: true,
    profile: {
      fullName:    user.profile.fullName,
      email:       user.email,
      timezone:    user.profile.timezone,
      targetSkill: user.profile.targetSkillId || null,
      themePref:   user.profile.themePref,
    },
    streak: {
      currentStreak: user.streak.currentStreak,
      bestStreak:    user.streak.bestStreak,
      lastActiveDate: user.streak.lastActiveDate || null,
    },
    stats: {
      totalQuizzesGenerated: totalQuizzes,
      totalQuizzesSubmitted: totalSubmitted,
      averageScore:          avgScore,          // out of 10
      bestScore:             bestScore,          // out of 10
      averagePercentage:     avgPercentage ? `${avgPercentage}%` : null,
      levelBreakdown:        levelCounts,
    },
    topicBreakdown,
    quizHistory,
    studyPlans,
    reminderStats,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  getActiveStudyPlan,
  getProgress,
  createReminder,
  getReminders,
  completeReminder,
  submitAssessment,
  submitFeedback,
};