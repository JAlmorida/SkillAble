import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
  courseEnroll,
  getCourseDetailWithEnrollmentStatus,
  getAllEnrolledCourses,
} from "../controllers/courseEnroll.controller.js";

const router = express.Router();

// Enroll in a course
router.route ("/enroll").post(isAuthenticated, courseEnroll);
// Get course detail with enrollment status
router.route("/course/:courseId/detail-with-status").get(isAuthenticated,getCourseDetailWithEnrollmentStatus);
// Get all enrolled courses for the user
router.route("/").get(isAuthenticated, getAllEnrolledCourses);
// Get user course enrollment

export default router;
