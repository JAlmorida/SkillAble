import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.js";

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // step-1 fetch the user course progress
    let courseProgress = await CourseProgress.findOne({
      courseId,
      userId,
    }).populate("courseId");

    const courseDetails = await Course.findById(courseId).populate({
      path: "lectures",
      populate: {
        path: "lessons"
      }
    });

    if (!courseDetails) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Step-2 If no progress found, return course details with an empty progress
    if (!courseProgress) {
      return res.status(200).json({
        data: {
          courseDetails,
          progress: [],
          completed: false,
        },
      });
    }

    // Step-3 Return the user's course progress alog with course details
    return res.status(200).json({
      data: {
        courseDetails,
        progress: courseProgress.lectureProgress,
        completed: courseProgress.completed,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    // fetch or create course progress
    let courseProgress = await CourseProgress.findOne({ courseId, userId });

    if (!courseProgress) {
      // If no progress exist, create a new record
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        lectureProgress: [],
      });
    }

    // find the lecture progress in the course progress
    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lecture) => lecture.lectureId === lectureId
    );

    if (lectureIndex !== -1) {
      // if lecture already exist, update its status
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    } else {
      // Add new lecture progress
      courseProgress.lectureProgress.push({
        lectureId,
        viewed: true,
      });
    }

    // if all lecture is complete
    const lectureProgressLength = courseProgress.lectureProgress.filter(
      (lectureProg) => lectureProg.viewed
    ).length;

    const course = await Course.findById(courseId);

    if (course.lectures.length === lectureProgressLength)
      courseProgress.completed = true;

    await courseProgress.save();

    return res.status(200).json({
      message: "Lecture progress updated successfully.",
    });
  } catch (error) {
    console.log(error);
  }
};

export const markAsCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress)
      return res.status(404).json({ message: "Course progress not found" });

    courseProgress.lectureProgress.map(
      (lectureProgress) => (lectureProgress.viewed = true)
    );
    courseProgress.completed = true;
    await courseProgress.save();
    return res.status(200).json({ message: "Course marked as completed." });
  } catch (error) {
    console.log(error);
  }
};

export const markAsInCompleted = async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.id;
  
      const courseProgress = await CourseProgress.findOne({ courseId, userId });
      if (!courseProgress)
        return res.status(404).json({ message: "Course progress not found" });
  
      courseProgress.lectureProgress.map(
        (lectureProgress) => (lectureProgress.viewed = false)
      );
      courseProgress.completed = false;
      await courseProgress.save();
      return res.status(200).json({ message: "Course marked as incompleted." });
    } catch (error) {
      console.log(error);
    }
  };
export const updateLessonProgress = async (req, res) => {
  try {
    const { courseId, lectureId, lessonId } = req.params;
    const userId = req.id;

    let courseProgress = await CourseProgress.findOne({ courseId, userId });

    if (!courseProgress) {
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        lectureProgress: [],
      });
    }

    let lectureProgress = courseProgress.lectureProgress.find(
      (lecture) => lecture.lectureId === lectureId
    );

    if (!lectureProgress) {
      lectureProgress = {
        lectureId,
        viewed: false,
        completedLessons: []
      };
      courseProgress.lectureProgress.push(lectureProgress);
    }

    if (!lectureProgress.completedLessons.includes(lessonId)) {
      lectureProgress.completedLessons.push(lessonId);
    }

    const lecture = await Course.findById(courseId)
      .populate({
        path: 'lectures',
        match: { _id: lectureId },
        populate: {
          path: 'lessons'
        }
      });

    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found"
      });
    }

    const totalLessons = lecture.lectures[0]?.lessons?.length || 0;

    if (lectureProgress.completedLessons.length === totalLessons) {
      lectureProgress.viewed = true;
    }

    const allLecturesCompleted = courseProgress.lectureProgress.every(
      (lecture) => lecture.viewed
    );

    if (allLecturesCompleted) {
      courseProgress.completed = true;
    }

    await courseProgress.save();

    return res.status(200).json({
      message: "Lesson progress updated successfully.",
    });

  } catch (error) {
    console.error("Lesson progress update error:", error);
    return res.status(500).json({
      message: "Failed to update lesson progress",
      error: error.message
    });
  }
};

export const markLessonIncomplete = async (req, res) => {
  try {
    const { courseId, lectureId, lessonId } = req.params;
    const userId = req.id;

    let courseProgress = await CourseProgress.findOne({ courseId, userId });

    if (!courseProgress) {
      return res.status(404).json({
        message: "Course Progress not found"
      })
    }

    let lectureProgress = courseProgress.lectureProgress.find(
      (lecture) => lecture.lectureId === lectureId
    )

    if (!lectureProgress) {
      return res.status(404).json({
        message: "Lecture progress not found"
      })
    }

    //remove the lesson from completed lessons
    lectureProgress.completedLessons = lectureProgress.completedLessons.filter(
      id => id !== lessonId
    )

    //if no lessons are completed, mark lecture as not viewed
    if (lectureProgress.completedLessons.length === 0) {
      lectureProgress.viewed = false;
    }

    //check if all lectures are still completed
    const allLecturesCompleted = courseProgress.lectureProgress.every(
      (lecture) => lecture.viewed
    )

    if (!allLecturesCompleted) {
      courseProgress.completed = false;
    }

    await courseProgress.save();

    return res.status(200).json({
      message: "Lesson marked as incomplete successfully"
    })

  } catch (error) {
    console.error("lesson incomplete error:", error);
    return res.status(500).json({
      message: "Failed to mark lessin as incomplete", 
      error: error.message
    })
  }
}