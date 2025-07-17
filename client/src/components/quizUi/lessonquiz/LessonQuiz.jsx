import { useGetLessonQuizzesQuery } from '@/features/api/quizApi';
import React from 'react'
import { Card, CardContent } from '../../ui/card';
import QuizCard from './QuizCard';

const LessonQuiz = ({ lessonId, courseId, lectureProgress }) => { // Accept lessonId, courseId, and lectureProgress as props
    if (!lessonId || !courseId) return null;
    
    const { data: quizzesData, isLoading } = useGetLessonQuizzesQuery(lessonId, {
        skip: !lessonId 
    });

    const quizzes = quizzesData?.data || [];

    console.log("LessonQuiz quizzes:", quizzes);

    if (isLoading) return <div>Loading quizzes...</div>;
    if (!quizzes.length) return <div>No quizzes for this lesson.</div>;

    return (
        <section className="py-2">
            {quizzes.map((quiz) =>
                quiz._id && courseId ? (
                    <QuizCard 
                        key={quiz._id} 
                        quizId={quiz._id} 
                        courseId={courseId} 
                        lectureProgress={lectureProgress}
                        lessonId={lessonId} // <-- pass lessonId here!
                    />
                ) : null
            )}
        </section>
    );
}

export default LessonQuiz