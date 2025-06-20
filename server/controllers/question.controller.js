import { Question } from "../models/question.model.js";
import { Quiz } from "../models/quiz.model.js";

export const createQuestion = async (req, res) => {
    try {
        const { questionText, options, quizId } = req.body;

        if (!questionText || !options) {
            return res.status(400).json({
                success: false,
                message: "Please provide all the required fields"
            })
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Options should have 2 option mimmum"
            })
        }

        for (const option of options) {
            if (typeof option.text !== "string" || typeof option.isCorrect !== "boolean") {
                return res.status(400).json({
                    success: false,
                    message: "Each option should have 'text' as string and 'iscorrect' as boolean"
                })
            }
        }

        const quiz = await Quiz.findById(quizId)
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            })
        }

        const question = await Question.create({
            quizId,
            questionText,
            options
        })

        return res.status(201).json({
            success: true,
            message: " Question created successfully",
            data: question
        })
    } catch (error) {
        console.log("Error creating question:", error);
        return res.status(500).json({
            success: false,
            message: "Create questions error"
        })
    }
}

export const updateQuestion = async (req, res) => {
    try {
        const { questionText, options } = req.body;
        const { quizId } = req.params

        if (!questionText || !options) {
            return res.status(400).json({
                success: false,
                message: "Please provide question text and options"
            })
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Options should be an array with atleast two items"
            })
        }

        for (const option of options) {
            if (typeof option.text !== "string" || typeof option.isCorrect !== "boolean") {
                return res.status(400).json({
                    success: false,
                    message: "each option should have 'text' as string and 'isCorrect' as boolean "
                })
            }
        }

        const question = await Question.findByIdAndUpdate(
            id,
            { questiontext, options },
            { new: true }
        );

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Question updated successfully",
            data: question
        })
    } catch (error) {
        console.log("error updating question:", error);
        return res.status(500).json({
            success: false,
            message: "Update question error"
        })
    }
}

export const deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;

        const question = await Question.findByIdAndDelete(questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            })
        }

        return res.status(200).json({
            success: true, 
            message: "Question deleted successfully"
        })
    } catch (error) {
        console.log("Error deleting question:", error);
        return res.status(500).json({
            success: false,
            message: "Delete question error"
        })
    }
}

export const getQuizQuestions = async (req, res) => { 
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false, 
                message:"Quiz not found"
            })
        }

        const questions = await Question.find({ quizId });

        return res.status(200).json({
            success: true, 
            data: questions
        })

    } catch (error) {
        console.log("Error getting quiz questions:", error);
        return res.status(500).json({
            success: false, 
            message: "Get quiz questions error"
        })
    }
}