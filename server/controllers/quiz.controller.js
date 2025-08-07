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

        const validatedMaxAttempts = Math.max(1, maxAttempts || 5);

        const lesson = await Lessons.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: "Lesson not found"
            })
        }

        const lecture = await Lecture.findOne({ lessons: lessonId });
        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture not found for this lesson"
            });
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
            courseId,
            lecture: lecture._id
        });

        // Update the lesson with the quiz reference
        await Lessons.findByIdAndUpdate(lessonId, { quiz: quiz._id });

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
            .populate("lecture", "lectureTitle");

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

        const attempts = await Attempt.find({ userId, quizId }).sort({ createdAt: -1 }); // Most recent first

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
  if (!attempt) {
    return res.status(200).json({ success: true, data: null });
  }
  return res.status(200).json({ success: true, data: attempt });
};

export const submitQuizAttempt = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const { answers } = req.body;
        const userId = req.id;

        // Check if user is authenticated
        if (!userId) {
            return res.status(401).json({ 
                message: "Authentication required",
                error: "No user ID found"
            });
        }

        // Find the attempt
        const attempt = await Attempt.findById(attemptId);

        if (!attempt) {
            return res.status(404).json({ message: "Attempt not found" });
        }

        // FIX: Convert both to strings for comparison
        const tokenUserIdString = userId.toString();
        const attemptUserIdString = attempt.userId.toString();

        if (tokenUserIdString !== attemptUserIdString) {
            return res.status(403).json({ 
                message: "Not authorized to submit this attempt",
                error: "User ID mismatch",
                tokenUserId: tokenUserIdString,
                attemptUserId: attemptUserIdString
            });
        }

        // Get quiz details
        const quiz = await Quiz.findById(attempt.quizId).populate('lesson');
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        // FIX: Get questions separately (not populated)
        const questions = await Question.find({ quizId: attempt.quizId });

        if (!questions || questions.length === 0) {
            return res.status(404).json({ message: "No questions found for this quiz" });
        }

        // Calculate score
        let correctAnswers = 0;
        const totalQuestions = questions.length;

        answers.forEach(userAnswer => {
            const question = questions.find(q => q._id.toString() === userAnswer.questionId);
            if (question) {
                const correctOption = question.options.find(opt => opt.isCorrect);
                if (correctOption && correctOption._id.toString() === userAnswer.selectedOption) {
                    correctAnswers++;
                }
            }
        });

        const score = Math.round((correctAnswers / totalQuestions) * 10);

        // Update attempt with final data
        attempt.answers = answers;
        attempt.score = score;
        attempt.status = "completed";
        attempt.completedAt = new Date();
        await attempt.save();

        // Mark all other in-progress attempts as completed
        await Attempt.updateMany(
          { userId, quizId: attempt.quizId, status: "in-progress", _id: { $ne: attempt._id } },
          { $set: { status: "completed", completedAt: new Date() } }
        );

        // Update course progress
        const courseProgress = await CourseProgress.findOne({ 
            courseId: quiz.courseId, 
            userId 
        });

        if (courseProgress) {
            // Find or create lectureProgress
            let lectureProgress = courseProgress.lectureProgress.find(
                lp => lp.lectureId && quiz.lecture && lp.lectureId.toString() === quiz.lecture.toString()
            );

            if (!lectureProgress) {
                lectureProgress = {
                    lectureId: quiz.lecture,
                    completed: false,
                    lessonProgress: [],
                    quizProgress: []
                };
                courseProgress.lectureProgress.push(lectureProgress);
            }

            // Update quiz progress
            let quizProgress = lectureProgress.quizProgress.find(
                qp => qp.quizId && quiz._id && qp.quizId.toString() === quiz._id.toString()
            );

            if (!quizProgress) {
                quizProgress = {
                    quizId: quiz._id,
                    attempted: true,
                    score: score,
                    completedAt: new Date()
                };
                lectureProgress.quizProgress.push(quizProgress);
            } else {
                quizProgress.attempted = true;
                quizProgress.score = score;
                quizProgress.completedAt = new Date();
            }

            // Find or create lessonProgress for the lesson associated with this quiz
            if (courseProgress && quiz.lesson) {
                let lessonProgress = lectureProgress.lessonProgress.find(
                    lp => lp.lessonId && lp.lessonId.toString() === quiz.lesson.toString()
                );
                if (!lessonProgress) {
                    lessonProgress = {
                        lessonId: quiz.lesson,
                        completed: true,
                        completedAt: new Date()
                    };
                    lectureProgress.lessonProgress.push(lessonProgress);
                } else {
                    lessonProgress.completed = true;
                    lessonProgress.completedAt = new Date();
                }
                await courseProgress.save();
            }

            // Check if lecture is completed
            // Get actual totals from the database, not from progress arrays
            const lecture = await Lecture.findById(quiz.lecture).populate('lessons');
            
            if (!lecture) {
                return res.status(404).json({ message: "Lecture not found" });
            }
            
            const actualTotalLessons = lecture.lessons.length;
            const actualTotalQuizzes = await Quiz.countDocuments({ lecture: quiz.lecture });
            
            const completedLessons = lectureProgress.lessonProgress.filter(lp => lp.completed).length;
            const completedQuizzes = lectureProgress.quizProgress.filter(qp => qp.attempted).length;

            lectureProgress.completed = (completedLessons === actualTotalLessons) && (completedQuizzes === actualTotalQuizzes);

            // Check if course is completed
            // Get all lectures in the course and check if all are completed
            const course = await Course.findById(quiz.courseId).populate('lectures');
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
        }

        // Return the result with score
        res.status(200).json({
            message: "Quiz submitted successfully",
            score: score,
            totalQuestions: totalQuestions,
            correctAnswers: correctAnswers,
            status: "completed"
        });

    } catch (error) {
        console.error("Error submitting quiz attempt:", error);
        res.status(500).json({ 
            message: "Failed to submit quiz attempt", 
            error: error.message 
        });
    }
};