import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
    createLessons,
    editLesson,
    getLectureLessons,
    getLessonById,
    removeLesson
} from "../controllers/lesson.controller.js";

const router = express.Router();

// Lesson routes
router.route("/:lectureId/lesson").post(isAuthenticated, createLessons);
router.route("/:lectureId/lesson").get(isAuthenticated, getLectureLessons);
router.route("/:lectureId/lesson/:lessonId").put(isAuthenticated, editLesson);
router.route("/lesson/:lessonId").get(isAuthenticated, getLessonById);
router.route("/lesson/:lessonId").delete(isAuthenticated, removeLesson);
    
export default router;
