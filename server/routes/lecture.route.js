import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
    createLecture,
    editLecture,
    getCourseLecture,
    getLectureById,
    removeLecture
} from "../controllers/lecture.controller.js";

const router = express.Router();

// Lecture routes
router.route("/:courseId/lecture").post(isAuthenticated, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);
router.route("/:courseId/lecture/:lectureId").put(isAuthenticated, editLecture);
router.route("/lecture/:lectureId").delete(isAuthenticated, removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);

export default router;
