import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_API = "http://localhost:8080/api/v1/courses";

export const courseApi = createApi({
  reducerPath: "courseApi",
  tagTypes: ["Course"],
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    // Course endpoints
    createCourse: builder.mutation({
      query: ({ courseTitle, category }) => ({
        url: "",
        method: "POST",
        body: { courseTitle, category },
      }),
      invalidatesTags: ["Course"],
    }),
    deleteCourse: builder.mutation({
      query: (courseId) => ({
        url: `/course/${courseId}`, 
        method: "DELETE"
      }),
    }),
    getSearchCourse: builder.query({
      query: ({ searchQuery, categories, sortByLevel }) => {
        let queryString = `/search?query=${encodeURIComponent(searchQuery)}`;
        if (categories && categories.length > 0) {
          const categoriesString = categories.map(encodeURIComponent).join(",");
          queryString += `&categories=${categoriesString}`;
        }
        if (sortByLevel) {
          queryString += `&sortByLevel=${encodeURIComponent(sortByLevel)}`;
        }
        return {
          url: queryString,
          method: "GET",
        };
      },
    }),
    getPublishedCourse: builder.query({
      query: () => ({
        url: "/published-courses",
        method: "GET",
      }),
    }),
    getCreatorCourse: builder.query({
      query: () => ({
        url: "",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),
    editCourse: builder.mutation({
      query: ({ formData, courseId }) => ({
        url: `/${courseId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Course"],
    }),
    getCourseById: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
    }),
    publishCourse: builder.mutation({
      query: ({ courseId, query }) => ({
        url: `/${courseId}?publish=${query}`,
        method: "PATCH",
      }),
    }),
    searchCourses: builder.query({
      query: ({ searchQuery }) => `/search?query=${searchQuery}`,
    }),
  }),
});

export const {
  useGetCourseByIdQuery,
  useDeleteCourseMutation,
  useGetSearchCourseQuery,
  useGetPublishedCourseQuery,
  useCreateCourseMutation,
  useGetCreatorCourseQuery,
  useEditCourseMutation,
  usePublishCourseMutation,
  useSearchCoursesQuery,
} = courseApi;