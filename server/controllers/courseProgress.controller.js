import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.js";
import { Lecture } from "../models/lecture.model.js";
import { Lessons } from "../models/lesson.model.js";
import { Quiz } from "../models/quiz.model.js";
import { Attempt } from "../models/attempt.model.js";


//Course Progress
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId).populate({
      path: 'lectures',
      populate: { 
        path: 'lessons',
        populate: { path: 'quiz' }
      }
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const actualLectureIds = course.lectures.map(l => l._id.toString());

    // Find the user's course progress
    const courseProgress = await CourseProgress.findOne({ courseId, userId });

    // Defensive: if no progress, return a safe default response
    if (!courseProgress) {
      const courseDetailsForUser = course.toObject();
      return res.status(200).json({
        data: {
          userId,
          courseId,
          courseDetails: courseDetailsForUser,
          completed: false,
          progress: [],
        }
      });
    }

    // Filter lectureProgress to only include actual lectures
    let filteredLectureProgress = [];
    if (courseProgress.lectureProgress) {
      filteredLectureProgress = courseProgress.lectureProgress.filter(lp =>
        lp.lectureId && actualLectureIds.includes(lp.lectureId.toString())
      );
    }

    // Check if all visible lectures are completed
    // Create a map of lecture progress for quick lookup
    const lectureProgressMap = new Map();
    filteredLectureProgress.forEach(lp => {
      lectureProgressMap.set(lp.lectureId.toString(), lp);
    });

    // Check if all actual lectures are completed
    const allLecturesCompleted = actualLectureIds.length > 0 && 
      actualLectureIds.every(lectureId => {
        const lectureProgress = lectureProgressMap.get(lectureId);
        return lectureProgress && lectureProgress.completed;
      });

    // Set course completion status
    courseProgress.completed = allLecturesCompleted;
    if (allLecturesCompleted && !courseProgress.completedAt) {
      courseProgress.completedAt = new Date();
    }
    await courseProgress.save();

    const courseDetailsForUser = course.toObject();

    return res.status(200).json({
      data: {
        userId,
        courseId,
        courseDetails: courseDetailsForUser,
        completed: allLecturesCompleted,
        progress: filteredLectureProgress,
      }
    });
  } catch (error) {
    console.error("Error in getCourseProgress:", error);
    return res.status(500).json({ message: "Failed to get course progress", error: error.message });
  }
};
export const updateCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { completed } = req.body;
    const userId = req.id;

    let courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      return res.status(404).json({ message: "Course progress not found" });
    }

    // Update all lecture progress if marking as complete
    if (completed) {
      courseProgress.lectureProgress.forEach(lecture => {
        lecture.viewed = true;
      });
    }
    
    courseProgress.completed = completed; 
    courseProgress.completedAt = completed ? new Date() : null;

    await courseProgress.save();
    
    return res.status(200).json({
      message: completed ? "Course marked as completed" : "Course marked as incomplete",
      data: { courseId, completed }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update course progress",
      error: error.message
    });
  }
}
//Lesson Progress 
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

    // Find or create lectureProgress
    let lectureProgress = courseProgress.lectureProgress.find(
      (lp) => lp.lectureId.toString() === lectureId
    );
    if (!lectureProgress) {
      lectureProgress = {
        lectureId,
        completed: false,
        lessonProgress: [],
        quizProgress: []
      };
      courseProgress.lectureProgress.push(lectureProgress);
    }

    // Find or create lessonProgress
    let lessonProgress = lectureProgress.lessonProgress.find(
      (lp) => lp.lessonId.toString() === lessonId
    );
    if (!lessonProgress) {
      lessonProgress = {
        lessonId,
        completed: true,
        completedAt: new Date()
      };
      lectureProgress.lessonProgress.push(lessonProgress);
    } else {
      lessonProgress.completed = true;
      lessonProgress.completedAt = new Date();
    }

    // Check if all lessons and quizzes are completed for this lecture
    // Get actual totals from the database, not from progress arrays
    const lecture = await Lecture.findById(lectureId).populate('lessons');
    const actualTotalLessons = lecture.lessons.length;
    
    // Count quizzes for all lessons in this lecture
    const lessonIds = lecture.lessons.map(lesson => lesson._id);
    const actualTotalQuizzes = await Quiz.countDocuments({ lesson: { $in: lessonIds } });

    lectureProgress.completed = isLectureCompleted(lectureProgress, actualTotalLessons, actualTotalQuizzes);

    // Check if all lectures are completed for the course
    // Get all lectures in the course and check if all are completed
    const course = await Course.findById(courseId).populate({
      path: 'lectures',
      populate: { path: 'lessons' }
    });
    const allLectureIds = course.lectures.map(l => l._id.toString());
    
    // Create a map of lecture progress for quick lookup
    const lectureProgressMap = new Map();
    courseProgress.lectureProgress.forEach(lp => {
      lectureProgressMap.set(lp.lectureId.toString(), lp);
    });
    
    // Check if all lectures are completed
    courseProgress.completed = allLectureIds.length > 0 && 
      allLectureIds.every(lectureId => {
        const lectureProgress = lectureProgressMap.get(lectureId);
        return lectureProgress && lectureProgress.completed;
      });

    await courseProgress.save();

    return res.status(200).json({ message: "Lesson progress updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update lesson progress", error: error.message });
  }
};
export const getLessonProgress = async (req, res) => {
  try {
    const { courseId, lectureId, lessonId } = req.params;
    const userId = req.id;

    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      return res.status(404).json({ message: "Course progress not found" });
    }

    const lectureProgress = courseProgress.lectureProgress.find(
      (lp) => lp.lectureId.toString() === lectureId
    );
    if (!lectureProgress) {
      return res.status(404).json({ message: "Lecture progress not found" });
    }

    const completed = lectureProgress.completedLessons.includes(lessonId);

    return res.status(200).json({ completed });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get lesson progress", error: error.message });
  }
};
//Lecture Progress
export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    let courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      return res.status(404).json({ message: "Course progress not found" });
    }

    let lectureProgress = courseProgress.lectureProgress.find(
      (lp) => lp.lectureId.toString() === lectureId
    );
    if (!lectureProgress) {
      lectureProgress = {
        lectureId,
        completed: true,
        completedAt: new Date(),
        lessonProgress: [],
        quizProgress: []
      };
      courseProgress.lectureProgress.push(lectureProgress);
    } else {
      lectureProgress.completed = true;
      lectureProgress.completedAt = new Date();
    }

    // Optionally, check if all lectures are completed and update courseProgress.completed

    await courseProgress.save();
    return res.status(200).json({ message: "Lecture marked as completed." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update lecture progress", error: error.message });
  }
};
export const getLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      return res.status(404).json({ message: "Course progress not found" });
    }

    const lectureProgress = courseProgress.lectureProgress.find(
      (lp) => lp.lectureId.toString() === lectureId
    );
    if (!lectureProgress) {
      return res.status(404).json({ message: "Lecture progress not found" });
    }

    return res.status(200).json({ data: lectureProgress });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get lecture progress", error: error.message });
  }
};
//Quiz Progress 
export const updateQuizProgress = async (req, res) => {
  try {
    const { courseId, lectureId, quizId } = req.params;
    const { score } = req.body;
    const userId = req.id;

    let courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      // Create a new CourseProgress document if it doesn't exist
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        lectureProgress: [],
      });
    }

    // Find or create lectureProgress
    let lectureProgress = courseProgress.lectureProgress.find(
      (lp) => lp.lectureId.toString() === lectureId
    );
    if (!lectureProgress) {
      lectureProgress = {
        lectureId,
        completed: false,
        lessonProgress: [],
        quizProgress: []
      };
      courseProgress.lectureProgress.push(lectureProgress);
    }

    // Find or create quizProgress
    let quizProgress = lectureProgress.quizProgress.find(
      (qp) => qp.quizId.toString() === quizId.toString()
    );
    if (!quizProgress) {
      quizProgress = {
        quizId,
        attempted: true,
        score,
        completedAt: new Date()
      };
      lectureProgress.quizProgress.push(quizProgress);
    } else {
      quizProgress.attempted = true;
      quizProgress.score = score;
      quizProgress.completedAt = new Date();
    }

    // 1. Get the lessonId for this quiz
    const quizDoc = await Quiz.findById(quizId);
    const lessonId = quizDoc.lesson?.toString();
    if (lessonId) {
      // 2. Find or create lessonProgress for this lesson
      let lessonProgress = lectureProgress.lessonProgress.find(
        (lp) => lp.lessonId.toString() === lessonId
      );
      if (!lessonProgress) {
        lessonProgress = {
          lessonId,
          completed: true,
          completedAt: new Date()
        };
        lectureProgress.lessonProgress.push(lessonProgress);
      } else {
        lessonProgress.completed = true;
        lessonProgress.completedAt = new Date();
      }
    }

    // 3. Check if all lessons and quizzes are completed for this lecture
    // Get actual totals from the database, not from progress arrays
    const lecture = await Lecture.findById(lectureId).populate({
      path: 'lessons',
      populate: { path: 'quiz' }
    });
    const actualTotalLessons = lecture.lessons.length;
    
    // Count lessons that have quizzes
    const actualTotalQuizzes = lecture.lessons.filter(lesson => lesson.quiz).length;

    lectureProgress.completed = isLectureCompleted(lectureProgress, actualTotalLessons, actualTotalQuizzes);

    // 4. Check if all lectures are completed for the course
    // Get all lectures in the course and check if all are completed
    const course = await Course.findById(courseId).populate({
      path: 'lectures',
      populate: { path: 'lessons' }
    });
    const allLectureIds = course.lectures.map(l => l._id.toString());
    
    // Create a map of lecture progress for quick lookup
    const lectureProgressMap = new Map();
    courseProgress.lectureProgress.forEach(lp => {
      lectureProgressMap.set(lp.lectureId.toString(), lp);
    });
    
    // Check if all lectures are completed
    courseProgress.completed = allLectureIds.length > 0 && 
      allLectureIds.every(lectureId => {
        const lectureProgress = lectureProgressMap.get(lectureId);
        return lectureProgress && lectureProgress.completed;
      });

    await courseProgress.save();

    return res.status(200).json({ message: "Quiz progress updated." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update quiz progress", error: error.message });
  }
};
export const getQuizProgress = async (req, res) => {
  try {
    const { courseId, lectureId, quizId } = req.params;
    const userId = req.id;

    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      return res.status(404).json({ message: "Course progress not found" });
    }

    const lectureProgress = courseProgress.lectureProgress.find(
      (lp) => lp.lectureId.toString() === lectureId
    );
    if (!lectureProgress || !lectureProgress.quizProgress) {
      return res.status(404).json({ message: "Lecture or quiz progress not found" });
    }

    const quizProgress = lectureProgress.quizProgress.find(
      (qp) => qp.quizId.toString() === quizId
    );
    if (!quizProgress) {
      return res.status(404).json({ message: "Quiz progress not found" });
    }

    return res.status(200).json({ data: quizProgress });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get quiz progress", error: error.message });
  }
};
//getting all course progress for user and admin side page 
function isLectureCompleted(lectureProgress, totalLessons, totalQuizzes) {
  const lessonsDone = lectureProgress.lessonProgress.filter(lp => lp.completed).length === totalLessons;
  const quizzesDone = lectureProgress.quizProgress.filter(qp => qp.attempted).length === totalQuizzes;
  return lessonsDone && quizzesDone;
}
// Get all users' progress for a course (admin)
export const getAllUsersCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const progress = await CourseProgress.find({ courseId })
      .populate('userId', 'name email');
    return res.status(200).json({ data: progress });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get all users' course progress", error: error.message });
  }
};

