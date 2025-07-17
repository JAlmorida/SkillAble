import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
    useGetUserAttemptsForQuizQuery, 
    useGetInProgressAttemptQuery,
    useStartQuizAttemptMutation,
    useUpdateQuizAttemptMutation,
    useSubmitQuizAttemptMutation
} from '@/features/api/quizApi';
import { setUser } from '@/features/authSlice';
import { AlertCircle, Clock, RotateCcw, Save } from 'lucide-react';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AttemptQuizQuestionCard from './AttemptQuizQuestionCard';
import { useGetCourseProgressQuery } from '@/features/api/courseProgressApi';
import { useUpdateQuizProgressMutation } from "@/features/api/courseProgressApi";

const QuizQuestion = ({ quizDetails, quizQuestions, isExpired, deadline, courseId, lectureId }) => {
    const [quizStarted, setQuizStarted] = useState(false);
    const [remainingTime, setRemainingTime] = useState(null);
    const [userAnswers, setUserAnswers] = useState([]);
    const [currentAttemptId, setCurrentAttemptId] = useState(null);
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Refs to prevent re-renders and manage intervals
    const lastSaveTimeRef = useRef(0);
    const saveTimeoutRef = useRef(null);
    const timerIntervalRef = useRef(null);
    const autoSaveIntervalRef = useRef(null);
    const retryCountRef = useRef(0);

    // API hooks for attempt management
    const [startQuizAttempt] = useStartQuizAttemptMutation();
    const [updateQuizAttempt] = useUpdateQuizAttemptMutation();
    const [submitQuizAttempt, { isLoading }] = useSubmitQuizAttemptMutation();
    const [updateQuizProgress] = useUpdateQuizProgressMutation();

    // Fetch user's attempts for this quiz
    const skipAttempts = !quizDetails?._id;
    const { data: userAttemptsData, refetch: refetchAttempts } =
      useGetUserAttemptsForQuizQuery(quizDetails?._id, { skip: skipAttempts });
    const attempts = userAttemptsData?.data?.attempts || [];
    const completedAttempt = attempts.find(a => a.status === "completed");
    const attemptsUsed = userAttemptsData?.data?.attemptCount ?? 0;
    const maxAttempts = userAttemptsData?.data?.maxAttempts ?? 0;
    const attemptsLeft = maxAttempts - attemptsUsed;

    // Check for existing in-progress attempt
    const { data: inProgressAttempt, isLoading: inProgressLoading } = useGetInProgressAttemptQuery(quizDetails?._id, {
        skip: !quizDetails?._id
    });

    const canResumeInProgress = !!inProgressAttempt && inProgressAttempt._id;
    const attemptsExhausted = maxAttempts > 0 && attemptsLeft <= 0 && !canResumeInProgress;

    const skipProgress = !courseId;
    const { data: courseProgressData, refetch: refetchCourseProgress } = useGetCourseProgressQuery(courseId, { skip: skipProgress });

    // Cleanup function for all intervals
    const cleanupIntervals = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        if (autoSaveIntervalRef.current) {
            clearInterval(autoSaveIntervalRef.current);
            autoSaveIntervalRef.current = null;
        }
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
    }, []);

    // Debounced save progress function
    const saveProgress = useCallback(async (answers, time, force = false) => {
        if (!currentAttemptId) return;
        const now = Date.now();
        const timeSinceLastSave = now - lastSaveTimeRef.current;
        if (!force && timeSinceLastSave < 5000) {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(() => {
                saveProgress(answers, time, true);
            }, 5000 - timeSinceLastSave);
            return;
        }
        try {
            await updateQuizAttempt({
                attemptId: currentAttemptId,
                answers: answers,
                remainingTime: time
            }).unwrap();
            lastSaveTimeRef.current = now;
            retryCountRef.current = 0;
        } catch (error) {
            if (retryCountRef.current < 3) {
                retryCountRef.current++;
                setTimeout(() => {
                    saveProgress(answers, time, true);
                }, 2000 * retryCountRef.current);
            } else {
                retryCountRef.current = 0;
            }
        }
    }, [currentAttemptId, updateQuizAttempt]);

    // Initialize quiz state based on existing attempt
    useEffect(() => {
        if (inProgressAttempt && inProgressAttempt._id && currentAttemptId !== inProgressAttempt._id) {
            setCurrentAttemptId(inProgressAttempt._id);
            setUserAnswers(inProgressAttempt.answers || []);
            setRemainingTime(inProgressAttempt.remainingTime || (quizDetails?.quizTimer * 60));
        } else if (quizDetails?.quizTimer && !inProgressAttempt && !quizStarted) {
            setRemainingTime(quizDetails.quizTimer * 60);
        }
    }, [inProgressAttempt, quizDetails, quizStarted, currentAttemptId]);

    // Auto-save answers and time periodically
    useEffect(() => {
        if (quizStarted && currentAttemptId && userAnswers.length > 0) {
            autoSaveIntervalRef.current = setInterval(() => {
                saveProgress(userAnswers, remainingTime);
            }, 30000);
            return () => {
                if (autoSaveIntervalRef.current) {
                    clearInterval(autoSaveIntervalRef.current);
                    autoSaveIntervalRef.current = null;
                }
            };
        }
    }, [quizStarted, currentAttemptId, saveProgress, userAnswers, remainingTime]);

    // Save progress when answers change (debounced)
    useEffect(() => {
        if (quizStarted && currentAttemptId && userAnswers.length > 0) {
            saveProgress(userAnswers, remainingTime);
        }
    }, [userAnswers, saveProgress, quizStarted, currentAttemptId, remainingTime]);

    // Timer effect with proper cleanup
    useEffect(() => {
        if (quizStarted && remainingTime > 0) {
            timerIntervalRef.current = setInterval(() => {
                setRemainingTime(prevTime => {
                    const newTime = prevTime - 1;
                    if (newTime % 120 === 0 && currentAttemptId) {
                        saveProgress(userAnswers, newTime);
                    }
                    return newTime;
                });
            }, 1000);
        } else if (quizStarted && remainingTime === 0) {
            cleanupIntervals();
            toast.warning("Time is up!");
            submitQuiz();
        }
        return cleanupIntervals;
    }, [quizStarted, remainingTime, currentAttemptId, userAnswers, saveProgress, cleanupIntervals]);

    // Beforeunload warning
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (quizStarted && userAnswers.length > 0) {
                e.preventDefault();
                e.returnValue = 'You have unsaved quiz progress. Are you sure you want to leave?';
                return e.returnValue;
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [quizStarted, userAnswers.length]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupIntervals();
        };
    }, [cleanupIntervals]);

    const submitQuiz = useCallback(async () => {
        if (!quizDetails || !quizDetails._id) {
            toast.error("Quiz details are missing. Cannot submit quiz.");
            return;
        }
        if (!currentAttemptId) {
            toast.error("No active attempt found. Cannot submit quiz.");
            return;
        }
        console.log(
            "Clicked SUBMIT: Submitting attempt",
            {
                attemptId: currentAttemptId,
                userId: user?._id,
                quizId: quizDetails?._id,
                timestamp: new Date().toISOString()
            }
        );
        await saveProgress(userAnswers, remainingTime, true);
        try {
            const response = await submitQuizAttempt({ 
                attemptId: currentAttemptId, 
                answers: userAnswers 
            }).unwrap();
            toast.success("Quiz completed! Progress updated.");
            dispatch(setUser({
                ...user,
                attemptedQuizzes: [...(user?.attemptedQuizzes || []), quizDetails._id]
            }));
            await updateQuizProgress({
                courseId,
                lectureId, // <-- use the prop, not quizDetails.lectureId
                quizId: quizDetails._id,
                score: response.score, // or whatever your backend expects
            });
            console.log("Quiz submitted, refetching course progress...");
            await refetchCourseProgress();
            navigate(`/course-progress/${courseId}/quiz/${quizDetails._id}/quiz-results`, {
                state: { 
                    score: response.score || response.data?.score || 0,
                    total: quizQuestions?.length, 
                    questions: quizQuestions, 
                    userAnswers 
                }
            });
        } catch (error) {
            toast.error("Failed to submit quiz");
        }
    }, [submitQuizAttempt, currentAttemptId, quizDetails?._id, user, dispatch, navigate, quizQuestions?.length, courseId, quizQuestions, userAnswers, saveProgress, remainingTime, updateQuizProgress, quizDetails.lectureId, lectureId, refetchCourseProgress]);

    const handleAnswerChange = useCallback((questionId, selectedOption) => {
        setUserAnswers(prevAnswers => {
            const existingAnswerIndex = prevAnswers.findIndex(
                (answer) => answer.questionId === questionId
            );
            if (existingAnswerIndex >= 0) {
                // Create a new object instead of mutating
                const newAnswers = [...prevAnswers];
                newAnswers[existingAnswerIndex] = {
                    ...newAnswers[existingAnswerIndex],
                    selectedOption
                };
                return newAnswers;
            } else {
                return [...prevAnswers, { questionId, selectedOption }];
            }
        });
    }, []);

    const startQuiz = async () => {
        if (inProgressAttempt && inProgressAttempt._id) {
            setCurrentAttemptId(inProgressAttempt._id);
            setUserAnswers(inProgressAttempt.answers || []);
            setRemainingTime(inProgressAttempt.remainingTime || (quizDetails?.quizTimer * 60));
            setQuizStarted(true);
            toast.info("Resuming your previous quiz attempt");
            console.log(
                "Clicked ATTEMPT: Resuming attempt",
                {
                    attemptId: inProgressAttempt._id,
                    userId: inProgressAttempt.userId,
                    quizId: inProgressAttempt.quizId,
                    startTime: inProgressAttempt.startTime,
                    timestamp: new Date().toISOString()
                }
            );
            return;
        }
        try {
            const response = await startQuizAttempt(quizDetails._id).unwrap();
            const attemptId = response._id || response.id;
            if (!attemptId) throw new Error("Failed to get attempt ID from response");
            setCurrentAttemptId(attemptId);
            setUserAnswers([]);
            setRemainingTime(quizDetails.quizTimer * 60);
            setQuizStarted(true);
            lastSaveTimeRef.current = Date.now();
            toast.success("Quiz started!");
            console.log(
                "Clicked ATTEMPT: Started new attempt",
                {
                    attemptId: response._id,
                    userId: response.userId,
                    quizId: response.quizId,
                    startTime: response.startTime,
                    timestamp: new Date().toISOString()
                }
            );
        } catch (error) {
            toast.error("Failed to start quiz");
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const timePercentage = quizStarted && quizDetails?.quizTimer ?
        (remainingTime / (quizDetails.quizTimer * 60)) * 100 : 100;

    // Helper to calculate days left
    const getDaysLeft = () => {
        if (!deadline) return null;
        const now = new Date();
        const expires = new Date(deadline);
        const diffMs = expires - now;
        if (diffMs <= 0) return 0;
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    };

    const daysLeft = getDaysLeft();

    useEffect(() => {
        refetchAttempts();
    }, []);

    if (inProgressLoading) {
        return (
            <Card className="w-full max-w-7xl mx-auto mt-8 border-none bg-slate-900 shadow-lg rounded-2xl">
                <CardContent className="p-8">
                    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
                        <p className="text-gray-300">Checking for existing attempts...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-7xl mx-auto mt-8 border-none bg-white dark:bg-slate-900 shadow-lg rounded-2xl">
            <CardContent className="p-4 sm:p-8">
                {!quizStarted ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh]">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                            {quizDetails?.quizTitle}
                        </h2>
                        {inProgressAttempt && (
                            <div className="w-full max-w-md mb-6 p-4 bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-500/30 rounded-lg">
                                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 mb-2">
                                    <RotateCcw className="h-4 w-4" />
                                    <span className="font-semibold">Continue Quiz</span>
                                </div>
                                <p className="text-sm text-orange-700 dark:text-orange-200">
                                    You have an unfinished attempt. Click "Continue Quiz" to resume where you left off.
                                </p>
                                {inProgressAttempt.answers && inProgressAttempt.answers.length > 0 && (
                                    <p className="text-xs text-orange-700 dark:text-orange-200 mt-1">
                                        You've answered {inProgressAttempt.answers.length} questions so far.
                                    </p>
                                )}
                            </div>
                        )}
                        <div className="w-full text-center mb-6 space-y-2">
                            <p className="text-base sm:text-lg text-gray-800 dark:text-gray-200">
                                This quiz contains <span className="font-semibold">{quizQuestions?.length}</span> questions
                            </p>
                            <p className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                                <Clock className="h-4 w-4" />
                                Time Limit: <span className="font-semibold">{quizDetails?.quizTimer}</span> minutes
                            </p>
                            {!isExpired && deadline && daysLeft !== null && (
                                <p className="mt-2 text-blue-600 dark:text-blue-400 font-medium text-sm">
                                    {daysLeft === 0
                                        ? "Expires today"
                                        : `You have ${daysLeft} day${daysLeft > 1 ? "s" : ""} left to attempt this quiz.`}
                                </p>
                            )}
                            {!isExpired && !deadline && (
                                <p className="mt-2 text-green-600 dark:text-green-400 font-medium text-sm">
                                    No expiry (unlimited access)
                                </p>
                            )}
                            {!isExpired && (
                                <p className={`mt-2 font-semibold text-sm ${attemptsLeft > 0 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
                                    Attempts left: {attemptsLeft} / {maxAttempts}
                                </p>
                            )}
                        </div>
                        <Button
                            onClick={startQuiz}
                            size="lg"
                            className={`w-full max-w-xs py-3 rounded-lg text-base font-semibold transition ${
                                isExpired || (attemptsExhausted && !canResumeInProgress)
                                    ? 'bg-red-600 text-white cursor-not-allowed hover:bg-red-700'
                                    : inProgressAttempt
                                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                            disabled={isExpired || (attemptsExhausted && !canResumeInProgress)}
                        >
                            {isExpired
                                ? "Course Expired"
                                : attemptsExhausted
                                    ? "No Attempts Left"
                                    : inProgressAttempt 
                                        ? "Continue Quiz"
                                        : "Start Quiz"}
                        </Button>
                    </div>
                ) : (
                    <div className="w-full flex flex-col">
                        {/* --- Timer and Title --- */}
                        <div className="bg-white dark:bg-slate-900 pb-4">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-3 gap-2">
                                <span className="text-base font-semibold text-blue-600 dark:text-blue-300">
                                    {quizQuestions?.length || 0} Question{quizQuestions?.length === 1 ? '' : 's'}
                                </span>
                                <Badge
                                    variant="outline"
                                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white"
                                >
                                    <Clock className="h-4 w-4" />
                                    <span className={`${remainingTime < 60 ? 'text-red-500 dark:text-red-400' : ''}`}>
                                        {formatTime(remainingTime)}
                                    </span>
                                </Badge>
                            </div>
                            <Progress value={timePercentage} className="h-2" />
                        </div>

                        {/* --- Questions List --- */}
                        <div className="my-4 min-h-[50vh] max-h-[70vh] overflow-y-auto space-y-4 pr-2">
                            {quizQuestions && quizQuestions.length > 0 ? (
                                quizQuestions.map((question) => {
                                    const selectedOption = userAnswers.find(ans => ans.questionId === question._id)?.selectedOption;
                                    return (
                                        <AttemptQuizQuestionCard
                                            key={question._id}
                                            question={question}
                                            onAnswerChange={handleAnswerChange}
                                            selectedOption={selectedOption}
                                        />
                                    );
                                })
                            ) : (
                                <div className='flex items-center justify-center py-10 text-center'>
                                    <div className='flex flex-col items-center'>
                                        <AlertCircle className='h-10 w-10 text-yellow-500 mb-2' />
                                        <p className="text-gray-300">No questions available for this quiz</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Fixed Submit Button */}
                        <button
                            onClick={submitQuiz}
                            disabled={isLoading}
                            className="fixed bottom-6 right-6 z-50 bg-red-600 text-white hover:bg-red-700 rounded-lg px-6 py-3 font-semibold shadow-lg transition"
                        >
                            {isLoading ? "Submitting Quiz..." : "Submit Quiz"}
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default QuizQuestion;