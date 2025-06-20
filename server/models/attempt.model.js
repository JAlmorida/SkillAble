import mongoose, { mongo } from "mongoose";

const attemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    score: {
        type: Number,
        required: true,
    },
    answers: [
        {
            questionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
                required: true
            },
            selectedOption: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Quesion.options'
            }
        }
    ],
    completedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

export const Attempt = mongoose.model('Attempt', attemptSchema)