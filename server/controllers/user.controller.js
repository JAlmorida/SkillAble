import { User } from "../models/user.model.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { CourseProgress } from "../models/courseProgress.js";
import { Course } from "../models/course.model.js";
import { Attempt } from "../models/attempt.model.js";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "enrolledCourses",
        populate: { path: "creator", select: "name photoUrl" },
      });
    if (!user) {
      return res.status(404).json({
        message: "Profile not found",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to load user",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, photoUrl: bodyPhotoUrl } = req.body;
    const profilePicture = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    let photoUrl = user.photoUrl; // Keep existing photo URL by default

    // If a new file is uploaded, upload and set photoUrl
    if (profilePicture) {
      if (user.photoUrl) {
        const publicId = user.photoUrl.split("/").pop().split(".")[0];
        deleteMediaFromCloudinary(publicId);
      }
      const cloudResponse = await uploadMedia(profilePicture.path);
      photoUrl = cloudResponse.secure_url;
    } else if (bodyPhotoUrl) {
      // If a photoUrl is provided in the body, use it
      photoUrl = bodyPhotoUrl;
    }

    const updatedData = { name, photoUrl };
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    }).select("-password");

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// Get all users with their enrolled courses
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate({
        path: "enrolledCourses",
        select: "courseTitle category courseLevel"
      });

    const usersWithProgress = await Promise.all(
      users.map(async (user) => {
        if (!user.enrolledCourses || user.enrolledCourses.length === 0) {
          return { ...user.toObject(), enrolledCourses: [] };
        }

        const enrolledCoursesWithProgress = await Promise.all(
          user.enrolledCourses.map(async (enrolledCourse) => {
            const course = await Course.findById(enrolledCourse._id).populate({
              path: 'lectures',
              populate: { path: 'lessons', select: 'isCompleted' }
            });

            if (!course) {
              return { ...enrolledCourse.toObject(), progress: 0 };
            }
            
            const progressDoc = await CourseProgress.findOne({ userId: user._id, courseId: course._id });
            const completedLessonsMap = new Map();
            if (progressDoc) {
              progressDoc.lectureProgress.forEach(lecProg => {
                lecProg.lessonProgress.forEach(lesProg => {
                  if (lesProg.completed) {
                    completedLessonsMap.set(lesProg.lessonId.toString(), true);
                  }
                });
              });
            }

            const allLessons = course.lectures.flatMap(lecture => lecture.lessons);
            const totalLessons = allLessons.length;
            const completedLessonsCount = allLessons.filter(lesson => completedLessonsMap.has(lesson._id.toString())).length;
            const progress = totalLessons > 0 
              ? Math.round((completedLessonsCount / totalLessons) * 100) 
              : 0;
            
            return {
              ...enrolledCourse.toObject(),
              progress
            };
          })
        );

        return {
          ...user.toObject(),
          enrolledCourses: enrolledCoursesWithProgress
        };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithProgress
    });
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users"
    });
  }
};

// Get detailed information about a specific user's course enrollments
export const getUserEnrollmentDetails = async (req, res) => {
  try {
    console.time("getUserEnrollmentDetails");
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "enrolledCourses",
        select: "courseTitle category courseLevel"
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const enrollmentDetails = await Promise.all(
      user.enrolledCourses.map(async (enrolledCourse) => {
        const course = await Course.findById(enrolledCourse._id).populate({
          path: 'lectures',
          populate: { path: 'lessons' }
        });

        if (!course) {
            return {
                course: enrolledCourse.toObject(),
                progress: { completionPercentage: 0, lastActivity: null, completed: false },
                quizzes: []
            };
        }

        const progressDoc = await CourseProgress.findOne({ userId, courseId: course._id });
        const completedLessonsMap = new Map();
        if (progressDoc) {
            progressDoc.lectureProgress.forEach(lecProg => {
                lecProg.lessonProgress.forEach(lesProg => {
                    if (lesProg.completed) {
                        completedLessonsMap.set(lesProg.lessonId.toString(), true);
                    }
                });
            });
        }
        
        const allLessons = course.lectures.flatMap(lecture => lecture.lessons);
        const totalLessons = allLessons.length;
        const completedLessonsCount = allLessons.filter(lesson => completedLessonsMap.has(lesson._id.toString())).length;
        
        const completionPercentage = totalLessons > 0 
          ? Math.round((completedLessonsCount / totalLessons) * 100) 
          : 0;
        
        const completed = completionPercentage === 100 && totalLessons > 0;

        return {
          course: {
            _id: course._id,
            courseTitle: course.courseTitle,
            category: course.category,
            courseLevel: course.courseLevel
          },
          progress: {
            completionPercentage,
            lastActivity: progressDoc ? progressDoc.updatedAt : null,
            completed
          },
          quizzes: [] // This can be enhanced later
        };
      })
    );

    // Get all quiz attempts for this user, deeply populated
    let attempts = await Attempt.find({ userId })
      .populate({
        path: "quizId",
        select: "quizTitle lesson courseId",
        populate: [
          { path: "lesson", select: "lessonTitle lecture" },
          { path: "courseId", select: "courseTitle" }
        ]
      })
      .select("quizId score total createdAt");

    // Second populate: lesson.lecture
    attempts = await Attempt.populate(attempts, {
      path: "quizId.lesson.lecture",
      select: "lectureTitle"
    });

    console.timeEnd("getUserEnrollmentDetails");
    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl,
      },
      enrollmentDetails,
      attempts
    });
  } catch (error) {
    console.error("getUserEnrollmentDetails error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user enrollment details"
    });
  }
};

export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.settings || {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { settings: req.body },
      { new: true }
    );
    res.json(user.settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    // Only allow "admin" or "student"
    if (!["admin", "student"].includes(newRole)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Prevent self-demotion: if user is admin and is trying to demote themselves
    if (newRole === "student" && req.user.id === userId) {
      return res.status(403).json({
        success: false,
        message: "Admins cannot demote themselves. Only another admin can change your role.",
      });
    }

    // If promoting to admin, check admin count
    if (newRole === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      const user = await User.findById(userId);
      if (user.role !== "admin" && adminCount >= 15) {
        return res.status(400).json({ success: false, message: "Maximum number of admins reached (15)" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true }
    ).select("-password");

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("changeUserRole error:", error);
    res.status(500).json({ success: false, message: "Failed to change user role" });
  }
};

