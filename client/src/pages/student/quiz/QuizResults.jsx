import React, { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useGetCourseProgressQuery } from '@/features/api/courseProgressApi';
import { getLetterGrade, getGradeColor } from '@/lib/utils';

const QuizResults = () => {
    const location = useLocation();
    const { courseId } = useParams();
    const { score, total, questions, userAnswers, lessonId } = location.state || {};
    const navigate = useNavigate();

    // Refetch course progress when this page loads
    const { refetch: refetchCourseProgress } = useGetCourseProgressQuery(courseId);
    useEffect(() => {
        refetchCourseProgress();
    }, [refetchCourseProgress]);

    // Helper to get user's selected option for a question
    const getUserAnswer = (questionId) =>
        userAnswers?.find(ans => ans.questionId === questionId)?.selectedOption;

    if (!location.state) {
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Quiz Results</h1>
                <p className="text-red-500">No quiz results found. Please complete a quiz first.</p>
                <Button className="mt-4" onClick={() => navigate("/")}>Back to Home</Button>
            </div>
        );
    }

    const percentage = Math.round((score / total) * 100);
    const letterGrade = getLetterGrade(percentage);
    const gradeColor = getGradeColor(letterGrade);

    return (
        <div className="p-4 relative min-h-[80vh]">
            <h1 className="text-2xl font-bold mb-4">Quiz Results</h1>
            
            {/* Score Summary */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">Your Score</h2>
                        <div className={`text-6xl font-bold ${gradeColor} mb-2`}>
                            {letterGrade}
                        </div>
                        <div className="text-lg text-gray-600">
                            {percentage}%
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Question Review - Scrollable */}
            <h3 className="text-lg font-semibold mb-4">Question Review</h3>
            <div className="max-h-[50vh] overflow-y-auto pr-2 mb-8">
                {questions?.map((q, idx) => {
                    const userAnswer = getUserAnswer(q._id);
                    const correctOption = q.options.find(opt => opt.isCorrect);
                    const userOption = q.options.find(opt => opt._id === userAnswer);
                    const isCorrect = userOption && userOption.isCorrect;
                    
                    return (
                        <Card key={q._id} className="mb-4">
                            <CardContent className="p-4">
                                <div className="font-semibold mb-2">
                                    Question {idx + 1}: {q.questionText}
                                </div>
                                <div className="space-y-2">
                                    {q.options.map(opt => (
                                        <div key={opt._id} className="flex items-center gap-2">
                                            <span
                                                className={
                                                    opt._id === userAnswer
                                                        ? isCorrect
                                                            ? "text-green-600 font-bold"
                                                            : "text-red-600 font-bold"
                                                        : opt.isCorrect
                                                            ? "text-green-600"
                                                            : ""
                                                }
                                            >
                                                {opt.text}
                                            </span>
                                            {opt._id === userAnswer && (
                                                <Badge variant={isCorrect ? "default" : "destructive"}>
                                                    Your Answer
                                                </Badge>
                                            )}
                                            {opt.isCorrect && (
                                                <Badge variant="default" className="bg-green-500">
                                                    Correct
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            
            {/* Fixed Back to Home Button */}
            <Button
                className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-6 py-3 font-semibold shadow-lg transition"
                onClick={() => navigate("/")}
            >
                Back to Home
            </Button>
        </div>
    );
};

export default QuizResults;