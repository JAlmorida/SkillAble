import express from "express"
import {
  getCourseProgress,
  updateLectureProgress,
  updateLessonProgress,
  getLessonProgress,
  getLectureProgress,
  updateQuizProgress,
  getQuizProgress,
  getAllUsersCourseProgress,
  updateCourseProgress,
  getCourseProgressHistory
} from "../controllers/courseProgress.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router()

router.route("/:courseId").get(isAuthenticated, getCourseProgress);
router.route("/:courseId/lecture/:lectureId/view").post(isAuthenticated, updateLectureProgress);
router.route("/:courseId/lecture/:lectureId/lesson/:lessonId/complete").post(isAuthenticated, updateLessonProgress);
router.route("/:courseId/lecture/:lectureId/lesson/:lessonId/view").post(isAuthenticated, updateLessonProgress);
router.route("/:courseId/lecture/:lectureId/lesson/:lessonId/progress").get(isAuthenticated, getLessonProgress);
router.route("/:courseId/lecture/:lectureId/progress").get(isAuthenticated, getLectureProgress);
router.route("/:courseId/lecture/:lectureId/quiz/:quizId/progress").get(isAuthenticated, getQuizProgress);
router.route("/:courseId/lecture/:lectureId/quiz/:quizId/attempt").post(isAuthenticated, updateQuizProgress);
router.route("/:courseId/all").get(isAuthenticated, getAllUsersCourseProgress);
router.route("/:courseId/status").patch(isAuthenticated, updateCourseProgress);
router.route("/:courseId/progress-history").get(isAuthenticated, getCourseProgressHistory)

export default router;