import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Link } from "react-router-dom";
import { useGetCourseProgressQuery } from "@/features/api/courseProgressApi";

// Stylish progress bar
const ProgressBar = ({ progress }) => (
  <div className="w-full mt-3">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-blue-400 font-medium">Progress</span>
      <span className="text-xs text-blue-400 font-semibold">{progress}%</span>
    </div>
    <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
      <div
        className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

const Course = ({ course, isEnrolled }) => {
  let userProgress = null;

  // Only fetch progress if enrolled
  const { data: progressData } = useGetCourseProgressQuery(course._id, { skip: !isEnrolled });

  if (
    isEnrolled &&
    progressData &&
    progressData.data &&
    progressData.data.courseDetails &&
    progressData.data.courseDetails.lectures
  ) {
    const lectures = progressData.data.courseDetails.lectures;
    const progressArr = progressData.data.progress;

    console.log("Course progress data:", {
      courseId: course._id,
      lectures: lectures.length,
      progressArr: progressArr?.length || 0,
      progressData: progressData.data
    });

    // Build a map of completed lessons from progress
    const lessonProgressMap = {};
    progressArr?.forEach(lectureProgress => {
      console.log("Lecture progress:", lectureProgress);
      lectureProgress.lessonProgress?.forEach(lp => {
        console.log("Lesson progress:", lp);
        if (lp.completed) lessonProgressMap[lp.lessonId] = true;
      });
    });

    console.log("Lesson progress map:", lessonProgressMap);

    // Map isCompleted onto each lesson
    const allLessons = lectures.flatMap(lecture =>
      (lecture.lessons || []).map(lesson => ({
        ...lesson,
        isCompleted: lessonProgressMap[lesson._id] || false
      }))
    ) || [];

    const totalLessons = allLessons.length;
    const completedLessons = allLessons.filter(lesson => lesson.isCompleted).length;
    const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    console.log("Progress calculation:", {
      totalLessons,
      completedLessons,
      percent
    });
    
    userProgress = { enrolled: true, progress: percent };
  }

  return (
    <Link
      to={`/course-detail/${course._id}`}
      className="block focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 rounded-xl"
    >
      <Card className="rounded-xl bg-white dark:bg-[#181f2a] border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="h-32 overflow-hidden rounded-t-xl">
          <img
            src={course.courseThumbnail}
            alt="course"
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="px-5 py-4 space-y-3">
          <h1 className="font-bold text-lg text-gray-900 dark:text-white truncate">
            {course.courseTitle}
          </h1>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 text-xs rounded-full shadow-sm">
              {course.category?.name || "Uncategorized"}
            </Badge>
            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 px-3 py-1 text-xs rounded-full shadow-sm">
              {course.courseLevel}
            </Badge>
          </div>
          {/* Show progress if enrolled */}
          {userProgress?.enrolled && (
            <ProgressBar progress={userProgress.progress} />
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default Course;