export const getCourseProgressHistory = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id; // from auth middleware

    // 1. Get the course with lectures and lessons populated
    const course = await Course.findById(courseId).populate({
      path: 'lectures',
      populate: { path: 'lessons' }
    });

    if (!course) return res.status(404).json({ message: "Course not found" });

    // 2. Get all quizzes for the lessons in this course
    const allLessonIds = course.lectures.flatMap(lec => lec.lessons.map(l => l._id));
    const quizzes = await Quiz.find({ lesson: { $in: allLessonIds } });

    // 3. Get all attempts for this user and these quizzes
    const quizIds = quizzes.map(q => q._id);
    const attempts = await Attempt.find({ userId, quizId: { $in: quizIds } });

    // 4. Build lookup maps for quick access
    const quizByLesson = new Map();
    quizzes.forEach(q => quizByLesson.set(q.lesson.toString(), q));
    const attemptByQuiz = new Map();
    attempts.forEach(a => attemptByQuiz.set(a.quizId.toString(), a));

    // 5. Build the response structure
    const result = course.lectures.map(lecture => ({
      lectureId: lecture._id,
      lectureTitle: lecture.lectureTitle,
      lessons: lecture.lessons.map(lesson => {
        const quiz = quizByLesson.get(lesson._id.toString());
        let quizObj = null;
        if (quiz) {
          const attempt = attemptByQuiz.get(quiz._id.toString());
          quizObj = {
            quizId: quiz._id,
            quizTitle: quiz.quizTitle,
            score: attempt ? attempt.score : 0,
            total: 10, // You can fetch total from your quiz/question model if needed
            status: attempt ? "completed" : "inprogress"
          };
        }
        return {
          lessonId: lesson._id,
          lessonTitle: lesson.lessonTitle,
          quiz: quizObj
        };
      })
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to get progress history", error: err.message });
  }
};

