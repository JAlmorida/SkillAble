import express from "express";
import { getDashboardStats } from "../controllers/admin.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.route("/stats").get(isAuthenticated, getDashboardStats);

export default router;
