import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useEnrollCourseMutation, useGetAllEnrolledCoursesQuery } from "@/features/api/enrollApi";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEnrollmentNotifications } from "@/components/context/EnrollmentNotificationProvider";
import UnenrollCourseButton from "./UnenrollCourseButton"; // Add this import

const MAX_ACTIVE_ENROLLMENTS = 10;

const EnrollCourseButton = ({ courseId, onEnrolled, refetchEnrollment }) => {
  const [enrollCourse, { data, isLoading, isSuccess, isError, error }] = useEnrollCourseMutation();
  const queryResult = useGetAllEnrolledCoursesQuery();
  const { data: enrolledData, refetch } = queryResult;
  const [activeCount, setActiveCount] = useState(0);
  const navigate = useNavigate();
  const { addEnrollmentNotification } = useEnrollmentNotifications();
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (enrolledData && typeof enrolledData.activeEnrollmentCount === "number") {
      setActiveCount(enrolledData.activeEnrollmentCount);
    }
  }, [enrolledData]);

  useEffect(() => {
    if (enrolledData && enrolledData.enrolledCourses) {
      const enrolled = enrolledData.enrolledCourses.some(course => 
        course._id === courseId || 
        course.id === courseId || 
        course === courseId
      );
      setIsEnrolled(enrolled);
    }
  }, [enrolledData, courseId]);

  const enrollCourseHandler = async () => {
    const result = await enrollCourse(courseId);
    if (result.data && !result.error) {
      // Backend now automatically adds users to group chat on enrollment
      // No need to call joinGroupChat separately
      addEnrollmentNotification({
        course: { title: "Course Title", _id: courseId },
        enrolledAt: new Date().toISOString(),
        expiresAt: result.data.expiresAt,
        isExpired: result.data.isExpired
      });
    }
    if (onEnrolled) await onEnrolled();
    refetch(); // refetch enrolled courses
    if (refetchEnrollment) refetchEnrollment(); // refetch course detail
  };

  const handleUnenrolled = async () => {
    setIsEnrolled(false);
    if (onUnenrolled) await onUnenrolled();
  };

  useEffect(() => {
    if (isSuccess && data) {
      if (data.message === "Already enrolled") {
        toast.info("You are already enrolled in this course.");
      } else {
        toast.success(data.message || "Enrolled successfully!");
        navigate(`/course-progress/${courseId}`);
      }
    }
    if (isError) {
      toast.error(error?.data?.message || "Enrollment failed.");
    }
  }, [isSuccess, isError, data, error, navigate, courseId, onEnrolled]);

  const isMaxed = activeCount >= MAX_ACTIVE_ENROLLMENTS;

  return (
    <div className="space-y-2">
      {isEnrolled ? (
        <>
          {/* Continue Course Button */}
          <Button
            onClick={() => navigate(`/course-progress/${courseId}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continue Course
          </Button>
          {/* Separate Unenroll Course Button */}
          <UnenrollCourseButton 
            courseId={courseId} 
            onUnenrolled={handleUnenrolled}
            refetchEnrollment={refetchEnrollment}
          />
        </>
      ) : (
        /* Enroll Course Button */
        <Button
          disabled={isLoading || isMaxed}
          onClick={enrollCourseHandler}
          className="w-full bg-black text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 animate-spin" />
              Please Wait
            </>
          ) : isMaxed ? (
            "Enrollment reached the limit. Finish a course first."
          ) : (
            "Enroll Course"
          )}
        </Button>
      )}
    </div>
  );
};

export default EnrollCourseButton;