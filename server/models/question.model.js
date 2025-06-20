import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    options: [
        {
            text: {
                type: String,
                required: true,
            },
            isCorrect: {
                type: Boolean,
                required: true
            }
        }
    ]
}, { timestamps: true })

export const Question = mongoose.model('Question', questionSchema)