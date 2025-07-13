import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { useEditLessonMutation, useGetLessonByIdQuery, useRemoveLessonMutation } from "@/features/api/lessonApi";
import axios from 'axios';
import { Loader, Loader2, Trash } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import Input from '@/components/ui/input';
import CreateQuiz from '../CreateQuiz';
import { useGetLessonQuizzesQuery, useUpdateQuizMutation } from "@/features/api/quizApi";
import FileCard from '@/components/lessonUi/FileCard';

const MEDIA_API = "http://localhost:8080/api/v1/media";

const LessonTab = () => {
  const params = useParams();
  const { lessonId, lectureId } = params;

  const [input, setInput] = useState({
    title: "",
    description: "",
  });

  const [videoUrl, setVideoUrl] = useState("");
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: lessonData } = useGetLessonByIdQuery(lessonId);
  const lesson = lessonData?.lesson;

  const { data: quizzesData } = useGetLessonQuizzesQuery(lessonId);
  const quiz = quizzesData?.data?.[0]; // If only one quiz per lesson

  const [resourceFiles, setResourceFiles] = useState([]); // [{name, url}]

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

  const [editLesson, { data, isLoading, error, isSuccess }] = useEditLessonMutation();
  const [removeLesson, { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess }] = useRemoveLessonMutation();

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

        console.log("Upload response:", res.data);

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
  }

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
    console.log("Sending resourceFiles:", resourceFiles);
    await editLesson({
      lectureId,
      lessonId,
      lessonTitle: input.title,
      lessonDescription: input.description,
      videoUrl,
      resourceFiles,
    })
  }

  const removeLessonHandler = async () => {
    await removeLesson(lessonId);
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message || "Update Successful ");
    }
    if (error) {
      toast.error(error.data?.message || "Failed to Update lesson");
    }
  }, [isSuccess, error, data]);

  useEffect(() => {
    if (removeSuccess) {
      toast.success(removeData.message || "Lesson removed successfully")
    }
  }, [removeSuccess, removeData]);

  const [showCreateQuiz, setShowCreateQuiz] = useState(false);

  const [maxAttempts, setMaxAttempts] = useState(5);
  const [updateQuiz] = useUpdateQuizMutation();

  useEffect(() => {
    if (quiz && quiz.maxAttempts) {
      setMaxAttempts(quiz.maxAttempts);
    }
  }, [quiz]);

  const handleUpdateAttempts = async () => {
    if (quiz && quiz._id) {
      await updateQuiz({ quizId: quiz._id, data: { maxAttempts } });
      toast.success("Max attempts updated!");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Lesson</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Title</Label>
          <Input
            value={input.title}
            onChange={(e) => setInput({ ...input, title: e.target.value })}
            type="text"
            name="title"
            placeholder="Your lesson title here"
          />
        </div>
        <div className="my-5">
          <Label className="mb-2">
            Video <span className="text-red-500">*</span>
          </Label>
          <Input
            type="file"
            onChange={fileChangeHandler}
            accept="video/*"
            placeholder="Your lesson video here"
            className="w-fit"
          />
          {videoUrl && (
            <video src={videoUrl} controls className="mt-2 w-full max-w-md" />
          )}
          <div className="mt-4">
            <Label className="mb-4">Description</Label>
            <RichTextEditor
              input={{ description: input.description }}
              setInput={(val) =>
                setInput((prev) => ({ ...prev, description: val.description }))
              }
            />
          </div>
        </div>
        <div className="my-5">
          <Label className="mb-2">Upload Resource (PDF/Word)</Label>
          <Input
            type="file"
            accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
            onChange={handleResourceUpload}
            className="w-fit"
          />
        </div>
        {resourceFiles.length > 0 && (
          <div className="mt-4">
            <Label>Resources</Label>
            {resourceFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2 image.png">
                <FileCard file={file} />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setResourceFiles(prev => prev.filter((_, i) => i !== idx));
                  }}
                >
                  <Trash/>
                </Button>
              </div>
            ))}
          </div>
        )}
        {mediaProgress && (
          <div className="my-4">
            <Progress value={uploadProgress} />
            <p>{uploadProgress}% uploaded</p>
          </div>
        )}

        <div className="mt-4 flex gap-2">

          {/*Update lesson Button*/}
          <Button
            disabled={isLoading}
            variant="outline"
            onClick={editLessonHandler}
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
          {/*Add quiz Button*/}
          <Button 
          variant="outline"
          onClick={() => setShowCreateQuiz((prev) => !prev)}
          >
          {showCreateQuiz ? "Close Quiz Creator" : "Add Quiz"}
          </Button>

          {/*Remove lesson Button*/}
          <Button
            disabled={removeLoading}
            variant="destructive"
            onClick={removeLessonHandler}
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

          {showCreateQuiz && (
            <Card className="mb-4 mt-4">
              <CardContent className="mb-4">
                <CreateQuiz/>
              </CardContent>
            </Card>
          )}

      </CardContent>
    </Card>
  )
}

export default LessonTab