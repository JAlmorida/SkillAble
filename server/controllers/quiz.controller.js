import { Attempt } from "../models/attempt.model.js";
import { Lessons } from "../models/lesson.model.js";
import { Question } from "../models/question.model.js";
import { Quiz } from "../models/quiz.model.js";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { CourseProgress } from "../models/courseProgress.js";

export const createQuiz = async (req, res) => {
    try {
        const { quizTitle, quizTimer, maxAttempts = 5 } = req.body;
        const { lessonId } = req.params;
        const user = req.user;

        if (!quizTitle || !quizTimer) {
            return res.status(400).json({
                success: false,
                error: "Please provide all the required fields"
            })
        }

        // Ensure maxAttempts is at least 1
        const validatedMaxAttempts = Math.max(1, maxAttempts || 5);

        const lesson = await Lessons.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: "Lesson not found"
            })
        }

        const existingQuiz = await Quiz.findOne({ lesson: lessonId });
        if (existingQuiz) {
            return res.status(400).json({
                success: false, 
                message: "A quiz already exists for this lesson"
            })
        }

        const courseId = lesson.courseId;

        const quiz = await Quiz.create({
            quizTitle,
            quizTimer,
            maxAttempts: validatedMaxAttempts,
            creator: user.id,
            lesson: lessonId,
            courseId
        });

        return res.status(201).json({
            success: true,
            message: "Quiz created successfully",
            data: quiz,
        })

    } catch (error) {
        console.log("Error creating quiz: ", error);
        return res.status(500).json({
            success: false,
            message: "Create quiz error"
        })

    }
}

export const updateQuiz = async (req, res) => {
    try {
        const { quizTitle, quizTimer, maxAttempts } = req.body;
        const quizId = req.params;
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "quiz not found"
            })
        }

        if (quizTitle) quiz.quizTitle = quizTitle;
        if (quizTimer) quiz.quizTimer = quizTimer;
        if (maxAttempts) quiz.maxAttempts = Math.max(1, maxAttempts);

        await quiz.save();

        return res.status(200).json({
            success: true,
            message: "Quiz updated successfully",
            data: quiz
        })
    } catch (error) {
        console.log("Error updating quiz", error);
        return res.status(500).json({
            success: false,
            error: "Update quiz error"
        })
    }
}

export const removeQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            })
        }

        //Delete all questions associated with this quiz
        const questions = await Question.find({ quiz: quizId });

        for (const question of questions) {
            await Question.findByIdAndDelete(question._id);
        }

        await Quiz.findByIdAndDelete(quizId);

        return res.status(200).json({
            success: true,
            message: "Quiz deleted successfully"
        })

    } catch (error) {
        console.log("Error deleting quiz", error);
        return res.status(500).json({
            message: "remove quiz error"
        })
    }
}

export const getLessonQuizzes = async (req, res) => {
    try {
        const { lessonId } = req.params;

        //check if lesson exist
        const lesson = await Lessons.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({
                message: "Lesson not found",
                success: false
            })
        }

        const quizzes = await Quiz.find({ lesson: lessonId })
            .populate("creator", "name email");

        return res.status(200).json({
            success: true,
            data: quizzes
        })
    } catch (error) {
        console.log("Error getting quizzes", error);
        return res.status(500).json({
            success: false,
            message: "Get Quizzes error"
        })
    }
}

export const getQuizById = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findById(quizId)
            .populate("creator", "name email")
            .populate("lesson", "lessonTitle")

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            })
        }

        return res.status(200).json({
            success: true,
            data: quiz
        })
    } catch (error) {
        console.log("Error getting quiz", error);
        return res.status(500).json({
            message: "Get quiz error",
            success: false
        })
    }
}

