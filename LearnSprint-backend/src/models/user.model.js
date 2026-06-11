const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { Schema, model } = mongoose;

const authTokenSchema = new Schema(
  {
    tokenHash: { type: String, required: true },
    deviceInfo: { type: Object },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const studyModuleSchema = new Schema(
  {
    title: { type: String, required: true },
    resourceUrl: { type: String },
    plannedDate: { type: Date },
    completedAt: { type: Date },
    completionPct: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: true }
);

const studyPlanSchema = new Schema(
  {
    skillId: { type: Schema.Types.ObjectId, ref: "Knowledge", required: true },
    durationDays: { type: Number, required: true },
    dailyHours: { type: Number, required: true },
    status: { type: String, enum: ["active", "completed", "paused"], default: "active" },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    modules: [studyModuleSchema],
  },
  { _id: true }
);

const progressEntrySchema = new Schema(
  {
    date: { type: Date, required: true },
    studyMinutes: { type: Number, default: 0 },
    modulesCompleted: { type: Number, default: 0 },
    remindersCompleted: { type: Number, default: 0 },
    assessmentsTaken: { type: Number, default: 0 },
    accuracyPct: { type: Number, default: 0 },
  },
  { _id: false }
);

const reminderSchema = new Schema(
  {
    title: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    status: { type: String, enum: ["pending", "completed", "snoozed"], default: "pending" },
    snoozeUntil: { type: Date },
  },
  { _id: true }
);

const assessmentAttemptSchema = new Schema(
  {
    quizId:         { type: Schema.Types.ObjectId, required: true },  // ref to quizHistory._id
    topic:          { type: String, required: true },
    totalQuestions: { type: Number, required: true, default: 10 },
    correctAnswers: { type: Number, required: true, min: 0 },
    wrongAnswers:   { type: Number, required: true, min: 0 },
    score:          { type: Number, required: true, min: 0, max: 10 },   // correct count out of 10
    percentage:     { type: Number, required: true, min: 0, max: 100 },  // e.g. 70.00
    classification: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
    submittedAt:    { type: Date, default: Date.now },
  },
  { _id: true }
);

const feedbackSchema = new Schema(
  {
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const quizQuestionSchema = new Schema(
  {
    id:            { type: String, required: true },
    question:      { type: String, required: true },
    difficulty:    { type: String, enum: ["easy", "medium", "hard"], required: true },
    options:       [{ type: String }],
    correctAnswer: { type: String, required: true },
    explanation:   { type: String },
  },
  { _id: false }
);

const quizHistorySchema = new Schema(
  {
    topic:          { type: String, required: true },
    totalQuestions: { type: Number, default: 10 },
    questions:      [quizQuestionSchema],   // stored for scoring on submit
    isSubmitted:    { type: Boolean, default: false },
    // Populated after /assessments/submit
    score:          { type: Number, min: 0, max: 10, default: null },   // correct count
    percentage:     { type: Number, min: 0, max: 100, default: null },  // e.g. 70.00
    classification: { type: String, enum: ["beginner", "intermediate", "advanced"], default: null },
    submittedAt:    { type: Date, default: null },
    generatedAt:    { type: Date, default: Date.now },
  },
  { _id: true }  // _id acts as quizId for submit
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "locked", "disabled"], default: "active" },

    otp: { type: String },
    otpExpiry: { type: Date },

    profile: {
      fullName: { type: String, required: true, trim: true },
      avatarUrl: { type: String },
      timezone: { type: String, default: "UTC" },
      targetSkillId: { type: Schema.Types.ObjectId, ref: "Knowledge" },
      themePref: { type: String, enum: ["light", "dark", "system"], default: "system" },
    },

    authTokens: [authTokenSchema],

    streak: {
      currentStreak: { type: Number, default: 0 },
      bestStreak: { type: Number, default: 0 },
      lastActiveDate: { type: Date },
    },

    studyPlans: [studyPlanSchema],
    progressHistory: [progressEntrySchema],
    reminders: [reminderSchema],
    assessmentHistory: [assessmentAttemptSchema],
    quizHistory: [quizHistorySchema],
    feedbackSubmitted: [feedbackSchema],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m",
  });
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  });
};

module.exports = mongoose.model("User", userSchema);