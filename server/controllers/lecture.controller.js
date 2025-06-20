import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { deleteVideoFromCloudinary } from "../utils/cloudinary.js";

export const createLecture = async (req, res) => {
    try {
      const { lectureTitle } = req.body;
      const { courseId } = req.params;
  
      if (!lectureTitle || !courseId) {
        return res.status(400).json({
          message: "Lecture title is required",
        });
      }
  
      //create lecture
      const lecture = await Lecture.create({ lectureTitle });
  
      const course = await Course.findById(courseId);
      if (course) {
        course.lectures.push(lecture._id);
        await course.save();
      }
  
      return res.status(200).json({
        lecture,
        message: "Lecture create successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Failed to create lecture, try again",
      });
    }
  };
  export const getCourseLecture = async (req, res) => {
    try {
      const { courseId } = req.params;
      const course = await Course.findById(courseId).populate("lectures");
      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }
      return res.status(200).json({
        lectures: course.lectures,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Failed to create lecture, try again",
      });
    }
  };
  export const editLecture = async (req, res) => {
    try {
      const { lectureTitle, lectureSubtitle,  videoInfo } =
        req.body;
      const { courseId, lectureId } = req.params;
      const lecture = await Lecture.findById(lectureId);
      if (!lecture) {
        return res.status(404).json({
          message: "Lecture not found",
        });
      }
      //update lecture
      if (lectureSubtitle) lecture.lectureSubtitle = lectureSubtitle;
      if (lectureTitle) lecture.lectureTitle = lectureTitle;
      if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
      if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
  
      await lecture.save();
  
      //Ensure the course still has the lecture id if it was not already added
      const course = await Course.findById(courseId);
      if (course && !course.lectures.includes(lecture._id)) {
        course.lectures.push(lecture._id);
        await course.save();
      }
      return res.status(200).json({
        lecture,
        message: "Lecture update success",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Failed to update lecture, try again",
      });
    }
  };
  export const removeLecture = async (req, res) => {
    try {
      const { lectureId } = req.params;
      const lecture = await Lecture.findByIdAndDelete(lectureId);
      if (!lecture) {
        return res.status(404).json({
          message: "Lecture not found",
        });
      }
      // delete the lecture from cloudinary
      if (lecture.publicId) {
        await deleteVideoFromCloudinary(lecture.publicId);
      }
  
      //Remove the lecture reference from the associated course
      await Course.updateOne(
        { lectures: lectureId }, //find the course that contains the lecture
        { $pull: { lectureId } } // remove the lecture id from the lectures array
      );
  
      return res.status(200).json({
        message: "Lecture remove successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Failed to remove lecture, try again",
      });
    }
  };
  export const getLectureById = async (req, res) => {
    try {
      const { lectureId } = req.params;
      const lecture = await Lecture.findById(lectureId);
      if (!lecture) {
        return res.status(404).json({
          message: "Lecture not found",
        });
      }
      return res.status(200).json({
        lecture,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Failed to get lecture by id, try again",
      });
    }
  };
  