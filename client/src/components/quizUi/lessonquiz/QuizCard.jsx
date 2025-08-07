import { useGetQuizByIdQuery, useGetInProgressAttemptQuery } from '@/features/api/quizApi';
import React from 'react'
import { Card, CardContent } from '../../ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '../../ui/badge';
import { Newspaper, CheckCircle, RotateCcw } from 'lucide-react';

const QuizCard = ({ quizId, courseId, lectureProgress, lessonId }) => {
  const { data: quiz, isLoading } = useGetQuizByIdQuery(quizId, { skip: !quizId });
  
  const { data: inProgressAttempt, isLoading: inProgressLoading } = useGetInProgressAttemptQuery(quizId, {
    skip: !quizId
  });

  const isCompletedForUser = lectureProgress?.quizProgress?.some(
    qp => qp.quizId === quizId && qp.attempted
  );

  // Check if there's an in-progress attempt
  const hasInProgressAttempt = inProgressAttempt?.data && !isCompletedForUser;

  if (isLoading || inProgressLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardContent className="p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" ></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardContent>
      </Card>
    )
  }

  if (!quizId) return null;

  return (
    <Link to={`/student/quiz/${courseId}/${quizId}?lessonId=${lessonId}`} className="w-full block">
      <Card className="w-full hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold line-clamp-2 flex gap-2">
              <Newspaper/>
              {quiz.data.quizTitle}
            </h2>
            <div className="flex items-center gap-2">
              {hasInProgressAttempt && (
                <Badge className="bg-orange-500 text-white flex items-center gap-1">
                  <RotateCcw className="h-3 w-3" />
                  Continue Quiz
                </Badge>
              )}
              {isCompletedForUser && !hasInProgressAttempt && (
                <Badge className="bg-green-500 text-white flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default QuizCard