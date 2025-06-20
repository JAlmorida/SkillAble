import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { useEditLessonMutation, useGetLessonByIdQuery, useRemoveLessonMutation } from "@/features/api/lessonApi";
import axios from 'axios';
import { Loader, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import Input from '@/components/ui/input';
import CreateQuiz from '../CreateQuiz';

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

  useEffect(() => {
    if (lesson) {
      setInput({
        title: lesson.lessonTitle,
        description: lesson.lessonDescription || "",
      });
      setVideoUrl(lesson.videoUrl || "")
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
        })

        if (res.data.success) {
          setVideoUrl(res.data.data.url);
          toast.success(res.data.message);
        }
      } catch (error) {
        toast.error("Video upload failed");
      } finally {
        setMediaProgress(false);
      }
    }
  }

  const editLessonHandler = async () => {
    await editLesson({
      lectureId,
      lessonId,
      lessonTitle: input.title,
      lessonDescription: input.description,
      videoUrl,
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