import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const ADMIN_API = "/api/v1/admin";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: ADMIN_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => ({
        url: "/stats",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetDashboardStatsQuery } = adminApi; 
