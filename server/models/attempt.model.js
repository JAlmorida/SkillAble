import mongoose, { mongo } from "mongoose";

const attemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number },
    answers: [
        {
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
            selectedOption: { type: mongoose.Schema.Types.ObjectId }
        }
    ],
    status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    remainingTime: { type: Number }, // in seconds
    completedAt: { type: Date }
}, { timestamps: true });

attemptSchema.index({ userId: 1 });
attemptSchema.index({ quizId: 1 });

export const Attempt = mongoose.model('Attempt', attemptSchema)