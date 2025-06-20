import { Course } from "../models/course.model.js";
import {
  deleteMediaFromCloudinary,
  uploadMedia,
} from "../utils/cloudinary.js";

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
      creator: req.user.id, // <-- use req.user.id instead of req.id
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
export const searchCourse = async (req, res) => {
  try {
    const { query = "", categories = [], sortByLevel = "" } = req.query;

    //create serach query
    const searchCriteria = {
      isPublished: true,
      $or: [
        { courseTitle: { $regex: query, $options: "i" } },
        { subTitle: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    };

    //if categories are selected
    if (categories.length > 0) {
      searchCriteria.category = { $in: categories };
    }

    //define sorting order
    const sortOptions = {};
    if (sortByLevel === "beginner") {
      sortOptions.courseLevel = 1; // ascending order for beginner
    } else if (sortByLevel === "medium") {
      sortOptions.courseLevel = 1; // ascending order for intermediate
    } else if (sortByLevel === "advanced") {
      sortOptions.courseLevel = 1; // descending order for advanced
    }

    let courses = await Course.find(searchCriteria)
      .sort(sortOptions)
      .populate({ path: "creator", select: "name photoUrl" });

    return res.status(200).json({
      success: true,
      courses: courses || [],
    });
  } catch (error) {
    console.log(error);
  }
};
export const getPublishedCourse = async (_, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate({
      path: "creator",
      select: "name photoUrl",
    });
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

    const updateData = {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      courseThumbnail: courseThumbnail?.secure_url,
    };

    course = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
    });

    return res.status(200).json({
      course,
      message: "Course updated succesfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create course, try again",
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
