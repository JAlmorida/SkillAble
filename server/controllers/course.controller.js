import { Course } from "../models/course.model.js";
import {
  deleteMediaFromCloudinary,
  uploadMedia,
} from "../utils/cloudinary.js";
import { StreamChat } from "stream-chat";
import { Lecture } from "../models/lecture.model.js";
import { Quiz } from "../models/quiz.model.js";
import { Attempt } from "../models/attempt.model.js";
import { Question } from "../models/question.model.js";
import { CourseEnroll } from "../models/courseEnroll.model.js";
import { CourseProgress } from "../models/courseProgress.js";
import { Lessons } from "../models/lesson.model.js";
import mongoose from "mongoose";
import { updateStreamChannelImage } from "../utils/stream.js";

const streamClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);

export const createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;
    if (!courseTitle || !category) {
      return res.status(400).json({
        message: "Course title and category is required",
      });
    }
    const course = await Course.create({
      courseTitle,
      category,
      creator: req.user.id,
      deadlineEnabled: req.body.deadlineEnabled,
      deadline: req.body.deadlineEnabled ? req.body.deadline : null,
    });

    return res.status(201).json({
      course,
      message: "Course created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create course, try again",
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // 1. Delete the course and get its data (for lectures array)
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    console.log("Deleted course:", courseId);

    // 2. Delete all lectures for this course
    if (course.lectures && course.lectures.length > 0) {
      const lectureResult = await Lecture.deleteMany({ _id: { $in: course.lectures } });
      console.log("Deleted lectures:", lectureResult);
    }

    // 3. Delete all lessons for this course
    const lessonResult = await Lessons.deleteMany({ courseId });
    console.log("Deleted lessons:", lessonResult);

    // 4. Delete all quizzes for this course
    const quizzes = await Quiz.find({ courseId });
    const quizIds = quizzes.map(q => q._id);
    const quizResult = await Quiz.deleteMany({ courseId });
    console.log("Deleted quizzes:", quizResult);

    // 5. Delete all questions and attempts for those quizzes
    if (quizIds.length > 0) {
      const questionResult = await Question.deleteMany({ quizId: { $in: quizIds } });
      const attemptResult = await Attempt.deleteMany({ quizId: { $in: quizIds } });
      console.log("Deleted questions:", questionResult);
      console.log("Deleted attempts:", attemptResult);
    }

    // 6. Delete all enrollments for this course
    const enrollResult = await CourseEnroll.deleteMany({ courseId });
    console.log("Deleted enrollments:", enrollResult);

    // 7. Delete all course progress for this course
    const progressResult = await CourseProgress.deleteMany({ courseId });
    console.log("Deleted course progress:", progressResult);

    // 8. Delete the group chat from Stream
    const channelId = `course-${courseId}`;
    const channel = streamClient.channel("messaging", channelId);
    let streamError = null;
    try {
      await channel.delete();
      console.log("Deleted Stream channel:", channelId);
    } catch (err) {
      if (err.message && err.message.includes("not found")) {
        console.log(`Stream channel ${channelId} does not exist or was already deleted.`);
      } else {
        console.error("Error deleting Stream channel:", err.message);
        streamError = err;
      }
    }

    if (streamError) {
      return res.status(500).json({ message: "Course deleted, but failed to delete group chat from Stream." });
    }

    return res.status(200).json({ message: "Course and all related data deleted successfully." });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(500).json({ message: "Failed to delete course", error: error.message });
  }
};

export const getPublishedCourse = async (_, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate({
        path: "creator",
        select: "name photoUrl",
      })
      .populate({
        path: "category",
        select: "name",
      }); // <-- Now populates category name!
    if (!courses) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get published courses course, try again",
    });
  }
};

export const getCreatorCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const courses = await Course.find({ creator: userId });
    if (!courses) {
      return res.status(404).json({
        course: [],
        message: "Course not found",
      });
    }
    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create course, try again",
    });
  }
};

export const editCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      expiryEnabled,
      expiryDuration,
      expiryUnit,
      expiryDays,
    } = req.body;
    const thumbnail = req.file;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "course not found",
      });
    }
    let courseThumbnail;
    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      courseThumbnail = await uploadMedia(thumbnail.path);
    }

    // Update expiry fields
    course.expiryEnabled = expiryEnabled === "true" || expiryEnabled === true;
    if (course.expiryEnabled) {
      course.expiryDuration = expiryDuration;
      course.expiryUnit = expiryUnit;
      course.expiryDays = expiryDays;
    } else {
      course.expiryDuration = null;
      course.expiryUnit = null;
      course.expiryDays = null;
    }

    // Update other fields
    course.courseTitle = courseTitle;
    course.subTitle = subTitle;
    course.description = description;
    course.category = category;
    course.courseLevel = courseLevel;
    if (courseThumbnail?.secure_url) {
      course.courseThumbnail = courseThumbnail.secure_url;
    }

    await course.save();

    // --- Update Stream channel image if thumbnail changed ---
    if (courseThumbnail?.secure_url) {
      try {
        const channelId = `course-${courseId}`;
        const channel = streamClient.channel("messaging", channelId);
        // Fetch the current channel data to preserve the name
        await channel.query();
        const currentName = channel.data.name || channel.data.courseTitle || "Course Group Chat";
        await channel.update({
          image: courseThumbnail.secure_url,
          name: currentName, // <-- preserve the name!
        });
        console.log("Updated Stream channel image and preserved name for", channelId);
      } catch (err) {
        console.error("Failed to update Stream channel image:", err.message);
      }
    }
    // --- End update ---

    return res.status(200).json({
      course,
      message: "Course updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to update course, try again",
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate("creator", "name photoUrl");
    if (!course) {
      return res.status(404).json({
        message: "course not found!",
      });
    }
    // Remove old deadline logic
    // const isExpired = course.deadlineEnabled && course.deadline && new Date() > new Date(course.deadline);

    // Instead, just return the course object (expiry is per-user, not global)
    return res.status(200).json({
      course,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get course by id , try again",
    });
  }
};

//publish unpublish course logic
export const togglePublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { publish } = req.query; //true or false
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    //publish status based on query parameter
    course.isPublished = publish === "true";
    await course.save();

    const statusMessage = course.isPublished ? "Published" : "Unpublished";
    return res.status(200).json({
      message: `Course is ${statusMessage}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to update status, try again",
    });
  }
};

export const searchCourses = async (req, res) => {
  try {
    const query = req.query.query || '';
    // Only search published courses
    const courses = await Course.find({
      isPublished: true,
      $or: [
        { courseTitle: { $regex: query, $options: 'i' } },
        { subTitle: { $regex: query, $options: 'i' } }
      ]
    })
    .populate({ path: "category", select: "name" })
    .limit(10);

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
