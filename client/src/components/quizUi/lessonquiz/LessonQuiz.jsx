import { useGetLessonQuizzesQuery } from '@/features/api/quizApi';
import React from 'react'
import { Card, CardContent } from '../../ui/card';
import QuizCard from './QuizCard';

const LessonQuiz = ({ lessonId }) => { // Accept lessonId as a prop
    console.log("LessonQuiz received lessonId:", lessonId); // Debug
    
    const { data: quizzesData, isLoading } = useGetLessonQuizzesQuery(lessonId, {
        skip: !lessonId 
    });

    const quizzes = quizzesData?.data || [];

    console.log("LessonQuiz quizzes:", quizzes);
  return (
    <section className="min-h-[90vh] py-5 mt-3">
        {isLoading ? (
            <div className="text-center min-h-[90vh] flex items-center justify-center text-xl">
                Loading...
            </div>
        ) : quizzes.length > 0 ? (
            <div className="w-full flex flex-col gap-3">
                {quizzes.map((quiz) => (
                    <QuizCard key={quiz._id} quizId={quiz._id}/>
                ))}
            </div>
        ): (
            <Card className="w-full">
                <CardContent className="p-4 text-center">
                    <p>No Quizzes Found</p>
                </CardContent>
            </Card>
        )}
    </section>
  )
}

export default LessonQuiz