import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useUpdateCourseProgressMutation,
  useGetCourseProgressQuery,
  useUpdateLectureProgressMutation,
  useUpdateLessonProgressMutation,
  useUpdateQuizProgressMutation
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay, ChevronDown, ChevronUp, History, ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import PageLoader from "@/components/loadingUi/PageLoader";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ProgressHistory from "./ProgressHistory";

const CourseProgress = () => {
  // All hooks here!
  const params = useParams();
  const navigate = useNavigate();
  const courseId = params.courseId;
  const { data, isLoading, error, isError, refetch } = useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [{ isSuccess: courseUpdateSuccess }] = useUpdateCourseProgressMutation();
  const [updateLessonProgress] = useUpdateLessonProgressMutation();
  const [updateQuizProgress] = useUpdateQuizProgressMutation();

  const [expandedLecture, setExpandedLecture] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState({});

  useEffect(() => {
    console.log("API Response:", data);
    console.log("API Error:", error);
  }, [data, error]);

  useEffect(() => {
    if (data?.data?.progress) {
      const lessons = {};
      data.data.progress.forEach(lectureProgress => {
        if (lectureProgress.completedLessons) {
          lectureProgress.completedLessons.forEach(lessonId => {
            lessons[lessonId] = true;
          });
        }
      });
      setCompletedLessons(lessons);
    }
  }, [data]);

  useEffect(() => {
    if (courseUpdateSuccess) {
      refetch();
      toast.success("Course progress updated successfully");
    }
  }, [courseUpdateSuccess, refetch]);

  useEffect(() => {
    if (!currentLesson && data?.data?.courseDetails?.lectures?.length > 0) {
      const firstLecture = data.data.courseDetails.lectures[0];
      if (firstLecture.lessons && firstLecture.lessons.length > 0) {
        setCurrentLesson(firstLecture.lessons[0]);
      }
    }
  }, [data, currentLesson]);

  // Now, after all hooks, do your early returns:
  if (isLoading) return <PageLoader />;
  if (isError) {
    return (
      <div className="max-w-7xl mx-auto p-4 mt-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Failed to load course details. </span>
          <p className="text-sm mt-2">{error?.data?.message || error?.error || "The course progress data could not be loaded."}</p>
          <Button 
            onClick={() => refetch()} 
            className="mt-3"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  if (!data || !data.data || !data.data.courseDetails) {
    return (
      <div className="max-w-7xl mx-auto p-4 mt-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Warning!</strong>
          <span className="block sm:inline"> Course data structure is incorrect. </span>
          <p className="text-sm mt-2">The API response doesn't contain the expected data structure.</p>
          <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle } = courseDetails;

  // Calculate the progress percentage based on user-specific completion
  const allLessons = courseDetails?.lectures?.flatMap(lecture => lecture.lessons) || [];
  const totalLessons = allLessons.length;
  const completedLessonsCount = allLessons.filter(lesson => lesson.isCompleted).length;

  const progressPercent = totalLessons > 0 
    ? Math.round((completedLessonsCount / totalLessons) * 100)
    : 0;

  const isLectureCompleted = (lectureId) => {
    const lecture = courseDetails?.lectures?.find(l => l._id === lectureId);
    return lecture?.lessons?.every(lesson => lesson.isCompleted) || false;
  };


  const toggleLecture = (lectureId) => {
    setExpandedLecture(expandedLecture === lectureId ? null : lectureId);
  };

  // When a lesson is clicked:
  const handleLessonClick = (lectureId, lessonId) => {
    const lecture = courseDetails.lectures.find(l => l._id === lectureId);
    const lesson = lecture?.lessons.find(l => l._id === lessonId);
    if (lesson) setCurrentLesson(lesson);
    navigate(`/course-progress/${courseId}/lecture/${lectureId}/lesson/${lessonId}`);
  };

  return (
    <>
      {/* Progress History Sheet Trigger */}
      <Sheet>
      <SheetTrigger asChild>
  <button
    className=" fixed top-1/3 left-0 z-50 bg-blue-600 text-white h-12 w-12 flex items-center p-0 rounded-r-lg shadow-lg focus:outline-none"
  >
    <History size={24} />
  </button>
</SheetTrigger>
        <SheetContent side="left" className="max-w-lg w-full">
          <ProgressHistory courseTitle={courseDetails.courseTitle} />
        </SheetContent>
      </Sheet>

      {/* Main Course Progress Content */}
      <div className="max-w-7xl mx-auto p-4 mt-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/course-detail/${courseId}`)}
            className="flex items-center justify-center rounded-lg border border-[#23232a] bg-transparent text-white hover:bg-[#23232a]/80 transition h-10 "
            type="button"
            title="Back to Course Details"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {courseTitle}
            </h1>
            {/* Subtitle row for current lesson */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M16 3v4M8 3v4" />
              </svg>
              Course: {courseTitle}
            </div>
          </div>
          {completed && (
            <Badge className="bg-green-500 text-white">Course Completed</Badge>
          )}
        </div>
        <h2 className="font-semibold text-xl mb-4">Course Lectures</h2>
        
        {/* Progress Bar Section */}
        <div className="mb-6 flex items-center gap-4">
          <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            Progress:
          </span>
          <div className="flex-1">
            <Progress value={progressPercent} className="h-3" />
          </div>
          <span className="font-medium text-gray-700 dark:text-gray-300">{progressPercent}%</span>
        </div>
        {/* End Progress Bar Section */}

        <div className="flex-1 overflow-y-auto">
          {courseDetails?.lectures?.map((lecture) => (
            <div
              key={lecture._id}
              className={`mb-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition
                ${lecture._id === currentLecture?._id
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "bg-white dark:bg-[#23232a]"
                }`}
            >
              <div className="p-5">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleLecture(lecture._id)}
                >
                  <div>
                    <div className="text-lg font-medium flex items-center">
                      {isLectureCompleted(lecture._id) ? (
                        <CheckCircle2 size={24} className="text-green-500 mr-2" />
                      ) : (
                        <CirclePlay size={24} className="text-gray-500 mr-2" />
                      )}
                      {lecture.lectureTitle}
                    </div>
                    <div className="text-sm font-bold mt-2 text-gray-500 dark:text-gray-400">
                      {lecture.lectureSubtitle}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLectureCompleted(lecture._id) && (
                      <Badge
                        variant={"outline"}
                        className="bg-green-200 text-green-600"
                      >
                        Completed
                      </Badge>
                    )}
                    {expandedLecture === lecture._id ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </div>

                {expandedLecture === lecture._id && (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-xl bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Lessons</h3>
                        </div>
                        <div className="space-y-2">
                          {lecture.lessons?.map((lesson, index) => (
                            <div
                              key={lesson._id}
                              className="flex items-center justify-between bg-[#F7F9FA] dark:bg-[#23232a] px-4 p-2 rounded-md"
                            >
                              <div 
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => handleLessonClick(lecture._id, lesson._id)}
                              >
                                {lesson.isCompleted ? (
                                  <CheckCircle2 size={20} className="text-green-500" />
                                ) : (
                                  <CirclePlay size={20} className="text-gray-500" />
                                )}
                                <h1 className="font-bold text-gray-800 dark:text-gray-100">
                                  Lesson - {index + 1}: {lesson.lessonTitle || "Untitled Lesson"}
                                </h1>
                              </div>
                              <div className="flex items-center gap-2">
                                {lesson.isCompleted ? (
                                  <Badge className="bg-green-500 text-white text-xs">
                                    Completed
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-300 text-gray-600 text-xs">
                                    In Progress
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CourseProgress;