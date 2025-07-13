import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { CourseEnroll } from "../models/courseEnroll.model.js";
import { Lecture } from "../models/lecture.model.js";
import { CourseProgress } from "../models/courseProgress.js";

// Enroll user in a course (no payment)
export const courseEnroll = async (req, res) => {
  try {
    // Accept courseId from either body (POST) or params (GET)
    const courseId = req.body.courseId || req.params.courseId;
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
    let enrollment = await CourseEnroll.findOne({ userId, courseId });
    if (enrollment) {
      // If already enrolled, just return the enrollment info
      const isExpired = course.expiryEnabled && enrollment?.expiresAt && new Date() > enrollment.expiresAt;
      return res.status(200).json({
        ...enrollment.toObject(),
        isExpired
      });
    }

    // --- ENFORCE MAX ACTIVE ENROLLMENTS ---
    const allEnrollments = await CourseEnroll.find({ userId });
    const activeEnrollments = [];
    for (const enrollment of allEnrollments) {
      if (await isEnrollmentActive(enrollment)) {
        activeEnrollments.push(enrollment);
      }
    }
    if (activeEnrollments.length >= 10) {
      return res.status(400).json({
        message: "Course enrollment reached the maximum limit. Finish a course first."
      });
    }
    // --- END ENFORCE ---

    let expiresAt = null;
    if (course.expiryEnabled) {
      const enrolledAt = new Date();
      expiresAt = new Date(enrolledAt.getTime() + (course.expiryDays || 365) * 24 * 60 * 60 * 1000);
    }

    // Create enrollment record
    enrollment = new CourseEnroll({
      userId,
      courseId,
      expiresAt
    });
    await enrollment.save();

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

    const isExpired = course.expiryEnabled && enrollment?.expiresAt && new Date() > enrollment.expiresAt;
    res.status(200).json({
      ...enrollment.toObject(),
      isExpired
    });
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

    const enrollment = await CourseEnroll.findOne({ courseId, userId: userId });
    const isExpired = course.expiryEnabled && enrollment?.expiresAt && new Date() > enrollment.expiresAt;

    // Fetch course progress for this user and course
    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    const completed = courseProgress?.completed || false;

    return res.status(200).json({
      course,
      enrolled: !!enrollment,
      expiresAt: enrollment?.expiresAt,
      isExpired,
      completed
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

// Add this utility function
async function isEnrollmentActive(enrollment) {
  const now = new Date();
  const notExpired = !enrollment.expiresAt || now <= enrollment.expiresAt;
  // Check course progress for completion
  const courseProgress = await CourseProgress.findOne({ courseId: enrollment.courseId, userId: enrollment.userId });
  const notFinished = !courseProgress || !courseProgress.completed;
  return notExpired && notFinished;
}

// Update the controller to return active count
export const getAllEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user?._id || req.id;
    const enrollments = await CourseEnroll.find({ userId })
      .populate({
        path: "courseId",
        populate: { path: "creator", select: "name photoUrl" }
      });

    // Filter active enrollments
    const activeEnrollments = [];
    for (const enrollment of enrollments) {
      if (await isEnrollmentActive(enrollment)) {
        activeEnrollments.push(enrollment);
      }
    }

    return res.status(200).json({ 
      enrolledCourses: enrollments.map((e) => e.courseId),
      activeEnrollmentCount: activeEnrollments.length
    });
  } catch (error) {
    console.error("Get all enrolled courses error:", error);
    res.status(500).json({
      message: "Failed to fetch enrolled courses",
      error: error.message,
    });
  }
};

