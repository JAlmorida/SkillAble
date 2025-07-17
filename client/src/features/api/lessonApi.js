import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const LESSON_API = "http://localhost:8080/api/v1/lessons";

export const lessonApi = createApi({
  reducerPath: "lessonApi",
  tagTypes: ["Lessons"],
  baseQuery: fetchBaseQuery({
    baseUrl: LESSON_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createLesson: builder.mutation({
      query: ({ lectureId, lessonTitle }) => ({
        url: `/${lectureId}/lesson`,
        method: "POST",
        body: { lessonTitle }
      }),
      invalidatesTags: ["Lessons"]
    }),
    getLectureLessons: builder.query({
      query: (lectureId) => ({
        url: `/${lectureId}/lesson`,
        method: "GET"
      }),
      providesTags: ["Lessons"]
    }),
    editLesson: builder.mutation({
      query: ({ 
        lectureId, 
        lessonId, 
        lessonTitle, 
        lessonDescription, 
        videoUrl,
        resourceFiles
      }) => ({
        url: `/${lectureId}/lesson/${lessonId}`,
        method: "PUT", 
        body: { lessonTitle, lessonDescription, videoUrl, resourceFiles }
      }),
      invalidatesTags: ["Lessons"]
    }),
    getLessonById: builder.query({
      query: (lessonId) => ({
        url: `/lesson/${lessonId}`, 
        method: "GET", 
      }),
      providesTags: ["Lessons"]
    }),
    removeLesson: builder.mutation({
      query: (lessonId) => ({
        url: `/lesson/${lessonId}`, 
        method: "DELETE"
      }),
      invalidatesTags: ["Lessons"]
    }),
  }),
});

export const {
  useCreateLessonMutation,
  useGetLectureLessonsQuery,
  useEditLessonMutation,
  useGetLessonByIdQuery,
  useRemoveLessonMutation,
} = lessonApi;