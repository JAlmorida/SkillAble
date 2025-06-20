import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import {
    attemptQuiz, 
    createQuiz, 
    getAdminQuizzes, 
    getLessonQuizzes, 
    getQuizAttempts, 
    getQuizById, 
    getuserAttempts, 
    removeQuiz, 
    updateQuiz 
} from '../controllers/quiz.controller.js';

const router = express.Router();

//Quiz CRUD routes 
router.route("/:lessonId").post(isAuthenticated, createQuiz);
router.route("/:quizId").put(isAuthenticated, updateQuiz);
router.route("/:quizId").delete(isAuthenticated, removeQuiz);
router.route("/lesson/:lessonId").get(isAuthenticated, getLessonQuizzes);
router.route("/:quizId").get(isAuthenticated, getQuizById);

//quiz attempts 
router.route("/attempt/:quizId").post(isAuthenticated, attemptQuiz);
router.route("/attempts/user").get(isAuthenticated, getuserAttempts);
router.route("/attempts/admin").get(isAuthenticated, getAdminQuizzes)
router.route("/attempts/:quizId").get(isAuthenticated, getQuizAttempts)

export default router;