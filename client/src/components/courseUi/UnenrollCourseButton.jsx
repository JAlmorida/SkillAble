import React, { useState } from "react";
import { Button } from "../ui/button";
import { useUnenrollCourseMutation } from "@/features/api/enrollApi";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useGetAllEnrolledCoursesQuery } from "@/features/api/enrollApi";

const UnenrollCourseButton = ({ courseId, onUnenrolled, refetchEnrollment, className = "" }) => {
  const [unenrollCourse, { 
    data: unenrollData, 
    isLoading: isUnenrolling, 
    isSuccess: isUnenrollSuccess, 
    isError: isUnenrollError, 
    error: unenrollError 
  }] = useUnenrollCourseMutation();

  const { refetch } = useGetAllEnrolledCoursesQuery();

  const unenrollCourseHandler = async () => {
    try {
      const result = await unenrollCourse(courseId);
      if (result.data && !result.error) {
        toast.success("Successfully unenrolled from course!");
        if (onUnenrolled) {
          await onUnenrolled();
        }
        refetch(); // refetch enrolled courses
        if (refetchEnrollment) refetchEnrollment(); // refetch course detail
      }
    } catch (error) {
      console.error("Unenrollment error:", error);
    }
  };

  React.useEffect(() => {
    if (isUnenrollSuccess && unenrollData) {
      toast.success(unenrollData.message || "Unenrolled successfully!");
    }
    if (isUnenrollError) {
      toast.error(unenrollError?.data?.message || "Unenrollment failed.");
    }
  }, [isUnenrollSuccess, isUnenrollError, unenrollData, unenrollError]);

  return (
    <Button
      disabled={isUnenrolling}
      onClick={unenrollCourseHandler}
      className={`w-full bg-red-600 hover:bg-red-700 text-white ${className}`}
    >
      {isUnenrolling ? (
        <>
          <Loader2 className="mr-2 h-4 animate-spin" />
          Please Wait
        </>
      ) : (
        "Unenroll Course"
      )}
    </Button>
  );
};

export default UnenrollCourseButton;
