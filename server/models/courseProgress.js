import { View } from "lucide-react";
import mongoose from "mongoose";

const lectureProgressSchema = new mongoose.Schema({
  lectureId: { type: String },
  Viewed: { type: Boolean },
});

const courseProgressSchema = new mongoose.Schema({
  userId: { type: String },
  courseId: { type: String },
  completed: { type: Boolean },
  lectureProgress: [lectureProgressSchema],
});

export const CourseProgress = mongoose.model( "CourseProgress", courseProgressSchema);