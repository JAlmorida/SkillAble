import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  useCreateLectureMutation,
  useGetCourseLectureQuery,
} from "@/features/api/lectureApi";
import { ChevronLeft, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Lecture from "./Lecture";
import PageLoader from "@/components/loadingUi/PageLoader";
import Input from "@/components/ui/input";

const CreateLecture = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();

  const [createLecture, { data, isLoading, isSuccess, error }] =
    useCreateLectureMutation();

  const {
    data: lectureData,
    isLoading: lectureLoading,
    isError: lectureError,
    refetch,
  } = useGetCourseLectureQuery(courseId);

  const createLectureHandler = async () => {
    await createLecture({ lectureTitle, courseId });
  };

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(data.message);
      setLectureTitle(""); // Clear input after success
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error, data, refetch]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center py-4 sm:py-8 px-2 sm:px-6 bg-white dark:bg-[#111112]">
      <div className="w-full mx-auto mb-4 sm:mb-6">
        <button
          variant="outline"
          type="button"
          onClick={() => navigate(`/admin/course/${courseId}`)}
          className="flex items-center gap-2 rounded-full bg-transparent text-blue-600 dark:text-blue-400 font-semibold focus:outline-none active:bg-transparent text-sm sm:text-base"
          title="Back to Course Table"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          <span className="font-semibold">Back to course</span>
        </button>
      </div>
      <div className="w-full mx-auto bg-gray-100 dark:bg-[#18181b] rounded-xl shadow-lg p-4 sm:p-6 space-y-6 sm:space-y-8">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-gray-900 dark:text-gray-100 mb-1">Add Lectures</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Add a lecture to your course. Enter a title and click "Create lecture".
          </p>
        </div>
        <form
          className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end"
          onSubmit={e => {
            e.preventDefault();
            createLectureHandler();
          }}
        >
          <div className="flex-1 space-y-2">
            <Label className="text-gray-900 dark:text-gray-100 text-sm">Title</Label>
            <Input
              value={lectureTitle}
              onChange={(e) => setLectureTitle(e.target.value)}
              type="text"
              name="courseTitle"
              placeholder="Please enter your lecture title here"
              className="bg-white dark:bg-[#23232a] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading || !lectureTitle.trim()}
              className="bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Create lecture"
              )}
            </Button>
          </div>
        </form>
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Lectures</h2>
          <div className="w-full">
            {lectureLoading ? (
              <PageLoader />
            ) : lectureError ? (
              <p className="text-red-500 text-sm">Failed to load lectures</p>
            ) : lectureData.lectures.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-sm">No lectures available.</p>
            ) : (
              <div className="space-y-3">
                {lectureData.lectures.map((lecture, index) => (
                  <div key={lecture._id} className="w-full">
                    <Lecture lecture={lecture} index={index} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLecture;
