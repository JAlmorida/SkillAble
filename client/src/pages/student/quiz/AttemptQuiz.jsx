import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

import { useGetQuizByIdQuery } from '@/features/api/quizApi';
import { useGetQuizQuestionsQuery } from '@/features/api/questionApi';
import { useGetCourseByIdQuery } from '@/features/api/courseApi';
import { useGetCourseDetailWithStatusQuery } from '@/features/api/enrollApi';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';

import QuizQuestion from '@/components/quizUi/attemptQuiz/QuizQuestion';

const AttemptQuiz = () => {
  const { courseId, quizId } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const lessonId = params.get('lessonId');

  const { data: quizDetails, isLoading: detailsLoading } = useGetQuizByIdQuery(quizId, { skip: !quizId });
  const { data: quizQuestionsData, isLoading: questionsLoading } = useGetQuizQuestionsQuery(quizId, { skip: !quizId });
  const { data: courseData } = useGetCourseByIdQuery(courseId);
  const { data: enrollmentData } = useGetCourseDetailWithStatusQuery(courseId);

  // Debug logs
  console.log("lessonId from query:", lessonId);
  console.log("courseData:", courseData);
  if (courseData?.course?.lectures) {
    courseData.course.lectures.forEach((lecture, idx) => {
      console.log(`Lecture ${idx}:`, lecture);
    });
  }
  console.log("quizDetails:", quizDetails);
  console.log("quizQuestionsData:", quizQuestionsData);
  console.log("detailsLoading:", detailsLoading, "questionsLoading:", questionsLoading);

  const quizQuestions = quizQuestionsData?.data || [];
  const isExpired = enrollmentData?.isExpired;
  const expiresAt = enrollmentData?.expiresAt;

  let lectureId;
  if (courseData?.course?.lectures && lessonId) {
    for (const lecture of courseData.course.lectures) {
      console.log("Checking lecture", lecture._id);
      console.log("lecture.lessons:", lecture.lessons);
      if (!Array.isArray(lecture.lessons)) continue;
      for (const lesson of lecture.lessons) {
        console.log("Raw lesson value:", lesson);
        const lessonIdToCompare = lesson._id ? lesson._id.toString() : lesson.toString();
        console.log("Comparing lessonIdToCompare:", lessonIdToCompare, "to lessonId:", lessonId);
        if (lessonIdToCompare === lessonId.toString()) {
          lectureId = lecture._id;
          break;
        }
      }
      if (lectureId) break;
    }
  }
  console.log("Final resolved lectureId:", lectureId);

  if (!quizId || !courseId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-lg text-red-500">
        Invalid quiz or course. Please check the link.
      </div>
    );
  }

  return (
    <section className="min-h-[90vh] py-8 px-2 sm:px-4 md:px-6 lg:px-0 w-full p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <Card className="bg-white dark:bg-zinc-900 border-none shadow-lg rounded-2xl mb-8">
          <CardHeader>
            {detailsLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="flex flex-row items-center justify-between gap-4 w-full">
                <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">
                  {quizDetails?.data?.quizTitle || quizDetails?.data?.title}
                </CardTitle>
                <Badge
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-300 border-none"
                >
                  <Clock className="h-4 w-4" />
                  <span>{quizDetails?.data?.quizTimer || quizDetails?.data?.timer} min</span>
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {detailsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardDescription className="text-zinc-500 dark:text-zinc-300 text-base">
                  {quizDetails?.data?.description}
                </CardDescription>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz Content */}
        {detailsLoading || questionsLoading || !lectureId || !lessonId ? (
          <Card className="bg-white dark:bg-zinc-900 border-none shadow-lg rounded-2xl">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-blue-200 dark:border-zinc-700 border-t-blue-500 animate-spin" />
                <p className="text-zinc-500 dark:text-zinc-300">Loading quiz...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <QuizQuestion
            quizDetails={quizDetails?.data}
            quizQuestions={quizQuestions}
            courseId={courseId}
            isExpired={isExpired}
            deadline={expiresAt}
            lectureId={lectureId}
            lessonId={lessonId}
          />
        )}
      </div>
    </section>
  );
};

export default AttemptQuiz;