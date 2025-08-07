import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const ENROLL_API = "/api/v1/enroll";

export const enrollApi = createApi({
  reducerPath: "enrollApi",
  baseQuery: fetchBaseQuery({
    baseUrl: ENROLL_API,
    credentials: "include",
  }),
  tagTypes: ["EnrolledCourses", "CourseDetail"],
  endpoints: (builder) => ({
    enrollCourse: builder.mutation({
      query: (courseId) => ({
        url: "/enroll",
        method: "POST",
        body: { courseId },
      }),
      invalidatesTags: (result, error, courseId) => [
        { type: "CourseDetail", id: courseId }
      ],
    }),
    getCourseDetailWithStatus: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}/detail-with-status`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "CourseDetail", id: courseId }
      ],
    }),
    getAllEnrolledCourses: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
      providesTags: ["EnrolledCourses"],
    }),
    unenrollCourse: builder.mutation({
      query: (courseId) => ({
        url: `/unenroll/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, courseId) => [
        { type: "CourseDetail", id: courseId },
        "EnrolledCourses"
      ],
    }),
  }),
});

export const {
  useEnrollCourseMutation,
  useUnenrollCourseMutation,
  useGetCourseDetailWithStatusQuery,
  useGetAllEnrolledCoursesQuery,
} = enrollApi;
