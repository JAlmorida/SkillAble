import PageLoader from '@/components/loadingUi/PageLoader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCreateLessonMutation, useGetLectureLessonsQuery } from '@/features/api/lessonApi';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast';
import Lesson from './Lesson';
import Input from '@/components/ui/input';

const CreateLesson = () => {
  const params = useParams();
  const courseId = params.courseId;
  const lectureId = params.lectureId;
  const navigate = useNavigate();

  const [lessonTitle, setLessonTitle] = useState("");
  const [createLesson, { data, isLoading, isSuccess, error }] = useCreateLessonMutation();

  const {
    data: lessonData,
    isLoading: lessonLoading,
    isError: lessonError,
    refetch,
  } = useGetLectureLessonsQuery(lectureId);

  const createLessonHandler = async () => {
    await createLesson({ lessonTitle, lectureId })
  }

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(data.message);
      setLessonTitle("");
    }
    if (error) {
      toast.error(error.data?.message || "Failed to create Lesson");
    }
  }, [isSuccess, error, data, refetch]);

  console.log(lessonData);

  return (
    <div>
      <div className='flex-10 flex items-center justify-between mb-5'>
      </div>
      <div className="space-y-4">
        <Label>Lesson Title</Label>
        <Input
          value={lessonTitle}
          onChange={e => setLessonTitle(e.target.value)}
          placeholder="Enter lesson title here"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/author/course/${courseId}/lecture/${lectureId}`)}
          >
            Back to Lecture
          </Button>

          <Button
            onClick={createLessonHandler}
            disabled={isLoading || !lessonTitle}>
            {isLoading ? "Creating Lesson..." : "Create Lesson"}
          </Button>
        </div>

        <div className="mt-10">
          {lessonLoading ? ( 
            <PageLoader/>
          ): lessonError ? (
            <p>Failed to load lessons</p>
          ): !lessonData || lessonData.lessons.length === 0? (
            <p>No lessons available</p>
          ) : (
            lessonData.lessons.map((lesson, index) => 
            <Lesson
              key={lesson._id}
              lesson={lesson}
              courseId={courseId}
              lectureId={lectureId}
              index={index}
            />
            )
          )
           }
        </div>
      </div>
    </div>
  )
}

export default CreateLesson