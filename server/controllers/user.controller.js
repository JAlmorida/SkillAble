import { User } from "../models/user.model.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { CourseProgress } from "../models/courseProgress.js";
import { Course } from "../models/course.model.js";
import mongoose from "mongoose";

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
    // Get all users with their enrolled courses
    const users = await User.find()
      .select("-password")
      .populate({
        path: "enrolledCourses",
        select: "courseTitle category courseLevel lectures"
      });

    // For each user, get their course progress
    const usersWithProgress = await Promise.all(
      users.map(async (user) => {
        if (!user.enrolledCourses || user.enrolledCourses.length === 0) {
          return {
            ...user.toObject(),
            enrolledCourses: []
          };
        }

        // Get all progress records for this user
        const progressRecords = await CourseProgress.find({
          userId: user._id
        });

        // Add progress data to each enrolled course
        const enrolledCoursesWithProgress = user.enrolledCourses.map(course => {
          const courseProgress = progressRecords.find(
            record => record.courseId.toString() === course._id.toString()
          );

          let progress = 0;
          if (courseProgress) {
            progress = courseProgress.progress || 0;
            if (courseProgress.completed) {
              progress = 100;
            }
          }

          return {
            ...course.toObject(),
            progress
          };
        });

        // Return user with updated courses
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
    console.log(error);
    
  }
};
// Get detailed information about a specific user's course enrollments
export const getUserEnrollmentDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get the user's course progress data
    const courseProgress = await CourseProgress.find({ userId });
    
    // Get user with enrolled courses
    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "enrolledCourses",
        select: "courseTitle category courseLevel lectures"
      });
    
    // Calculate progress for each course
    const enrollmentDetails = await Promise.all(
      user.enrolledCourses.map(async (course) => {
        const progress = courseProgress.find(p => 
          p.courseId.toString() === course._id.toString()
        );

        let completionPercentage = 0;
        let lastActivity = null;
        let completed = false;

        if (progress) {
          completed = progress.completed;
          completionPercentage = progress.progress || 0;
          if (progress.completed) {
            completionPercentage = 100;
          }
        }

        return {
          course: {
            _id: course._id,
            courseTitle: course.courseTitle,
            category: course.category,
            courseLevel: course.courseLevel
          },
          progress: {
            completionPercentage,
            lastActivity,
            completed
          },
          quizzes: [] // or actual quizzes if you have them
        };
      })
    );

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl,
      },
      enrollmentDetails
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user enrollment details"
    });
  }
};
