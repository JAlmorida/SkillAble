import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation } from "@/features/api/lectureApi";
import axios from "axios";
import { Loader2, ArrowLeft, ChevronLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CreateLesson from "../lesson/CreateLesson";
import Input from "@/components/ui/input";

const MEDIA_API = "http://localhost:8080/api/v1/media";

const EditLecture = () => {
  const [input, setInput] = useState({
    title: "",
    subtitle: "",
  });
  const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [btnDisable, setBtnDisable] = useState(true);
  const params = useParams();
  const { courseId, lectureId } = params;
  const navigate = useNavigate();

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

        if (res.data && res.data.success && res.data.data && res.data.data.secure_url) {
          const videoUrl = res.data.data.secure_url;
          setUploadVideoInfo({
            videoUrl,
            publicId: res.data.data.publicId,
          });
          setBtnDisable(false);
          toast.success(res.data.message);

          // Trigger caption generation with the secure URL
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
    <div className="w-full py-8 px-2">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/admin/course/${courseId}/lecture`)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-transparent text-blue-600 font-semibold focus:outline-none active:bg-transparent"
          title="Back to Lectures"
          type="button"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Lectures</span>
        </button>
      </div>
      <div className="space-y-6 bg-[#18181b] rounded-xl shadow p-6">

      <h1 className="font-bold text-xl">Update your lecture</h1>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={input.title}
            onChange={(e) => setInput({ ...input, title: e.target.value })}
            type="text"
            name="title"
            placeholder="Your lecture title here"
          />
        </div>
        <div className="space-y-2">
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
          {mediaProgress && (
            <div className="my-4">
              <Progress value={uploadProgress} />
              <p>{uploadProgress}% uploaded</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label className="mb-4">Subtitle</Label>
          <Input
            value={input.subtitle}
            onChange={(e) => setInput({ ...input, subtitle: e.target.value })}
            name="subtitle"
            placeholder="Lecture subtitle"
          />
        </div>
<div className="mt-6 bg-[#23232a] rounded-lg p-4">
  <h2 className="font-bold text-lg mb-2">Add a lesson</h2>
  <CreateLesson
    courseId={courseId}
    lectureId={lectureId}
  />
</div>
      </div>
      <div className="fixed bottom-8 right-8 z-50 flex gap-2">
        <Button
          onClick={editLectureHandler}
          disabled={isLoading}
          className="bg-blue-600 text-white shadow-lg hover:bg-blue-700"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please Wait
            </>
          ) : (
            "Update Lecture"
          )}
        </Button>
        <Button
          onClick={removeLectureHandler}
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
            "Remove Lecture"
          )}
        </Button>
      </div>
    </div>
  );
};

export default EditLecture;
