import CreateQuestionModal from '@/components/quizUi/createQuiz/CreateQuestionModal';
import QuestionCard from '@/components/quizUi/createQuiz/QuestionCard';
import { Button } from '@/components/ui/button';
import { useDeleteQuestionMutation, useGetQuizQuestionsQuery } from '@/features/api/questionApi';
import { setEdit, setQuiz } from '@/features/quizSlice';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const CreateQuestion = () => {
  const { quiz } = useSelector(state => state.quiz);
  const [createQuestionModalData, setCreateQuestionModalData] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { courseId, lectureId, lessonId, quizId } = useParams();

  const {
    data: questionsData,
    isLoading,
    refetch,
  } = useGetQuizQuestionsQuery(quizId, { skip: !quizId });

  const [deleteQuestion] = useDeleteQuestionMutation();
  const questions = questionsData?.data || [];

  const finishHandler = () => {
    navigate(`/author/course/${courseId}/lecture/${lectureId}/lesson/${lessonId}/edit`);
    dispatch(setQuiz(null));
    dispatch(setEdit(false));
  };

  const deleteQuestionHandler = async (question) => {
    try {
      await deleteQuestion({ questionId: question._id }).unwrap();
      refetch();
    } catch {
      toast.error("Error deleting question");
    }
  };

  useEffect(() => {
    if (!quiz) {
      navigate(`/author/course/${courseId}/lecture/${lectureId}/lesson/${lessonId}/quiz/${quizId}`);
    }
  }, [quiz, navigate, courseId, lectureId, lessonId, quizId]);

  return (
    <>
      <div className="relative flex flex-col gap-6 w-full min-h-screen bg-white dark:bg-[#111112]">
        {/* Header */}
        <header className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 py-5 px-6 bg-gray-100/80 dark:bg-[#18181b]/80 backdrop-blur sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">
            {quiz?.quizTitle || 'Add Questions'}
          </h1>
          <div className="flex items-center gap-x-6">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {questions.length} Question{questions.length !== 1 ? 's' : ''}
            </span>
            <Button
              onClick={() => setCreateQuestionModalData({ ...quiz })}
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={questions.length >= 50}
            >
              + Add Question
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full flex flex-col gap-5">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-10 h-10 rounded-full border-4 border-slate-600 border-t-blue-500 animate-spin" />
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-lg gap-3">
              <span className="text-gray-500 dark:text-gray-400">No questions found</span>
              <Button
                onClick={() => setCreateQuestionModalData({ ...quiz })}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                + Add your first question
              </Button>
            </div>
          ) : (
            questions.map((ques) => (
              <div key={ques?._id} className="bg-gray-100 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
                <QuestionCard
                  deleteQuestionHandler={deleteQuestionHandler}
                  question={ques}
                  quiz={quiz}
                  setCreateQuestionModalData={setCreateQuestionModalData}
                  setQuestions={() => refetch()}
                />
              </div>
            ))
          )}
        </main>

        {/* Finish Button */}
        <Button
          onClick={finishHandler}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white shadow-lg hover:bg-blue-700"
          disabled={questions.length < 5}
        >
          Finish
        </Button>
      </div>

      {/* Modal */}
      {createQuestionModalData && (
        <CreateQuestionModal
          setCreateQuestionModalData={setCreateQuestionModalData}
          setQuestions={() => refetch()}
        />
      )}
    </>
  );
};

export default CreateQuestion;