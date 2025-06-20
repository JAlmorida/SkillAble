import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
    createCourse,
    editCourse,
    getCourseById,
    getCreatorCourses,
    getPublishedCourse,
    searchCourse,
    togglePublishCourse
} from "../controllers/course.controller.js";
import upload from "../utils/multer.js";

const router = express.Router();

// Course routes
router.route("/").post(isAuthenticated, createCourse);
router.route("/search").get(isAuthenticated, searchCourse);
router.route("/published-courses").get(getPublishedCourse);
router.route("/").get(isAuthenticated, getCreatorCourses);
router.route("/:courseId").put(isAuthenticated, upload.single("courseThumbnail"), editCourse);
router.route("/:courseId").get(isAuthenticated, getCourseById);
router.route("/:courseId").patch(isAuthenticated, togglePublishCourse);

export default router;

