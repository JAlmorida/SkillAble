import mongoose from "mongoose";
const courseEnrollSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrolledAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    // Optionally, add a status or timestamp
  },
  { timestamps: true }
);
export const CourseEnroll = mongoose.model(
  "CourseEnroll",
  courseEnrollSchema
);
