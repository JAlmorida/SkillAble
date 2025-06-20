import express from "express"
import isAuthenticated from "../middleware/isAuthenticated.js";
import { getCourseProgress, markAsCompleted, markAsInCompleted, markLessonIncomplete, updateLectureProgress, updateLessonProgress } from "../controllers/courseProgress.controller.js";

const router = express.Router()

router.route("/:courseId").get(isAuthenticated, getCourseProgress);
router.route("/:courseId/lecture/:lectureId/view").post(isAuthenticated, updateLectureProgress);
router.route("/:courseId/complete").post(isAuthenticated, markAsCompleted);
router.route("/:courseId/incomplete").post(isAuthenticated, markAsInCompleted);
router.route("/:courseId/lecture/:lectureId/lesson/:lessonId/complete").post(isAuthenticated, updateLessonProgress);
router.route("/:courseId/lecture/:lectureId/lesson/:lessonId/incomplete").post(isAuthenticated, markLessonIncomplete);
router.route("/:courseId/lecture/:lectureId/lesson/:lessonId/view").post(isAuthenticated, updateLessonProgress);

export default router;