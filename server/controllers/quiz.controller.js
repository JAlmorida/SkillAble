import { Attempt } from "../models/attempt.model.js";
import { Lessons } from "../models/lesson.model.js";
import { Question } from "../models/question.model.js";
import { Quiz } from "../models/quiz.model.js";

export const createQuiz = async (req, res) => {
    try {
        const { quizTitle, quizTimer } = req.body;
        const { lessonId } = req.params;
        const user = req.user;

        if (!quizTitle || !quizTimer) {
            return res.status(400).json({
                success: false,
                error: "Please provide all the required fields"
            })
        }

        const lesson = await Lessons.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: "Lesson not found"
            })
        }

        const existingQuiz = await Quiz.findOne({ lesson: lessonId });
        if (existingQuiz) {
            return res.status(400).json({
                success: false, 
                message: "A quiz already exists for this lesson"
            })
        }

        const quiz = await Quiz.create({
            quizTitle,
            quizTimer,
            creator: user.id,
            lesson: lessonId
        });

        return res.status(201).json({
            success: true,
            message: "Quiz created successfully",
            data: quiz,
        })

    } catch (error) {
        console.log("Error creating quiz: ", error);
        return res.status(500).json({
            success: false,
            message: "Create quiz error"
        })

    }
}

export const updateQuiz = async (req, res) => {
    try {
        const { quizTitle, quizTimer } = req.body;
        const quizId = req.params;
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "quiz not found"
            })
        }

        if (quizTitle) quiz.quizTitle = quizTitle;
        if (quizTimer) quiz.quizTimer = quizTimer;

        await quiz.save();

        return res.status(200).json({
            success: true,
            message: "Quiz updated successfully",
            data: quiz
        })
    } catch (error) {
        console.log("Error updating quiz", error);
        return res.status(500).json({
            success: false,
            error: "Update quiz error"
        })
    }
}

export const removeQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            })
        }

        //Delete all questions associated with this quiz
        const questions = await Question.find({ quiz: quizId });

        for (const question of questions) {
            await Question.findByIdAndDelete(question._id);
        }

        await Quiz.findByIdAndDelete(quizId);

        return res.status(200).json({
            success: true,
            message: "Quiz deleted successfully"
        })

    } catch (error) {
        console.log("Error deleting quiz", error);
        return res.status(500).json({
            message: "remove quiz error"
        })
    }
}

export const getLessonQuizzes = async (req, res) => {
    try {
        const { lessonId } = req.params;

        //check if lesson exist
        const lesson = await Lessons.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({
                message: "Lesson not found",
                success: false
            })
        }

        const quizzes = await Quiz.find({ lesson: lessonId })
            .populate("creator", "name email");

        return res.status(200).json({
            success: true,
            data: quizzes
        })
    } catch (error) {
        console.log("Error getting quizzes", error);
        return res.status(500).json({
            success: false,
            message: "Get Quizzes error"
        })
    }
}

export const getQuizById = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findById(quizId)
            .populate("creator", "name email")
            .populate("lesson", "lessonTitle")

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            })
        }

        return res.status(200).json({
            success: true,
            data: quiz
        })
    } catch (error) {
        console.log("Error getting quiz", error);
        return res.status(500).json({
            message: "Get quiz error",
            success: false
        })
    }
}

export const attemptQuiz = async (req, res) => {
    try {
        const userId = req.user.id;
        const { quizId, answers } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            })
        }

        const questions = await Question.find({ quiz: quizId });
        let score = 0;
        const answersArray = [];

        for (const question of questions) {
            const userAnswer = answers.find(
                (ans) => ans.questionId === question._id.toString()
            );
            if (userAnswer) {
                const selectedOption = question.options.id(userAnswer.selectedOption);
                if (selectedOption && selectedOption.isCorrect) {
                    score += 1;
                }
                answersArray.push({
                    questionId: question._id,
                    selectedOption: userAnswer.selectedOption
                });
            }
        }

        const attempt = await Attempt.create({
            userId,
            quizId,
            score,
            answers: answersArray
        });

        return res.status(200).json({
            success: true,
            message: "Quiz Attempted successfully",
            score
        })
    } catch (error) {
        console.log("Error attempting quiz", error);
        return res.status(500).json({
            success: false,
            message: "Attempt quiz error"
        })

    }
}

export const getuserAttempts = async (req, res) => {
    try {
        const userId = req.user.id;

        const attempts = await Attempt.find({ userId })
            .populate("quizId", "quizTitle quizDescription")

        return res.status(200).json({
            success: true,
            data: attempts
        })
    } catch (error) {
        console.log("Error getting user attempts: ", error);
        return res.status(500).json({
            success: false,
            message: "Get user Attempts error"
        })
    }
};

export const getAdminQuizzes = async (req, res) => {
    try {
        const userId = req.user.id;

        const quizzes = await Quiz.find({ creator: userId })
            .populate("lesson", "lessonTitle");

        return res.status(200).json({
            success: true,
            data: quizzes
        })
    } catch (error) {
        console.log("Error getting admin quizzes:", error);
        return res.status(500).json({
            success: false,
            message: "get admin quizzes error"
        })
    }
}

export const getQuizAttempts = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            })
        }

        const attempts = await Attempt.find({ quizId })
            .populate("userId", "name email")

        return res.status(200).json({
            success: true,
            data: attempts
        })
    } catch (error) {
        console.log("Error getting quiz attempts:", error);
        return res.status(500).json({
            success: false, 
            message:"Get quiz attempts error"
        })
    }
}