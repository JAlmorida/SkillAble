import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get total published courses count
    const totalCourses = await Course.countDocuments({ isPublished: true });
    
    // Get monthly stats for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Get user growth data
    const userStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]).exec();

    // Get course growth data
    const courseStats = await Course.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          isPublished: true
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]).exec();

    // Get the current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Format the data for the frontend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedStats = months.map((month, index) => {
      const userData = userStats.find(stat => 
        stat._id.month === index + 1 && 
        stat._id.year === currentYear
      );
      const courseData = courseStats.find(stat => 
        stat._id.month === index + 1 && 
        stat._id.year === currentYear
      );
      
      return {
        month,
        users: userData ? userData.count : 0,
        courses: courseData ? courseData.count : 0
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        monthlyStats: formattedStats
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message
    });
  }
};
