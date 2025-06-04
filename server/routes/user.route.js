import express from "express";
import { getUserProfile, updateProfile  } from "../controllers/user.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

// User profile routes
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated, upload.single("profilePicture"), updateProfile);

//chatroom routes
router.route("/chat").get(isAuthenticated);

export default router;

