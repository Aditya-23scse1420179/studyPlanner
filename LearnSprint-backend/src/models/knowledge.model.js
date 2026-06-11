const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const questionSchema = new Schema(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String },
  },
  { _id: false }
);

const assessmentTemplateSchema = new Schema(
  {
    topic: { type: String, required: true },
    durationUnit: { type: String, enum: ["hour", "day", "week", "month", "year"], required: true },
    questions: [questionSchema],
  },
  { _id: true }
);

const learningModuleSchema = new Schema(
  {
    title: { type: String, required: true },
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
    estimatedHours: { type: Number, required: true },
    resourceUrl: { type: String },
  },
  { _id: true }
);

const knowledgeSchema = new Schema(
  {
    skillName: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true },
    aliases: [{ type: String }],
    isActive: { type: Boolean, default: true },
    learningModules: [learningModuleSchema],
    assessmentTemplates: [assessmentTemplateSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Knowledge", knowledgeSchema);