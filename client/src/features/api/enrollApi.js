import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const ENROLL_API = "http://localhost:8080/api/v1/enroll";

export const enrollApi = createApi({
  reducerPath: "enrollApi",
  baseQuery: fetchBaseQuery({
    baseUrl: ENROLL_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    enrollCourse: builder.mutation({
      query: (courseId) => ({
        url: "/enroll",
        method: "POST",
        body: {courseId},
      }),
    }),
    getCourseDetailWithStatus: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}/detail-with-status`,
        method: "GET",
      }),
    }),
    getAllEnrolledCourses: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useEnrollCourseMutation,
  useGetCourseDetailWithStatusQuery,
  useGetAllEnrolledCoursesQuery,
} = enrollApi;