import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_PROGRESS_API = "http://localhost:8080/api/v1/progress";

export const courseProgressApi = createApi({
  reducerPath: "courseProgressApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PROGRESS_API,
    credentials: "include",
  }),
  tagTypes: ["CourseProgress"],
  endpoints: (builder) => ({
    getCourseProgress: builder.query({
      query: (courseId) => `/${courseId}`,
      providesTags: ["CourseProgress"],
    }),
    updateCourseProgress: builder.mutation({
      query: ({ courseId, data }) => ({
        url: `/${courseId}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["CourseProgress"],
    }),
    updateLectureProgress: builder.mutation({
      query: ({ courseId, lectureId }) => ({
        url: `/${courseId}/lecture/${lectureId}/view`,
        method: "POST",
      }),
      invalidatesTags: ["CourseProgress"],
    }),
    updateLessonProgress: builder.mutation({
      query: ({ courseId, lectureId, lessonId }) => ({
        url: `/${courseId}/lecture/${lectureId}/lesson/${lessonId}/view`,
        method: "POST",
      }),
      invalidatesTags: ["CourseProgress"],
    }),
    getLessonProgress: builder.query({
      query: ({ courseId, lectureId, lessonId }) =>
        `/${courseId}/lecture/${lectureId}/lesson/${lessonId}/progress`,
      providesTags: ["CourseProgress"],
    }),
    getLectureProgress: builder.query({
      query: ({ courseId, lectureId }) =>
        `/${courseId}/lecture/${lectureId}/progress`,
      providesTags: ["CourseProgress"],
    }),
    getQuizProgress: builder.query({
      query: ({ courseId, lectureId, quizId }) =>
        `/${courseId}/lecture/${lectureId}/quiz/${quizId}/progress`,
      providesTags: ["CourseProgress"],
    }),
    updateQuizProgress: builder.mutation({
      query: ({ courseId, lectureId, quizId, score }) => ({
        url: `/${courseId}/lecture/${lectureId}/quiz/${quizId}/attempt`,
        method: "POST",
        body: { score },
      }),
      invalidatesTags: ["CourseProgress"],
    }),
    getAllUsersCourseProgress: builder.query({
      query: (courseId) => `/${courseId}/all`,
      providesTags: ["CourseProgress"],
    }),
    getCourseProgressHistory: builder.query({
      query: (courseId) => `/${courseId}/progress-history`,
    }),
  }),
});

export const {
  useGetCourseProgressQuery,
  useUpdateCourseProgressMutation,
  useUpdateLectureProgressMutation,
  useUpdateLessonProgressMutation,
  useGetLessonProgressQuery,
  useGetLectureProgressQuery,
  useGetQuizProgressQuery,
  useUpdateQuizProgressMutation,
  useGetAllUsersCourseProgressQuery,
  useGetCourseProgressHistoryQuery,
} = courseProgressApi;