import { useDeleteQuizMutation, useGetAdminQuizzesQuery } from '@/features/api/quizApi'
import React from 'react'

const AdminQuizzes = () => {
    const { data: quizzesResponse, isLoading, refetch } = useGetAdminQuizzesQuery();
    const [ deleteQuiz, { isLoading: isDeleting }] = useDeleteQuizMutation();

    const quizzes = quizzesResponse?.data || [];
    const handleDeleteQuiz = async(id) => {
        try {
            await deleteQuiz({ quiz:id }).unwrap();
        } catch (error) {
            console.log("Error deleting quiz");
        }
    }

    const loading = isLoading || isDeleting;
    return (
        <section>
            <div className="flex flex-col gap-3">
                {
                    loading ? (
                        <div className='flex justify-center items-center min-h-[90vh]'>Loading...</div>
                    ) : (

                    ) : (

                    )
                }
            </div>
        </section>
    )
}

export default AdminQuizzes