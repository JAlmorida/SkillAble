import { useGetQuizByIdQuery } from '@/features/api/quizApi';
import React from 'react'
import { useSelector } from 'react-redux';
import { Card, CardContent } from '../../ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '../../ui/badge';
import { Newspaper } from 'lucide-react';

const QuizCard = ({ quizId }) => {
  const { user } = useSelector(state => state.auth);
  const { data: quiz, isLoading } = useGetQuizByIdQuery(quizId, { skip: !quizId });

  const attempted = user?.attemptedQuizzes?.includes(quizId);

  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardContent className="p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" ></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardContent>
      </Card>
    )
  }

  if(!quiz) return null;

  return (
    <Link to={`/student/quiz/${quizId}`} className="w-full block">
      <Card className="w-full hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold line-clamp-2 flex gap-2"><Newspaper/>{quiz.data.quizTitle}</h2>
            {attempted && (
            <Badge>
              Completed
            </Badge>
          )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default QuizCard