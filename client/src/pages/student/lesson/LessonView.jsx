import LessonQuiz from '@/components/quizUi/lessonquiz/LessonQuiz';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGetLectureLessonsQuery, useGetLessonByIdQuery } from '@/features/api/lessonApi';
import { 
  useGetCourseProgressQuery,
  useUpdateLessonProgressMutation 
} from '@/features/api/courseProgressApi';
import { useGetLessonQuizzesQuery } from '@/features/api/quizApi';
import { removeColorStyles } from '@/utils/htmlSanitizer';
import { CheckCircle, CheckCircle2, ArrowLeft, BookOpen } from 'lucide-react';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageLoader from '@/components/loadingUi/PageLoader';
import VideoWithCaption from '@/components/video/VideoWithCaption';
import FileCard from '@/components/lessonUi/FileCard';

const LessonView = () => {
  const { courseId, lectureId, lessonId } = useParams();
  const navigate = useNavigate();

  const { data: lessonData, isLoading: lessonLoading } = useGetLessonByIdQuery(lessonId, { skip: !lessonId });
  const { data: courseProgressData, refetch: refetchProgress } = useGetCourseProgressQuery(courseId, { skip: !courseId });
  const { data: lessonQuizzesData, isLoading: quizzesLoading } = useGetLessonQuizzesQuery(lessonId, { skip: !lessonId });
  const [updateLessonProgress, { isLoading: isUpdating }] = useUpdateLessonProgressMutation();

  // Find progress for this lesson
  const lectureProgress = courseProgressData?.data?.progress?.find(
    p => p.lectureId === lectureId
  );
  const isLessonCompletedByUser = lectureProgress?.lessonProgress?.some(
    lp => lp.lessonId === lessonId && lp.completed
  );

  // Mark lesson as complete
  const handleMarkComplete = async () => {
    try {
      await updateLessonProgress({ courseId, lectureId, lessonId }).unwrap();
      toast.success("Lesson marked as complete");
      refetchProgress();
    } catch (error) {
      toast.error("Failed to update lesson progress");
      console.error("Error updating lesson progress:", error);
    }
  };

  const handleBackToCourse = () => {
    navigate(`/course-progress/${courseId}`);
  };

  if (lessonLoading) return <PageLoader />;

  const lesson = lessonData?.lesson;
  const lectureTitle = courseProgressData?.data?.courseDetails?.lectures?.find(l => l._id === lectureId)?.lectureTitle || "Lecture";

  return (
    <div className="max-w-7xl mx-auto p-4 mt-4">
      {/* Header with Back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleBackToCourse}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {lesson?.lessonTitle || "Lesson"}
          </h1>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <BookOpen className="h-4 w-4" />
            <span>Lecture: {lectureTitle}</span>
          </div>
        </div>
        {isLessonCompletedByUser && (
          <Badge className="bg-green-500 text-white flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Lesson Completed
          </Badge>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Description and Resources */}
        <div className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          {lesson.lessonDescription && (
            <div
              className="max-h-[32rem] overflow-y-auto text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none mb-2"
              dangerouslySetInnerHTML={{ __html: removeColorStyles(lesson.lessonDescription) }}
            />
          )}
          {/* Removed the resource section from here */}
          {!lesson.lessonDescription && (!lesson.resourceFiles || lesson.resourceFiles.length === 0) && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-300 mb-6">
              No description or resources available for this lesson.
            </div>
          )}
        </div>

        {/* Video and Actions */}
        <div className="md:w-[400px] flex-shrink-0 space-y-4">
          {/* Video */}
          <div className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Lesson Video</h2>
            {lesson?.videoUrl && <VideoWithCaption videoUrl={lesson.videoUrl} />}
          </div>
          {/* Lesson Resource */}
          <div className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Lesson Resource</h2>
            {lesson.resourceFiles && lesson.resourceFiles.length > 0 ? (
              <div>
                {lesson.resourceFiles.map((file, idx) => (
                  <FileCard key={idx} file={file} showDelete={false} />
                ))}
              </div>
                ) : (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-300 mb-6">
                No resources available for this lesson.
              </div>
              )}
          </div>
        </div>
      </div>

      {/* Lesson Quiz - full width below */}
      <div className="mt-6 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Lesson Quiz</h2>
        {quizzesLoading ? (
          <div className="py-2 text-gray-700 dark:text-gray-300">Loading quizzes...</div>
        ) : lessonQuizzesData?.data?.length > 0 ? (
          <LessonQuiz
            lessonId={lessonId}
            courseId={courseId}
            lectureProgress={lectureProgress}
          />
        ) : (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-300">
            No quizzes for this lesson.
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonView;