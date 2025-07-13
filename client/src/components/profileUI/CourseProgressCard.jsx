import React from "react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const CourseProgressCard = ({ course, percent, isLoading }) => (
  <Link
    to={`/course-progress/${course._id}`}
    className="block bg-white dark:bg-zinc-900 rounded-lg shadow flex items-center gap-4 p-4 hover:bg-sky-50 dark:hover:bg-zinc-800 transition"
    style={{ textDecoration: "none" }}
  >
    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-zinc-800">
      {course.courseThumbnail ? (
        <img src={course.courseThumbnail} alt={course.title || course.courseTitle} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
          No Image
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{course.title || course.name || course.courseTitle}</div>
      <div className="flex items-center gap-2 mt-1">
        <Progress value={percent} className="h-2 flex-1" />
        <span className="text-xs text-gray-500 dark:text-gray-400">{isLoading ? "..." : `${percent}%`}</span>
      </div>
    </div>
  </Link>
);

export default CourseProgressCard;
