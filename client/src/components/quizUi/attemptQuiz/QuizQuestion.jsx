import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAttemptQuizMutation, useGetUserAttemptsForQuizQuery } from '@/features/api/quizApi';
import { setUser } from '@/features/authSlice';
import { AlertCircle, Clock } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AttemptQuizQuestionCard from './AttemptQuizQuestionCard';

const QuizQuestion = ({ quizDetails, quizQuestions, isExpired, deadline, courseId }) => {
    const [quizStarted, setQuizStarted] = useState(false);
    const [remainingTime, setRemainingTime] = useState(null);
    const [userAnswers, setUserAnswers] = useState([]);
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [attemptQuiz, { isLoading }] = useAttemptQuizMutation();

    // Fetch user's attempts for this quiz
    const { data: userAttemptsData, isLoading: attemptsLoading } = useGetUserAttemptsForQuizQuery(quizDetails?._id);
    const attemptsUsed = userAttemptsData?.data?.attemptCount ?? 0;
    const maxAttempts = userAttemptsData?.data?.maxAttempts ?? 0;
    const attemptsLeft = maxAttempts - attemptsUsed;
    const attemptsExhausted = maxAttempts > 0 && attemptsLeft <= 0;

    useEffect(() => {
        if (quizDetails?.quizTimer) {
            setRemainingTime(quizDetails.quizTimer * 60);
        }
    }, [quizDetails]);

    useEffect(() => {
        console.log("quizQuestions:", quizQuestions);
    }, [quizQuestions]);

    const submitQuiz = useCallback(async () => {
        if (!quizDetails || !quizDetails._id) {
            toast.error("Quiz details are missing. Cannot submit quiz.");
            return;
        }
        try {
            const response = await attemptQuiz({
                quizId: quizDetails._id,
                answers: userAnswers
            }).unwrap();

            // Update user state with the attempted quiz
            dispatch(setUser({
                ...user,
                attemptedQuizzes: [...(user?.attemptedQuizzes || []), quizDetails._id]
            }));

            // Navigate to results (FIXED ROUTE)
            navigate(`/course-progress/${courseId}/quiz/${quizDetails._id}/quiz-results`, {
                state: { score: response.score, total: quizQuestions?.length, questions: quizQuestions, userAnswers }
            });
        } catch (error) {
            toast.error("Failed to submit");
            console.error("Error submitting quiz:", error);
        }
    }, [attemptQuiz, quizDetails?._id, userAnswers, user, dispatch, navigate, quizQuestions?.length, courseId, quizQuestions]);

    useEffect(() => {
        let timer;
        if (quizStarted && remainingTime > 0) {
            timer = setInterval(() => {
                setRemainingTime(prevTime => prevTime - 1);
            }, 1000);
        } else if (quizStarted && remainingTime === 0) {
            clearInterval(timer);
            toast.warning("Time is up!");
            submitQuiz();
        }
        return () => clearInterval(timer);
    }, [quizStarted, remainingTime, submitQuiz]);

    const handleAnswerChange = useCallback((questionId, selectedOption) => {
        setUserAnswers(prevAnswers => {
            const existingAnswerIndex = prevAnswers.findIndex(
                (answer) => answer.questionId === questionId
            );
            if (existingAnswerIndex >= 0) {
                const newAnswers = [...prevAnswers];
                newAnswers[existingAnswerIndex].selectedOption = selectedOption;
                return newAnswers;
            } else {
                return [...prevAnswers, { questionId, selectedOption }];
            }
        });
    }, []);

    const startQuiz = () => {
        setQuizStarted(true);
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

    return (
        <Card className="w-full max-w-7xl mx-auto mt-8 border-none bg-slate-900 shadow-lg rounded-2xl">
            <CardContent className="p-4 sm:p-8">
                {!quizStarted ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh]">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-white">
                            {quizDetails?.quizTitle}
                        </h2>
                        <div className="w-full text-center mb-6 space-y-2">
                            <p className="text-base sm:text-lg text-gray-200">
                                This quiz contains <span className="font-semibold">{quizQuestions?.length}</span> questions
                            </p>
                            <p className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                                <Clock className="h-4 w-4" />
                                Time Limit: <span className="font-semibold">{quizDetails?.quizTimer}</span> minutes
                            </p>
                            {/* Expiry info */}
                            {!isExpired && deadline && daysLeft !== null && (
                                <p className="mt-2 text-blue-400 font-medium text-sm">
                                    {daysLeft === 0
                                        ? "Expires today"
                                        : `You have ${daysLeft} day${daysLeft > 1 ? "s" : ""} left to attempt this quiz.`}
                                </p>
                            )}
                            {!isExpired && !deadline && (
                                <p className="mt-2 text-green-400 font-medium text-sm">
                                    No expiry (unlimited access)
                                </p>
                            )}
                            {/* Attempts info */}
                            {!isExpired && (
                                <p className={`mt-2 font-semibold text-sm ${attemptsLeft > 0 ? "text-yellow-400" : "text-red-400"}`}>
                                    Attempts left: {attemptsLeft} / {maxAttempts}
                                </p>
                            )}
                        </div>
                        <Button
                            onClick={startQuiz}
                            size="lg"
                            className={`w-full max-w-xs py-3 rounded-lg text-base font-semibold transition ${
                                isExpired || attemptsExhausted
                                    ? 'bg-red-600 text-white cursor-not-allowed hover:bg-red-700'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                            disabled={isExpired || attemptsExhausted}
                        >
                            {isExpired
                                ? "Course Expired"
                                : attemptsExhausted
                                    ? "No Attempts Left"
                                    : "Start Quiz"}
                        </Button>
                    </div>
                ) : (
                    <div className="w-full flex flex-col">
                        {/* Sticky header for quiz info */}
                        <div className="sticky top-0 z-10 bg-slate-900 pb-4">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-3 gap-2">
                                <h2 className="text-lg font-medium text-white">
                                    {quizDetails?.quizTitle}
                                </h2>
                                <Badge
                                    variant="outline"
                                    className="flex items-center gap-1 px-3 py-1 bg-slate-800 border-slate-700 text-white"
                                >
                                    <Clock className="h-4 w-4" />
                                    <span className={`${remainingTime < 60 ? 'text-red-500' : ''}`}>
                                        {formatTime(remainingTime)}
                                    </span>
                                </Badge>
                            </div>
                            <Progress value={timePercentage} className="h-2" />
                        </div>

                        {/* Quiz questions */}
                        <div className="my-4 min-h-[50vh] space-y-4">
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

                        {/* Submit button */}
                        <div className='flex justify-end mt-4'>
                            <Button
                                onClick={submitQuiz}
                                disabled={isLoading}
                                className="w-max bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-6 py-2 font-semibold"
                            >
                                {isLoading ? "Submitting..." : "Submit Quiz"}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default QuizQuestion;