import mongoose from "mongoose";

// Tracks progress for a single lesson
const lessonProgressSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
});

// Tracks progress for a single quiz
const quizProgressSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  attempted: { type: Boolean, default: false },
  score: { type: Number },
  completedAt: { type: Date }
});

// Tracks progress for a single lecture
const lectureProgressSchema = new mongoose.Schema({
  lectureId: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture" },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  lessonProgress: [lessonProgressSchema],
  quizProgress: [quizProgressSchema]
});

// Tracks progress for a course
const courseProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  lectureProgress: [lectureProgressSchema]
}, { timestamps: true });

export const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);