import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import {
    attemptQuiz, 
    createQuiz, 
    getAdminQuizzes, 
    getInProgressAttempt, 
    getLessonQuizzes, 
    getQuizAttempts, 
    getQuizById, 
    getuserAttempts, 
    getUserAttemptsForQuiz, 
    removeQuiz, 
    startQuizAttempt, 
    submitQuizAttempt, 
    updateQuiz, 
    updateQuizAttempt
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
router.route("/attempts/user/:quizId").get(isAuthenticated, getUserAttemptsForQuiz);
router.route("/attempt/start/:quizId").post(isAuthenticated, startQuizAttempt);
router.route("/attempt/update/:attemptId").patch(isAuthenticated, updateQuizAttempt);
router.route("/attempt/inprogress/:quizId").get(isAuthenticated, getInProgressAttempt);
router.route("/attempt/submit/:attemptId").post(isAuthenticated, submitQuizAttempt);

export default router;