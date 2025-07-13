import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  lectureTitle:{
    type:String,
    required:true,
  },
  lectureSubtitle:{type:String},
  videoUrl:{ type:String },
  publicId:{ type:String },
  isFinished: {
    type:Boolean, 
    default:false, 
  },
  lessons:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref: "Lesson"
    }
  ],
  quizzes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz"
    }
  ]
},{timestamps:true});

export const Lecture = mongoose.model("Lecture",lectureSchema);