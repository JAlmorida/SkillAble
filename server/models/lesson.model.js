import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
    lessonTitle: {
        type: String,
        required: true,
    }, 
    lessonDescription: {type:String}, 
    videoUrl: {type:String}, 
    resourceFiles: [{
        name: String,
        url: String
    }],
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    lectureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture"
    },
    position: {
        type: Number
    }
},{timestamps: true})

export const Lessons = mongoose.model("Lesson", LessonSchema)