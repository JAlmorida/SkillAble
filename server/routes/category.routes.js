import express from "express";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../controllers/category.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.route("/").get(getCategories);
router.route("/").post(isAuthenticated, createCategory);
router.route("/:id").put(isAuthenticated,  updateCategory);
router.route("/:id").delete(isAuthenticated, deleteCategory);

export default router;
