import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const QUIZ_API = "http://localhost:8080/api/v1/quiz";

export const quizApi = createApi({
    reducerPath: 'quizApi',
    tagTypes: ["Quiz"],
    baseQuery: fetchBaseQuery({
        baseUrl: QUIZ_API,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        createQuiz: builder.mutation({
            query: ({ lessonId, data }) => ({
                url: `/${lessonId}`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Quiz"],
        }),
        updateQuiz: builder.mutation({
            query: ({ quizId, data }) => ({
                url: `/${quizId}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Quiz"]
        }),
        deleteQuiz: builder.mutation({
            query: ({ quizId }) => ({
                url: `/${quizId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Quiz"]
        }),
        getQuizById: builder.query({
            query: (quizId) => ({
                url: `/${quizId}`,
                method: "GET"
            }),
            providesTags: ["Quiz"]
        }),
        getLessonQuizzes: builder.query({
            query: (lessonId) => ({
                url: `/lesson/${lessonId}`,
                method: "GET"
            }),
            providesTags: ["Quiz"]
        }),
        attemptQuiz: builder.mutation({
            query: ({ quizId, answers }) => ({
                url: `attempt/${quizId}`, 
                method: "POST", 
                body: { quizId, answers}
            }),
            invalidatesTags: ["Attempt"]
        }),
        getUserAttempts: builder.query({
            query: () => ({
                url:"/attempts/user", 
                method: "GET"
            }),
            providesTags: ["Attempt"]
        }), 
        getAdminQuizzes: builder.query({
            query: () => ({
                url: "/attempts/admin", 
                method: "GET"
            }),
            providesTags: ["Quiz"]
        }),
        getQuizAttempts: builder.query({
            query: (quizId) => ({
                url:`/attempts/${quizId}`, 
                method: "GET"
            }),
            providesTags: ["Attempt"]
        }),
    }),
});

export const {
    useCreateQuizMutation,
    useUpdateQuizMutation,
    useDeleteQuizMutation,
    useGetQuizByIdQuery,
    useGetLessonQuizzesQuery,
    useAttemptQuizMutation,
    useGetUserAttemptsQuery, 
    useGetAdminQuizzesQuery, 
    useGetQuizAttemptsQuery,  
} = quizApi;