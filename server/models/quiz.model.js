import mongoose from 'mongoose'

const quizSchema = new mongoose.Schema({
    quizTitle: {
        type: String,
        required: true,
    },
    quizTimer: {
        type: Number, // in minutes
        required: true
    }, 
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true 
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson', 
        required: true 
    }
}, {timestamps: true })

export const Quiz = mongoose.model("Quiz", quizSchema)