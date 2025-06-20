import express from "express";
import { getAllUsers, getUserEnrollmentDetails, getUserProfile, updateProfile  } from "../controllers/user.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

// User profile routes
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated, upload.single("profilePicture"), updateProfile);


//Admin routes for user management 
router.route("/admin/users").get(isAuthenticated, getAllUsers);
router.route("/admin/users/:userId/enrollments").get(isAuthenticated, getUserEnrollmentDetails)
export default router;

