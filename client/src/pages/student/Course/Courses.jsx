import { Skeleton } from "@/components/ui/skeleton";
import React, { useMemo } from "react";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import { useGetAllEnrolledCoursesQuery } from "@/features/api/enrollApi";
import Course from "./Course";

const Courses = () => {
  const { data, isLoading, isError } = useGetPublishedCourseQuery();
  const { data: enrolledData, isLoading: isEnrolledLoading } = useGetAllEnrolledCoursesQuery();

  // Build a set of enrolled course IDs for quick lookup
  const enrolledCourseIds = useMemo(() => {
    if (!enrolledData?.enrolledCourses) return new Set();
    return new Set(enrolledData.enrolledCourses.map((c) => c._id));
  }, [enrolledData]);

  if (isError) return <h1>Some error occurred while fetching courses</h1>;

  return (
    <div className="bg-gray-50 dark:bg-[#141414]" id="our-courses">
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="font-bold text-3xl text-center mb-10">Our Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading || isEnrolledLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <CourseSkeleton key={index} />
            ))
          ) : (
            data?.courses &&
            data.courses.map((course, index) => (
              <Course
                key={index}
                course={course}
                isEnrolled={enrolledCourseIds.has(course._id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;

const CourseSkeleton = () => {
  return (
    <div className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
      <Skeleton className="w-full h-36" />
      <div className="px-5 py-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
};
