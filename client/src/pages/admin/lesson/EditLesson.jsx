import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Trash } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Input from '@/components/ui/input';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Progress } from '@/components/ui/progress';
import { useEditLessonMutation, useGetLessonByIdQuery, useRemoveLessonMutation } from "@/features/api/lessonApi";
import { useGetLessonQuizzesQuery, useUpdateQuizMutation } from "@/features/api/quizApi";
import axios from 'axios';
import { toast } from 'sonner';
import FileCard from '@/components/lessonUi/FileCard';
import CreateQuiz from '../CreateQuiz';
import { BookOpen } from "lucide-react";

function EnrolledCourseCard({ course }) {
  return (
    <div className="flex items-center justify-between border-2 border-dashed border-blue-400 rounded-xl bg-[#18181b] px-4 py-3 mt-2">
      <div className="flex items-center gap-3">
        <BookOpen className="text-blue-400" size={22} />
        <span className="font-medium text-base text-white truncate max-w-[180px]">
          {course.title}
        </span>
      </div>
      <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
        {course.status}
      </span>
    </div>
  );
}

const MEDIA_API = "http://localhost:8080/api/v1/media";

const uploadInputWrapper =
  "border-2 border-dashed border-blue-400 rounded-lg p-2 flex items-center gap-3 bg-white dark:bg-[#23232a]";
const uploadInputClass =
  "file:bg-blue-600 file:text-white file:font-semibold file:px-4 file:py-2 file:rounded file:border-0 file:mr-4 file:cursor-pointer text-black dark:text-white";

const DashedUploadInput = ({ label, ...props }) => (
  <div>
    <Label className="mb-2">{label}</Label>
    <div className={uploadInputWrapper}>
      <Input {...props} className={uploadInputClass} />
    </div>
  </div>
);

