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
    markLessonIncomplete: builder.mutation({
      query: ({ courseId, lectureId, lessonId }) => ({
        url: `/${courseId}/lecture/${lectureId}/lesson/${lessonId}/unview`,
        method: "POST",
      }),
      invalidatesTags: ["CourseProgress"],
    }),
    completeCourse: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}/complete`,
        method: "POST",
      }),
      invalidatesTags: ["CourseProgress"],
    }),
    inCompleteCourse: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}/incomplete`,
        method: "POST",
      }),
      invalidatesTags: ["CourseProgress"],
    }),
  }),
});
export const {
  useGetCourseProgressQuery,
  useUpdateLectureProgressMutation,
  useCompleteCourseMutation,
  useInCompleteCourseMutation,
  useUpdateLessonProgressMutation,
  useMarkLessonIncompleteMutation
} = courseProgressApi;