import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { useEnrollCourseMutation } from "@/features/api/enrollApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const EnrollCourseButton = ({ courseId }) => {
  const [enrollCourse, { data, isLoading, isSuccess, isError, error }] = useEnrollCourseMutation();
  const navigate = useNavigate();

  const enrollCourseHandler = async () => {
    await enrollCourse(courseId);
  };

  useEffect(() => {
    if (isSuccess && data) {
      if (data.message === "Already enrolled") {
        toast.info("You are already enrolled in this course.");
      } else {
        toast.success(data.message || "Enrolled successfully!");
        // Redirect to course progress page
        navigate(`/course-progress/${courseId}`);
      }
    }
    if (isError) {
      toast.error(error?.data?.message || "Enrollment failed.");
    }
  }, [isSuccess, isError, data, error, navigate, courseId]);

  return (
    <Button
      disabled={isLoading}
      onClick={enrollCourseHandler}
      className="w-full bg-black text-white"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 animate-spin" />
          Please Wait
        </>
      ) : (
        "Enroll Course"
      )}
    </Button>
  );
};

export default EnrollCourseButton;