import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  lectureTitle:{
    type:String,
    required:true,
  },
  lectureSubtitle:{type:String},
  videoUrl:{ type:String },
  publicId:{ type:String },
  lessons:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref: "Lesson"
    }
  ]
},{timestamps:true});

export const Lecture = mongoose.model("Lecture",lectureSchema);