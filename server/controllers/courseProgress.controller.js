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

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const course = await Course.findById(courseId).populate({
      path: 'lectures',
      populate: { path: 'lessons' }
    });
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    
    // Convert the Mongoose documents to plain JavaScript objects.
    // This correctly turns all database IDs into simple strings.
    const courseDetailsForUser = course.toObject();
    const progressData = courseProgress 
      ? courseProgress.toObject() 
      : { completed: false, progress: [] };

    // Add the user-specific completion status to each lesson.
    const completedLessonsMap = new Map();
    if (progressData.lectureProgress) {
      progressData.lectureProgress.forEach(lecProg => {
        lecProg.lessonProgress.forEach(lesProg => {
          if (lesProg.completed) {
            completedLessonsMap.set(lesProg.lessonId.toString(), true);
          }
        });
      });
    }

    courseDetailsForUser.lectures.forEach(lecture => {
      lecture.lessons.forEach(lesson => {
        lesson.isCompleted = completedLessonsMap.has(lesson._id.toString());
      });
    });

    return res.status(200).json({
      data: {
        userId,
        courseId,
        courseDetails: courseDetailsForUser,
        completed: progressData.completed,
        progress: progressData.lectureProgress || [],
      }
    });
  } catch (error) {
    console.error("Error in getCourseProgress:", error);
    return res.status(500).json({ 
      message: "Failed to get course progress", 
      error: error.message 
    });
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
    // (Assume you have a way to get totalLessons and totalQuizzes for this lecture)
    const totalLessons = lectureProgress.lessonProgress.length; // or fetch from DB
    const totalQuizzes = lectureProgress.quizProgress.length;   // or fetch from DB

    lectureProgress.completed = isLectureCompleted(lectureProgress, totalLessons, totalQuizzes);

    // Check if all lectures are completed for the course
    courseProgress.completed = courseProgress.lectureProgress.every(lp => lp.completed);

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
      return res.status(404).json({ message: "Course progress not found" });
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
      (qp) => qp.quizId.toString() === quizId
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

    // Check if all lessons and quizzes are completed for this lecture
    const totalLessons = lectureProgress.lessonProgress.length; // or fetch from DB
    const totalQuizzes = lectureProgress.quizProgress.length;   // or fetch from DB

    lectureProgress.completed = isLectureCompleted(lectureProgress, totalLessons, totalQuizzes);

    // Check if all lectures are completed for the course
    courseProgress.completed = courseProgress.lectureProgress.every(lp => lp.completed);

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

