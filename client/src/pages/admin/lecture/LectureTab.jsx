import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation } from "@/features/api/lectureApi";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import CreateLesson from "../lesson/CreateLesson";
import Input from "@/components/ui/input";

const MEDIA_API = "http://localhost:8080/api/v1/media";

const LectureTab = () => {
  const [input, setInput] = useState({
    title: "",
    subtitle: "",
  });
  const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [setBtnDisable] = useState(true);
  const params = useParams();
  const { courseId, lectureId } = params;

  const { data: lectureData } = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  useEffect(() => {
    if (lecture) {
      setInput({
        title: lecture.lectureTitle,
        subtitle: lecture.lectureSubtitle
      });
      setUploadVideoInfo(lecture.videoInfo);
    }
  }, [lecture]);

  const [editLecture, { data, isLoading, error, isSuccess }] = useEditLectureMutation();

  const [
    removeLecture,
    { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess },
  ] = useRemoveLectureMutation();

  const [showLessonForm, setShowLessonForm] = useState(false);

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
          },
        });

        if (res.data.success) {
          console.log(res);
          setUploadVideoInfo({
            videoUrl: res.data.data.url,
            publicId: res.data.data.publicId,
          });
          setBtnDisable(false);
          toast.success(res.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("Video upload failed");
      } finally {
        setMediaProgress(false);
      }
    }
  };

  const editLectureHandler = async () => {
    await editLecture({
      lectureTitle: input.title,
      lectureSubtitle: input.subtitle,
      videoInfo: uploadVideoInfo,
      courseId,
      lectureId,
    });
  };

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error]);

  useEffect(() => {
    if (removeSuccess) {
      toast.success(removeData.message);
    }
  }, [removeSuccess]);

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={removeLoading}
            variant="destructive"
            onClick={removeLectureHandler}
          >
            {removeLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Plase Wait
              </>
            ) : (
              "Remove Lecture"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Title</Label>
          <Input
            value={input.title}
            onChange={(e) => setInput({ ...input, title: e.target.value })}
            type="text"
            name="title"
            placeholder="Your lecture title here"
          />
        </div>
        <div className="my-5">
          <Label>
            Video<span className="text-red-500">*</span>
          </Label>
          <Input
            type="file"
            onChange={fileChangeHandler}
            accept="video/*"
            placeholder="Your lecture title here"
            className="w-fit"
          />
          <div className="mt-4">
            <Label className="mb-4">Subtitle</Label>
            <Input
            value={input.subtitle} 
            onChange={(e) => setInput({...input, subtitle: e.target.value})}
            input={input} 
            setInput={setInput} />
          </div>
        </div>
        {mediaProgress && (
          <div className="my-4">
            <Progress value={uploadProgress} />
            <p>{uploadProgress}% uploaded</p>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Button
            disabled={isLoading}
            variant="outline"
            onClick={editLectureHandler}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Plase Wait
              </>
            ) : (
              "Update Lecture"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowLessonForm((prev) => !prev)}
          >
            {showLessonForm ? "Hide Lesson Form" : "Add a Lesson"}
          </Button>
        </div>

        {showLessonForm && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="font-bold text-xl">Add a lesson </CardTitle>
            </CardHeader>
            <CardContent>
              <CreateLesson
                courseId={courseId}
                lectureId={lectureId}
                onClose={() => setShowLessonForm(false)}
              />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>

  );
};

export default LectureTab;
