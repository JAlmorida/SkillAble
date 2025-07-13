import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useEnrollCourseMutation, useGetAllEnrolledCoursesQuery } from "@/features/api/enrollApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEnrollmentNotifications } from "@/components/context/EnrollmentNotificationProvider";
import { useJoinCourseGroupChatMutation } from "@/features/api/chatApi";

const MAX_ACTIVE_ENROLLMENTS = 10;

const EnrollCourseButton = ({ courseId, onEnrolled }) => {
  const [enrollCourse, { data, isLoading, isSuccess, isError, error }] = useEnrollCourseMutation();
  const queryResult = useGetAllEnrolledCoursesQuery();
  const { data: enrolledData, refetch, status } = queryResult;
  const [activeCount, setActiveCount] = useState(0);
  const navigate = useNavigate();
  const { addEnrollmentNotification, enrollmentNotifications } = useEnrollmentNotifications();
  console.log("addEnrollmentNotification:", addEnrollmentNotification);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [joinGroupChat] = useJoinCourseGroupChatMutation();

  useEffect(() => {
    if (enrolledData && typeof enrolledData.activeEnrollmentCount === "number") {
      setActiveCount(enrolledData.activeEnrollmentCount);
    }
  }, [enrolledData]);

  useEffect(() => {
    if (enrolledData && enrolledData.enrolledCourses) {
      setIsEnrolled(enrolledData.enrolledCourses.some(course => course._id === courseId));
    }
  }, [enrolledData, courseId]);

  const enrollCourseHandler = async () => {
    const result = await enrollCourse(courseId);
    if (result.data && !result.error) {
      try {
        await joinGroupChat(courseId).unwrap();
      } catch (e) {
        // Ignore error if already a member
      }
      addEnrollmentNotification({
        course: { title: "Course Title", _id: courseId },
        enrolledAt: new Date().toISOString(),
        expiresAt: result.data.expiresAt,
        isExpired: result.data.isExpired
      });
    }
    if (onEnrolled) await onEnrolled();
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
      ) : isEnrolled ? (
        "Continue to Course"
      ) : (
        "Enroll Course"
      )}
    </Button>
  );
};

export default EnrollCourseButton;