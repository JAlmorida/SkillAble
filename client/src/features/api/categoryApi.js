import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CATEGORY_API = "http://localhost:8080/api/v1/categories";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: CATEGORY_API,
    credentials: "include",
  }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => "/",
      providesTags: ["Category"],
    }),
    createCategory: builder.mutation({
      query: (name) => ({
        url: "/",
        method: "POST",
        body: { name },
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, name }) => ({
        url: `/${id}`,
        method: "PUT",
        body: { name },
      }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;