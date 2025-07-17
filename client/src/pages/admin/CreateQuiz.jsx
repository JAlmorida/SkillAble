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
  const [maxAttempts, setMaxAttempts] = useState(5);

  const [createQuiz, { isLoading, isSuccess, error, data }] = useCreateQuizMutation();
  const { data: quizData, isLoading: quizLoading, refetch } = useGetLessonQuizzesQuery(lessonId);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(data?.message || "Quiz created successfully");
      setQuizTitle('');
      setQuizTimer(5);
      setMaxAttempts(5);
    }
    if (error) {
      toast.error(error.data?.message || "Failed to create quiz")
    }
  }, [isSuccess, error, data, refetch]);

  const createQuizHandler = async () => {
    await createQuiz({ lessonId, data: { quizTitle, quizTimer, maxAttempts } });
  };

  const existingQuiz = quizData?.data?.[0] || null;

  return (
    <div className="w-full mx-auto bg-gray-100 dark:bg-[#18181b] border border-gray-200 dark:border-border rounded-xl shadow p-5">
      <div className="mb-4">
        <h2 className="font-bold text-2xl text-gray-900 dark:text-white">
          {existingQuiz ? "Quiz for this Lesson" : "Create a Quiz"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          {existingQuiz
            ? "You can view or edit the quiz for this lesson below."
            : "Set up a quiz for this lesson. All fields are required."}
        </p>
      </div>
      {quizLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        </div>
      ) : existingQuiz ? (
        <Quiz 
          quiz={existingQuiz}
          courseId={courseId}
          lectureId={lectureId}
          lessonId={lessonId}
        />
      ) : (
        <form
          className="space-y-5"
          onSubmit={e => {
            e.preventDefault();
            createQuizHandler();
          }}
        >
          <div>
            <Label className="text-gray-900 dark:text-gray-200">Quiz Title</Label>
            <Input
              value={quizTitle}
              onChange={e => setQuizTitle(e.target.value)}
              placeholder="Enter quiz title"
              className="mt-1 bg-white dark:bg-[#23232a] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="text-gray-900 dark:text-gray-200">Timer (minutes)</Label>
              <Input
                type="number"
                min={5}
                max={60}
                value={quizTimer}
                onChange={e => setQuizTimer(Number(e.target.value))}
                placeholder="Set timer"
                className="mt-1 bg-white dark:bg-[#23232a] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="flex-1">
              <Label className="text-gray-900 dark:text-gray-200">Max Attempts</Label>
              <Input
                type="number"
                min={1}
                value={maxAttempts}
                onChange={e => setMaxAttempts(Math.max(1, Number(e.target.value)))}
                className="mt-1 bg-white dark:bg-[#23232a] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/admin/course/${courseId}/lecture/${lectureId}/lesson/${lessonId}`)}
            >
              Back to lesson
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !quizTitle}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Quiz"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default CreateQuiz