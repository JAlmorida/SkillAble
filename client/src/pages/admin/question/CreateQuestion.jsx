import CreateQuestionModal from '@/components/quizUi/createQuiz/CreateQuestionModal';
import QuestionCard from '@/components/quizUi/createQuiz/QuestionCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeleteQuestionMutation, useGetQuizQuestionsQuery } from '@/features/api/questionApi';
import { setEdit, setQuiz } from '@/features/quizSlice';
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

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
    } = useGetQuizQuestionsQuery( quizId,{ skip: !quizId });

    const [deleteQuestion] = useDeleteQuestionMutation();

    const questions = questionsData?.data || [];

    const finishHandler = () => {
        navigate(`/admin/course/${courseId}/lecture/${lectureId}/lesson/${lessonId}/quiz/${quizId}`);
        
        dispatch(setQuiz(null));
        dispatch(setEdit(false));
    };

    const deleteQuestionHandler = async (question) => {
        try {
            await deleteQuestion({
                questionId: question._id,
            }).unwrap();
            refetch();
        } catch (error) {
            toast.error("error deleting question");
        }
    };

    React.useEffect(() => {
        if (!quiz) {
            navigate(`/admin/course/${courseId}/lecture/${lectureId}/lesson/${lessonId}/quiz/${quizId}`);
        }
    }, [quiz, navigate, courseId, lectureId, lessonId, quizId]);

    return (
        <>
            <div className="relative flex flex-col items-center gap-5 py-10">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle className="text-3xl text-center underline">Add Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <section className="flex gap-y-3 w-full flex-col md:flex-row justify-between items-center mb-6  ">
                        <div className="flex flex-col items-center md:items-start">
                            <span className="flex gap-1 flex-col items-center md:items-start">
                                <h2 className="text-2xl">{quiz?.quizTitle}</h2>
                            </span>
                        </div>
                        <Button
                        onClick={() => setCreateQuestionModalData({ ...quiz })}
                        className="w-max h-max"
                        >
                        Create Question
                        </Button>
                    </section>

                    <div className="w-full flex flex-col gap-5 rounded-lg min-h-[50vh]">
                    {!isLoading && questions.length === 0 && (
                        <div className="w-full flex-col justify-center items-center text-lg gap-5 rounded-lg min-h-[50vh]">
                            No Questions found
                        </div>
                    )}
                    {!isLoading && 
                    questions.length > 0 &&
                    questions.map ((ques) => (
                        <QuestionCard
                            deleteQuestionHandler={deleteQuestionHandler}
                            key={ques?._id}
                            question={ques}
                            quiz={quiz}
                            setCreateQuestionModalData={setCreateQuestionModalData}
                            setQuestions={() => refetch()}
                        />
                    ))}
                    </div>
                    <div className="flex justify-end mt-6">
                        <Button
                        onClick={finishHandler}>Finish</Button>
                    </div>
                </CardContent>
            </Card>
            </div>
            {createQuestionModalData && ( 
                <CreateQuestionModal
                  setCreateQuestionModalData={setCreateQuestionModalData}
                  setQuestions={() => refetch()}
                />
                )}
        </>
    )
}

export default CreateQuestion