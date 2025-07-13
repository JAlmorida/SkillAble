import { Course } from "../models/course.model.js";
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

    // Find the lecture to get the course context
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found"
      });
    }

    // Find the course that contains this lecture
    const course = await Course.findOne({ lectures: lectureId });
    if (!course) {
      return res.status(404).json({
        message: "Course for this lecture not found"
      });
    }

    // Create the lesson with the required courseId
    const lesson = await Lessons.create({
      lessonTitle,
      courseId: course._id, // Add the courseId
    });

    // Add lesson to lecture
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
    const { lessonTitle, lessonDescription, videoUrl, resourceFiles } = req.body;

    const lesson = await Lessons.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      })
    }

    if (lessonTitle) lesson.lessonTitle = lessonTitle;
    if (lessonDescription) lesson.lessonDescription = lessonDescription;
    if (videoUrl) lesson.videoUrl = videoUrl;
    if (resourceFiles) lesson.resourceFiles = resourceFiles;

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
    const { lessonId } = req.params;
    const lesson = await Lessons.findById(lessonId).populate('courseId');
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }
    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch lesson", error: error.message });
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
export const createLesson = async (req, res) => {
  try {
    const { courseId, lessonTitle, lessonDescription, videoUrl } = req.body;
    const lesson = new Lessons({
      lessonTitle,
      lessonDescription,
      videoUrl,
      courseId
    });
    await lesson.save();
    res.status(201).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create lesson", error: error.message });
  }
};
