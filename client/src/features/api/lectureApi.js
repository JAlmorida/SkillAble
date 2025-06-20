import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const LECTURE_API = "http://localhost:8080/api/v1/lectures";

export const lectureApi = createApi({
  reducerPath: "lectureApi",
  tagTypes: ["Lecture"],
  baseQuery: fetchBaseQuery({
    baseUrl: LECTURE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createLecture: builder.mutation({
      query: ({ lectureTitle, courseId }) => ({
        url: `/${courseId}/lecture`,
        method: "POST",
        body: { lectureTitle },
      }),
      invalidatesTags: ["Lecture"],
    }),
    getCourseLecture: builder.query({
      query: (courseId) => ({
        url: `/${courseId}/lecture`,
        method: "GET",
      }),
      providesTags: ["Lecture"],
    }),
    editLecture: builder.mutation({
      query: ({
        lectureTitle,
        lectureSubtitle,
        videoInfo,
        isPreviewFree,
        lectureId,
        courseId,
      }) => ({
        url: `/${courseId}/lecture/${lectureId}`,
        method: "PUT",
        body: { lectureTitle, lectureSubtitle, videoInfo, isPreviewFree },
      }),
      invalidatesTags: ["Lecture"],
    }),
    removeLecture: builder.mutation({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Lecture"],
    }),
    getLectureById: builder.query({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateLectureMutation,
  useGetCourseLectureQuery,
  useEditLectureMutation,
  useRemoveLectureMutation,
  useGetLectureByIdQuery,
} = lectureApi;