const EditLesson = () => {
  const params = useParams();
  const { lessonId, lectureId, courseId } = params;

  const [input, setInput] = useState({
    title: "",
    description: "",
  });

  const [videoUrl, setVideoUrl] = useState("");
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resourceFiles, setResourceFiles] = useState([]);
  const [maxAttempts, setMaxAttempts] = useState(5);

  const { data: lessonData } = useGetLessonByIdQuery(lessonId);
  const lesson = lessonData?.lesson;

  const { data: quizzesData } = useGetLessonQuizzesQuery(lessonId);
  const quiz = quizzesData?.data?.[0];

  const [editLesson, { data, isLoading, error, isSuccess }] = useEditLessonMutation();
  const [removeLesson, { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess }] = useRemoveLessonMutation();
  const [updateQuiz] = useUpdateQuizMutation();

  useEffect(() => {
    if (lesson) {
      setInput({
        title: lesson.lessonTitle,
        description: lesson.lessonDescription || "",
      });
      setVideoUrl(lesson.videoUrl || "");
      setResourceFiles(lesson.resourceFiles || []);
    }
  }, [lesson]);

  useEffect(() => {
    if (quiz && quiz.maxAttempts) {
      setMaxAttempts(quiz.maxAttempts);
    }
  }, [quiz]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Update Successful");
    }
    if (error) {
      toast.error(error.data?.message || "Failed to Update lesson");
    }
  }, [isSuccess, error, data]);

  useEffect(() => {
    if (removeSuccess) {
      toast.success(removeData?.message || "Lesson removed successfully");
    }
  }, [removeSuccess, removeData]);

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setMediaProgress(true);
      try {
        const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(Math.round((loaded * 100) / total));
          }
        });

        if (res.data && res.data.success && res.data.data && res.data.data.secure_url) {
          const videoUrl = res.data.data.secure_url;
          setVideoUrl(videoUrl);
          toast.success(res.data.message);

          // Trigger caption generation
          try {
            await axios.post('/api/caption', { videoUrl });
            toast.success('Caption generation started!');
          } catch {
            toast.error('Failed to start caption generation');
          }
        } else {
          toast.error("Video upload failed: Missing video URL in response.");
        }
      } catch (error) {
        toast.error("Video upload failed");
      } finally {
        setMediaProgress(false);
      }
    }
  };

  const handleResourceUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setMediaProgress(true);
      try {
        const res = await axios.post(`${MEDIA_API}/upload-resource`, formData, {
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(Math.round((loaded * 100) / total));
          }
        });
        if (res.data?.success && res.data.data?.secure_url) {
          setResourceFiles(prev => [...prev, { name: file.name, url: res.data.data.secure_url }]);
          toast.success("Resource uploaded!");
        } else {
          toast.error("Resource upload failed.");
        }
      } catch {
        toast.error("Resource upload failed");
      } finally {
        setMediaProgress(false);
      }
    }
  };

  const editLessonHandler = async () => {
    await editLesson({
      lectureId,
      lessonId,
      lessonTitle: input.title,
      lessonDescription: input.description,
      videoUrl,
      resourceFiles,
    });
  };

  const removeLessonHandler = async () => {
    await removeLesson(lessonId);
  };

  const handleUpdateAttempts = async () => {
    if (quiz && quiz._id) {
      await updateQuiz({ quizId: quiz._id, data: { maxAttempts } });
      toast.success("Max attempts updated!");
    }
  };

  return (
    <div className="w-full py-8 px-2">
      <div className="flex items-center mb-6 gap-2">
        <Link to={`/admin/course/${courseId}/lecture/${lectureId}`}>
          <button
            type="button"
            className="flex items-center gap-2 bg-transparent text-blue-600 font-semibold rounded-none border-none shadow-none px-0 py-0 focus:outline-none"
            title="Back to Lectures"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Lectures</span>
          </button>
        </Link>
      </div>

      <div className="flex items-center mb-6 gap-2 ml-2">
      <h1 className="font-bold text-2xl">Edit Lesson</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8 min-h-[500px] items-stretch">
        {/* Left Section */}
        <div className="w-full md:w-1/3 space-y-6 h-full flex flex-col">
          {/* Card 1: Inputs */}
          <div className="bg-background border border-border rounded-xl shadow p-6 space-y-2">
            <div>
            <h1 className="font-semibold text-sm mb-2">Title</h1>
            <Input
                value={input.title}
                onChange={(e) => setInput({ ...input, title: e.target.value })}
                type="text"
                name="title"
                placeholder="Your lesson title here"
              />
            </div>
            <h1 className="font-semibold text-sm">Upload Resource (PDF/Word)</h1>
            <DashedUploadInput
              type="file"
              accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
              onChange={handleResourceUpload}
            />
            <h1 className="font-semibold text-sm">Your lesson video here</h1>
            <DashedUploadInput
              type="file"
              accept="video/*"
              onChange={fileChangeHandler}
            />
            {mediaProgress && (
              <div>
                <Progress value={uploadProgress} />
                <p>{uploadProgress}% uploaded</p>
              </div>
            )}
          </div>

          {/* Card 2: Resource Files and Video */}
          <div className="bg-background border border-border rounded-xl shadow p-6 space-y-5">
            {/* Resource Files Output Section */}
            {resourceFiles.length > 0 && (
              <div>
                <Label className="mb-2 font-semibold text-1xl">Resources</Label>
                <div className="space-y-2">
                  {resourceFiles.map((file, idx) => (
                    <FileCard
                      key={idx}
                      file={file}
                      onDelete={() => setResourceFiles(prev => prev.filter((_, i) => i !== idx))}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Video Output Section */}
            {videoUrl && (
              <div>
                <Label className="mb-2 font-bold text-s">Lesson Video</Label>
                <video src={videoUrl} controls className="w-full rounded" />
              </div>
            )}
          </div>
        </div>
        {/* Right Section */}
        <div className="w-full md:w-2/3 bg-background border border-border rounded-xl shadow p-6 flex flex-col h-full ">
          
          {/* BUTTONS ON TOP */}
          <div className='flex justify-between '>
          <Label className="mb-2 text-2xl font-bold">Description</Label>
          </div>

          {/* RICH TEXT EDITOR */}
          <div className="flex-1 min-h-[300px] mb-4 ">
            <RichTextEditor
              input={{ description: input.description }}
              setInput={(val) =>
                setInput((prev) => ({ ...prev, description: val.description }))
              }
            />
          </div>

          {/* Always-visible Quiz Section at the bottom */}
        </div>
      </div>
      <div className="w-full mt-8">
        <CreateQuiz />
      </div>


      {/* Fixed action buttons at the bottom right */}
      <div className="fixed bottom-7 right-7 z-40 flex gap-2">
        <Button
          onClick={editLessonHandler}
          disabled={isLoading}
          className="bg-blue-600 text-white shadow-lg hover:bg-blue-700"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </>
          ) : (
            "Update lesson"
          )}
        </Button>
        <Button
          onClick={removeLessonHandler}
          disabled={removeLoading}
          className="bg-red-600 text-white shadow-lg hover:bg-red-700"
          size="lg"
          variant="destructive"
        >
          {removeLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please Wait
            </>
          ) : (
            "Remove lesson"
          )}
        </Button>
      </div>
    </div>
  );
};

export default EditLesson;