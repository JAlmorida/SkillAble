import { Lecture } from "../models/lecture.model.js";
import { Lessons } from "../models/lesson.model.js";

export const createLessons = async (req, res) => {
    try {
      const { lectureId } = req.params;
      const { lessonTitle } = req.body;
  
      if (!lessonTitle) {
        return res.status(400).json({
          message: "Lesson Title is Required"
        });
      }
  
      // Create the lesson
      const lesson = await Lessons.create({
        lessonTitle,
      });
  
      // Add lesson to lecture
      const lecture = await Lecture.findById(lectureId);
      if (!lecture) {
        return res.status(404).json({
          message: "Lecture not found"
        });
      }
      lecture.lessons.push(lesson._id);
      await lecture.save(); 
  
      return res.status(200).json({
        message: "Lesson created and added to the lecture",
        lesson
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Failed to create lesson, try again"
      });
    }
  };
  export const getLectureLessons = async (req, res) => {
    try {
      const { lectureId } = req.params;
      //populate lessons array with lesson documents 
      const lecture = await Lecture.findById(lectureId).populate('lessons');
      if (!lecture) {
        return res.status(404).json({
          message: "Lecture not found",
        })
      }
      return res.status(200).json({
        lessons: lecture.lessons
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Failed to get lessons, try again"
      })
    }
  }
  export const editLesson = async (req, res) => {
    try {
      const { lectureId, lessonId } = req.params;
      const { lessonTitle, lessonDescription, videoUrl } = req.body;
  
      const lesson = await Lessons.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          message: "Lesson not found",
        })
      }
  
      if (lessonTitle) lesson.lessonTitle = lessonTitle;
      if (lessonDescription) lesson.lessonDescription = lessonDescription;
      if (videoUrl) lesson.videoUrl = videoUrl;
  
      await lesson.save();
  
      return res.status(200).json({
        message: "Lesson updated successfully",
        lesson,
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Failed to update lesson, try again",
      })
    }
  }
  export const getLessonById = async (req, res) => {
    try {
      console.log("Getting lesson with ID:", req.params.lessonId);
      const lesson = await Lessons.findById(req.params.lessonId);
      
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        lesson
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Error fetching lesson"
      });
    }
  };
  export const removeLesson = async (req, res) => {
    try {
      const { lessonId } = req.params;
  
      //find and delete the lesson
      const lesson = await Lessons.findByIdAndDelete(lessonId)
      if (!lesson) {
        return res.status(404).json({
          message: "Lesson not found",
        })
      }
      await Lecture.updateMany(
        { lessons: lessonId },
        { $pull: { lessons: lessonId } }
      )
      return res.status(200).json({
        message: "Lesson removed successfully", 
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Failed to remove lesson, try again"
      })
    }
  }
