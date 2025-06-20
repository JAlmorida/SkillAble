import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const QUESTION_API = "http://localhost:8080/api/v1/question";

export const questionApi = createApi({
    reducerPath: "questionApi", 
    tagTypes: ["Question"], 
    baseQuery: fetchBaseQuery({
        baseUrl: QUESTION_API, 
        credentials: "include", 
    }), 
    endpoints: (builder) => ({
        createQuestion: builder.mutation({
            query: ({ data }) => ({
                url: "/create", 
                method: "POST", 
                body: data,
            }),
            invalidatesTags: ["Question"],
        }),
        updateQuestion: builder.mutation({
            query: ({  questionId, data }) => ({
                url: `question/${questionId}`,
                method: "PUT", 
                body: data,
            }),
            invalidatesTags: ["Question"], 
        }),
        deleteQuestion: builder.mutation({
            query: ({  questionId }) => ({
                url: `question/${questionId}/delete`, 
                method: "DELETE",
            }),
            invalidatesTags: ["Question"],
        }), 
        getQuizQuestions: builder.query({
            query: (quizId) => ({
                url: `/quiz/${quizId}/question`, 
                method: "GET", 
            }),
            providesTags: ["Question"]
        }),
    }),
});

export const {
    useCreateQuestionMutation, 
    useUpdateQuestionMutation, 
    useDeleteQuestionMutation, 
    useGetQuizQuestionsQuery,
} = questionApi;