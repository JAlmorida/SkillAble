import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { 
    createQuestion,
    deleteQuestion,
    getQuizQuestions,
    updateQuestion
 } from "../controllers/question.controller.js";

const router = express.Router();

router.route("/create").post(isAuthenticated, createQuestion);
router.route("/question/:questionId").put(isAuthenticated, updateQuestion);
router.route("/question/:questionId/delete").delete(isAuthenticated, deleteQuestion);
router.route("/quiz/:quizId/question").get(isAuthenticated, getQuizQuestions)

export default router;