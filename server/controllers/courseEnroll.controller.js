import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { CourseEnroll } from "../models/courseEnroll.model.js";
import { Lecture } from "../models/lecture.model.js";

// Enroll user in a course (no payment)
export const courseEnroll = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?._id || req.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if already enrolled
    const alreadyEnrolled = await CourseEnroll.findOne({ userId, courseId });
    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    // Create enrollment record
    await CourseEnroll.create({ userId, courseId });

    // Add course to user's enrolledCourses
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
    }

    // Add user to course's enrolledStudents
    if (!course.enrolledStudents.includes(userId)) {
      course.enrolledStudents.push(userId);
      await course.save();
    }

    // Optionally, unlock all lectures for the user
    if (course.lectures && course.lectures.length > 0) {
      await Lecture.updateMany(
        { _id: { $in: course.lectures } },
        { $set: { isPreviewFree: true } }
      );
    }

    res.status(200).json({ message: "Enrolled successfully" });
  } catch (error) {
    console.error("Enrollment error:", error);
    res
      .status(500)
      .json({ message: "Enrollment failed", error: error.message });
  }
};

// Get course detail with enrollment status
export const getCourseDetailWithEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id || req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator" }) 
      .populate({ path: "lectures" });

    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    const enrolled = await CourseEnroll.findOne({ userId, courseId });

    return res.status(200).json({
      course,
      enrolled: !!enrolled, // true if enrolled, false otherwise
    });
  } catch (error) {
    console.error("Course detail error:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch course details",
        error: error.message,
      });
  }
};

// Get all courses the user is enrolled in
export const getAllEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user?._id || req.id;
    const enrollments = await CourseEnroll.find({ userId }).populate(
      "courseId"
    );
    const enrolledCourses = enrollments.map((e) => e.courseId);

    return res.status(200).json({ enrolledCourses });
  } catch (error) {
    console.error("Get all enrolled courses error:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch enrolled courses",
        error: error.message,
      });
  }
};
