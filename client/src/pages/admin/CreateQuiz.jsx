import { Label } from '@/components/ui/label';
import { useCreateQuizMutation, useGetLessonQuizzesQuery } from '@/features/api/quizApi.js';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import Quiz from './quiz/Quiz';

const CreateQuiz = () => {
  const { courseId, lectureId, lessonId } = useParams();
  const navigate = useNavigate();

  const [quizTitle, setQuizTitle] = useState('');
  const [quizTimer, setQuizTimer] = useState(5);

  const [createQuiz, { isLoading, isSuccess, error, data }] = useCreateQuizMutation();
  const { data: quizData, isLoading: quizLoading, refetch } = useGetLessonQuizzesQuery(lessonId);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(data?.message || "Quiz created successfully");
      setQuizTitle('');
      setQuizTimer(5);
    }
    if (error) {
      toast.error(error.data?.message || "Failed to create quiz")
    }
  }, [isSuccess, error, data, refetch]);

  const createQuizHandler = async () => {
    await createQuiz({ lessonId, data: { quizTitle, quizTimer}});
  };

  // Example for { data: [ ... ] }
  const existingQuiz = quizData && quizData.data && quizData.data.length > 0 ? quizData.data[0] : null;

  return (
    <div>
      <div className="mb-4">
      <h1 className="font-bold text-xl mt-5">
        {existingQuiz ? "Quiz for this lesson" : "Create a quiz for this lesson"}
      </h1>
      </div>
      {quizLoading ? (
        <Loader2 className="animate-spin"/>
      ) : existingQuiz ? (
        <Quiz 
          quiz={existingQuiz}
          courseId={courseId}
          lectureId={lectureId}
          lessonId={lessonId}
        />
      ) : (
        <div className="space-y-4">
          <Label>Quiz Title</Label>
          <Input
            value={quizTitle}
            onChange={e => setQuizTitle(e.target.value)}
            placeholder="Enter title here"
          />
          <Label>Timer (minutes)</Label>
          <Input
            type="number"
            min={5}
            max={60}
            value={quizTimer}
            onChange={e => setQuizTimer(Number(e.target.value))}
            placeholder="Set Timer"
          />
          <div className="flex gap-2">
            <Button
            variant="outline"
            onClick={() => navigate(`/admin/course/${courseId}/lecture/${lectureId}/lesson/${lessonId}`)}>
              Back to lesson
            </Button>
            <Button
            onClick={createQuizHandler}
            disabled={isLoading || !quizTitle}>
              {isLoading ? "Creating Quiz..." : "Create Quiz"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateQuiz