import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
    lessonTitle: {
        type: String,
        required: true,
    }, 
    lessonDescription: {type:String}, 
    videoUrl: {type:String}, 
},{timestamps: true})

export const Lessons = mongoose.model("Lesson", LessonSchema)