export const attemptQuiz = async (req, res) => {
    try {
        const userId = req.user.id;
        const { quizId } = req.params;
        const { answers } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        // Check if user has reached maximum attempts (use quiz.maxAttempts or default to 5)
        const userAttempts = await Attempt.find({ userId, quizId });
        const maxAttempts = quiz.maxAttempts || 5;
        if (userAttempts.length >= maxAttempts) {
            return res.status(400).json({ 
                success: false, 
                message: "Maximum attempts reached for this quiz" 
            });
        }

        const questions = await Question.find({ quizId: quizId });
        let score = 0;
        const answersArray = [];

        for (const question of questions) {
            const userAnswer = answers.find(
                (ans) => ans.questionId === question._id.toString()
            );

            if (userAnswer && userAnswer.selectedOption) {
                const selectedOption = question.options.find(
                    (opt) => opt._id.toString() === userAnswer.selectedOption
                );
                if (selectedOption && selectedOption.isCorrect) {
                    score += 1;
                }
                answersArray.push({
                    questionId: question._id,
                    selectedOption: userAnswer.selectedOption
                });
            }
        }
        
        await Attempt.create({
            userId,
            quizId,
            score,
            total: questions.length,
            answers: answersArray
        });

        const lessonId = quiz.lesson;
        const lecture = await Lecture.findOne({ lessons: lessonId });
        if (!lecture) throw new Error("Could not find parent lecture for the lesson.");
        
        const course = await Course.findOne({ lectures: lecture._id });
        if (!course) throw new Error("Could not find parent course for the lecture.");

        let courseProgress = await CourseProgress.findOne({ userId, courseId: course._id });
        if (!courseProgress) {
            courseProgress = new CourseProgress({ userId, courseId: course._id, lectureProgress: [] });
        }

        let lectureProgress = courseProgress.lectureProgress.find(lp => lp.lectureId.equals(lecture._id));
        if (!lectureProgress) {
            lectureProgress = { lectureId: lecture._id, lessonProgress: [], quizProgress: [] };
            courseProgress.lectureProgress.push(lectureProgress);
        }

        let lessonProgress = lectureProgress.lessonProgress.find(lp => lp.lessonId.equals(lessonId));
        if (!lessonProgress) {
            lessonProgress = { lessonId, completed: true, completedAt: new Date() };
            lectureProgress.lessonProgress.push(lessonProgress);
        } else {
            lessonProgress.completed = true;
            lessonProgress.completedAt = new Date();
        }
        
        // Find or create the progress for this specific quiz and mark it as attempted
        let quizProgress = lectureProgress.quizProgress.find(qp => qp.quizId.equals(quizId));
        if (!quizProgress) {
            quizProgress = { quizId, attempted: true, score, completedAt: new Date() };
            lectureProgress.quizProgress.push(quizProgress);
        } else {
            quizProgress.attempted = true;
            quizProgress.score = score;
            quizProgress.completedAt = new Date();
        }

        await courseProgress.save();

        return res.status(200).json({
            success: true,
            message: "Quiz Attempted successfully",
            score
        });
    } catch (error) {
        console.error("Error attempting quiz:", error);
        return res.status(500).json({
            success: false,
            message: "Attempt quiz error",
            error: error.message
        });
    }
};

export const getuserAttempts = async (req, res) => {
    try {
        const userId = req.user.id;

        const attempts = await Attempt.find({ userId })
            .populate("quizId", "quizTitle quizDescription")

        return res.status(200).json({
            success: true,
            data: attempts
        })
    } catch (error) {
        console.log("Error getting user attempts: ", error);
        return res.status(500).json({
            success: false,
            message: "Get user Attempts error"
        })
    }
};

export const getAdminQuizzes = async (req, res) => {
    try {
        const userId = req.user.id;

        const quizzes = await Quiz.find({ creator: userId })
            .populate("lesson", "lessonTitle");

        return res.status(200).json({
            success: true,
            data: quizzes
        })
    } catch (error) {
        console.log("Error getting admin quizzes:", error);
        return res.status(500).json({
            success: false,
            message: "get admin quizzes error"
        })
    }
}

export const getQuizAttempts = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            })
        }

        const attempts = await Attempt.find({ quizId })
            .populate("userId", "name email")

        return res.status(200).json({
            success: true,
            data: attempts
        })
    } catch (error) {
        console.log("Error getting quiz attempts:", error);
        return res.status(500).json({
            success: false,
            message: "Get quiz attempts error"
        })
    }
}

