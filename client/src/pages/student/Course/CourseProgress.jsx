import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
  useUpdateLessonProgressMutation,
  useMarkLessonIncompleteMutation,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay, ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import ReactPlayer from "react-player";
import PageLoader from "@/components/loadingUi/PageLoader";
import { Progress } from "@/components/ui/progress";

const CourseProgress = () => {
  const params = useParams();
  const navigate = useNavigate();
  const courseId = params.courseId;
  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();

  const [completeCourse,
    { data: markCompleteData, isSuccess: completedSuccess },
  ] = useCompleteCourseMutation();
  
  const [
    inCompleteCourse,
    { data: markInCompleteData, isSuccess: inCompletedSuccess },
  ] = useInCompleteCourseMutation();

  const [expandedLecture, setExpandedLecture] = useState(null);

  useEffect(() => {
    if (completedSuccess) {
      refetch();
      toast.success(markCompleteData.message);
    }
    if (inCompletedSuccess) {
      refetch();
      toast.success(markInCompleteData.message);
    }
  }, [completedSuccess, inCompletedSuccess]);

  const [currentLecture, setCurrentLecture] = useState(null);

  const [updateLessonProgress, { isLoading: isUpdatingLesson }] = useUpdateLessonProgressMutation();
  const [markLessonIncomplete] = useMarkLessonIncompleteMutation();

  const [completedLessons, setCompletedLessons] = useState({});

  if (isLoading) return <PageLoader />;
  if (isError) return <p>Failed to load course details</p>;

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle } = courseDetails;

  const isLectureCompleted = (lectureId) => {
    return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
  };

  const handleLectureProgress = async (lectureId) => {
    await updateLectureProgress({ courseId, lectureId });
    refetch();
  };


  const toggleLecture = (lectureId) => {
    setExpandedLecture(expandedLecture === lectureId ? null : lectureId);
  };

  const handleCompleteCourse = async () => {
    await completeCourse(courseId);
  };

  const handleInCompleteCourse = async () => {
    await inCompleteCourse(courseId);
  };

  const handleLessonClick = ( lessonId ) => {
    navigate(`lesson/${lessonId}`)
  }

  const handleLessonComplete = async (lectureId, lessonId) => {
    try {
      const result = await updateLessonProgress({ 
        courseId, 
        lectureId, 
        lessonId 
      }).unwrap();
      
      if (result) {
        setCompletedLessons(prev => ({
          ...prev,
          [lessonId]: true
        }));
        refetch();
        toast.success("Lesson marked as completed");
      }
    } catch (error) {
      console.error("Lesson completion error:", error);
      toast.error(error?.data?.message || "Failed to update lesson progress");
    }
  };

  const handleLessonIncomplete = async (lectureId, lessonId) => {
    try {
      const result = await markLessonIncomplete({ 
        courseId, 
        lectureId, 
        lessonId 
      }).unwrap();
      
      if (result) {
        setCompletedLessons(prev => ({
          ...prev,
          [lessonId]: false
        }));
        refetch();
        toast.success("Lesson marked as incomplete");
      }
    } catch (error) {
      console.error("Lesson incompletion error:", error);
      toast.error(error?.data?.message || "Failed to mark lesson as incomplete");
    }
  };

  const lectureIds = courseDetails.lectures.map(l => l._id.toString());
  const viewedLectures = progress.filter(
    p => p.viewed && lectureIds.includes(p.lectureId.toString())
  ).length;
  const totalLectures = courseDetails.lectures.length;
  const progressPercent = totalLectures > 0 ? Math.round((viewedLectures / totalLectures) * 100) : 0;

  return (

    //course-progress header
    <div className="max-w-7xl mx-auto p-4 mt-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">{courseTitle}</h1>
        <Button
          onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
          variant={completed ? "outline" : "default"}
        >
          {completed ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" /> <span>Completed</span>
            </div>
          ) : (
            "Mark as complete"
          )}
        </Button>
      </div>

      <div className="flex flex-col">
        <h2 className="font-semibold text-xl mb-4">Course Lectures</h2>
        
        {/* Progress Bar Section */}
        <div className="mb-6 flex items-center gap-4">
          <span className="font-medium text-gray-700 dark:text-gray-300">Progress:</span>
          <div className="flex-1">
            <Progress value={progressPercent} className="h-3" />
          </div>
          <span className="font-medium text-gray-700 dark:text-gray-300">{progressPercent}%</span>
        </div>
        {/* End Progress Bar Section */}

        <div className="flex-1 overflow-y-auto">
          {courseDetails?.lectures.map((lecture) => (
            <Card
              key={lecture._id}
              className={`mb-3 ${lecture._id === currentLecture?._id
                ? "bg-gray-200 dark:bg-gray-800"
                : ""
                }`}
            >
              <CardContent className="p-4">
                <div>
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleLecture(lecture._id)}
                  >
                    <div>
                      <CardTitle className="text-lg font-medium">
                        <div className="flex items-center">
                          {isLectureCompleted(lecture._id) ? (
                            <CheckCircle2 size={24} className="text-green-500 mr-2" />
                          ) : (
                            <CirclePlay size={24} className="text-gray-500 mr-2" />
                          )}
                          {lecture.lectureTitle}
                        </div>
                      </CardTitle>
                      <div className="text-sm font-bold mt-2 text-gray-500">
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
                </div>

                {expandedLecture === lecture._id && (
                  <div className="mt-4 space-y-4">
                    <Card className="p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Lessons</h3>
                        </div>
                        <div className="space-y-2">
                          {lecture.lessons?.map((lesson, index) => (
                            <div
                              key={lesson._id}
                              className="flex items-center justify-between bg-[#F7F9FA] dark:bg-[#1F1F1F] px-4 p-2 rounded-md"
                            >
                              <div 
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => handleLessonClick(lecture._id, lesson._id)}
                              >
                                {completedLessons[lesson._id] ? (
                                  <CheckCircle2 size={20} className="text-green-500" />
                                ) : (
                                  <CirclePlay size={20} className="text-gray-500" />
                                )}
                                <h1 className="font-bold text-gray-800 dark:text-gray-100">
                                  Lesson - {index + 1}: {lesson.lessonTitle}
                                </h1>
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (completedLessons[lesson._id]) {
                                    handleLessonIncomplete(lecture._id, lesson._id);
                                  } else {
                                    handleLessonComplete(lecture._id, lesson._id);
                                  }
                                }}
                                variant="outline"
                                size="sm"
                                className={completedLessons[lesson._id] ? "text-green-500" : ""}
                              >
                                {completedLessons[lesson._id] ? (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} />
                                    <span>Marked as Completed</span>
                                  </div>
                                ) : (
                                  "Mark as Complete"
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;