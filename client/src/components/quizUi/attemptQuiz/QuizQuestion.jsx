import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAttemptQuizMutation } from '@/features/api/quizApi';
import { setUser } from '@/features/authSlice';
import { AlertCircle, Clock } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AttemptQuizQuestionCard from './AttemptQuizQuestionCard';

const QuizQuestion = ({ quizDetails, quizQuestions }) => {
    const [quizStarted, setQuizStarted] = useState(false);
    const [remainingTime, setRemainingTime] = useState(null);
    const [userAnswers, setUserAnswers] = useState([]);
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [attemptQuiz, { isLoading }] = useAttemptQuizMutation();

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

            // Navigate to results 
            navigate(`/quiz-results`, {
                state: { score: response.score, total: quizQuestions?.length }
            });
        } catch (error) {
            toast.error("Failed to submit");
            console.error("Error submitting quiz:", error);
        }
    }, [attemptQuiz, quizDetails?._id, userAnswers, user, dispatch, navigate, quizQuestions?.length]);

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
    }, [quizStarted, remainingTime, submitQuiz]); // Added submitQuiz to dependencies

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

    return (
        <Card className="flex flex-col w-full mt-5 border-slate-600 bg-slate-900">
            <CardContent className="p-5">
                {!quizStarted ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh]">
                        <h2 className="text-2xl font-bold mb-8 text-center">
                            {quizDetails?.quizTitle}
                        </h2>
                        <div className="text-center mb-8">
                            <p className="text-lg mb-2">
                                This quiz contains {quizQuestions?.length} questions
                            </p>
                            <p className="flex items-center justify-center gap-2">
                                <Clock className="h-4 w-4" />
                                Time Limit: {quizDetails?.quizTimer} minutes
                            </p>
                        </div>
                        <Button
                            onClick={startQuiz}
                            size="lg"
                            className="font-semibold"
                        >
                            Start Quiz
                        </Button>
                    </div>
                ) : (
                    <div className="w-full flex flex-col"> {/* Added "flex" here */}
                        <div className="sticky top-0 z-10 bg-slate-900 pb-4">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-3 gap-2">
                                <h2 className="text-lg font-medium">
                                    {quizDetails?.quizTitle}
                                </h2>
                                <Badge
                                    variant="outline"
                                    className="flex items-center gap-1 px-3 py-1"
                                >
                                    <Clock className="h-4 w-4" />
                                    <span className={`${remainingTime < 60 ? 'text-red-500' : ''}`}>
                                        {formatTime(remainingTime)}
                                    </span>
                                </Badge>
                            </div>
                            <Progress value={timePercentage} className="h-2" />
                        </div>

                        <div className='my-4 min-h-[50vh]'>
                            {quizQuestions && quizQuestions.length > 0 ? (
                                quizQuestions.map((question) => (
                                    <AttemptQuizQuestionCard
                                        key={question._id}
                                        question={question}
                                        onAnswerChange={handleAnswerChange}
                                    />
                                ))
                            ) : (
                                <div className='flex items-center justify-center py-10 text-center'> {/* Added justify-center */}
                                    <div className='flex flex-col items-center'>
                                        <AlertCircle className='h-10 w-10 text-yellow-500 mb-2' /> {/* Fixed typo in yellow */}
                                        <p>No questions available for this quiz</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='flex justify-end mt-4'>
                            <Button
                                onClick={submitQuiz}
                                disabled={isLoading}
                                className="w-max"
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