export const getUserAttemptsForQuiz = async (req, res) => {
    const { quizId } = req.params;
    const userId = req.user?.id || req.user?._id || req.id;
    if (!quizId || quizId === "undefined") {
        return res.status(400).json({ message: "Quiz ID is required" });
    }
    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        const attempts = await Attempt.find({ userId, quizId })
            .sort({ createdAt: -1 }); // Most recent first

        const maxAttempts = quiz.maxAttempts || 5;

        return res.status(200).json({
            success: true,
            data: {
                attempts,
                attemptCount: attempts.length,
                maxAttempts: maxAttempts,
                remainingAttempts: Math.max(0, maxAttempts - attempts.length)
            }
        });
    } catch (error) {
        console.log("Error getting user attempts for quiz: ", error);
        return res.status(500).json({
            success: false,
            message: "Get user attempts for quiz error"
        });
    }
};

// Start or resume an attempt
export const startQuizAttempt = async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user.id;
  let attempt = await Attempt.findOne({ userId, quizId, status: 'in-progress' });
  if (!attempt) {
    attempt = await Attempt.create({ userId, quizId, status: 'in-progress', startTime: new Date() });
  }
  res.json(attempt);
};

// Update attempt (answers, remaining time)
export const updateQuizAttempt = async (req, res) => {
  const { attemptId } = req.params;
  const { answers, remainingTime } = req.body;
  const attempt = await Attempt.findByIdAndUpdate(
    attemptId,
    { answers, remainingTime },
    { new: true }
  );
  res.json(attempt);
};

// Get in-progress attempt
export const getInProgressAttempt = async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user.id;
  const attempt = await Attempt.findOne({ userId, quizId, status: 'in-progress' });
  res.json(attempt);
};

export const submitQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }
    if (attempt.status === 'completed') {
      return res.status(400).json({ message: 'Attempt already submitted' });
    }

    // Calculate score
    const questions = await Question.find({ quiz: attempt.quizId });
    let score = 0;
    for (const question of questions) {
      const userAnswer = attempt.answers.find(
        (ans) => ans.questionId.toString() === question._id.toString()
      );
      if (userAnswer) {
        const selectedOption = question.options.find(
          (opt) => opt._id.toString() === userAnswer.selectedOption.toString()
        );
        if (selectedOption && selectedOption.isCorrect) {
          score += 1;
        }
      }
    }

    attempt.score = score;
    attempt.status = 'completed';
    attempt.completedAt = new Date();
    await attempt.save();

    // --- UPDATE COURSE PROGRESS ---
    // Find the quiz to get lesson and course info
    const quiz = await Quiz.findById(attempt.quizId);
    if (quiz) {
      const userId = attempt.userId;
      const courseId = quiz.courseId;
      const lessonId = quiz.lesson;
      // Find the lecture containing this lesson
      const lecture = await (await import('../models/lecture.model.js')).Lecture.findOne({ lessons: lessonId });
      if (lecture) {
        const lectureId = lecture._id;
        let courseProgress = await CourseProgress.findOne({ courseId, userId });
        if (!courseProgress) {
          // Create if not exists
          courseProgress = new CourseProgress({
            userId,
            courseId,
            completed: false,
            lectureProgress: [],
          });
        }
        // Find or create lectureProgress
        let lectureProgress = courseProgress.lectureProgress.find(
          (lp) => lp.lectureId.toString() === lectureId.toString()
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
          (qp) => qp.quizId.toString() === quiz._id.toString()
        );
        if (!quizProgress) {
          quizProgress = {
            quizId: quiz._id,
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
        await courseProgress.save();
      }
    }
    // --- END UPDATE COURSE PROGRESS ---

    res.json({
      message: 'Quiz submitted successfully',
      score,
      total: questions.length,
      attempt,
    });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({ message: 'Failed to submit quiz attempt', error: error.message });
  }
};