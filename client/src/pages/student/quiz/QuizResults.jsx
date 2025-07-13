import React from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom'

const QuizResults = () => {
    const location = useLocation();
    const { score, total, questions, userAnswers } = location.state || {};
    const navigate = useNavigate();

    // Helper to get user's selected option for a question
    const getUserAnswer = (questionId) =>
        userAnswers?.find(ans => ans.questionId === questionId)?.selectedOption;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Quiz Results</h1>
            <p className="mb-6">Score: {score} / {total}</p>
            {questions?.map((q, idx) => {
                const userAnswer = getUserAnswer(q._id);
                const correctOption = q.options.find(opt => opt.isCorrect);
                const userOption = q.options.find(opt => opt._id === userAnswer);
                const isCorrect = userOption && userOption.isCorrect;
                return (
                    <Card key={q._id} className="mb-4">
                        <CardContent className="p-4">
                            <div className="font-semibold mb-2">{q.questionText}</div>
                            <div>
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
                                            <Badge variant={isCorrect ? "success" : "destructive"}>
                                                Your Answer
                                            </Badge>
                                        )}
                                        {opt.isCorrect && (
                                            <Badge variant="success">Correct</Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
            <Button className="w-max" onClick={() => navigate("/")}>Back to Home</Button>
        </div>
    );
};

export default QuizResults;