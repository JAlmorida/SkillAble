import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Adjust the base URL as needed for your backend
const CAPTION_API = "http://localhost:8080/api/";

export const captionApi = createApi({
  reducerPath: "captionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: CAPTION_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    // Fetch caption for a video
    getCaption: builder.query({
      query: (videoUrl) => ({
        url: `caption?videoUrl=${encodeURIComponent(videoUrl)}`,
        method: "GET",
      }),
    }),
    // Trigger caption generation for a video
    generateCaption: builder.mutation({
      query: (videoUrl) => ({
        url: "caption",
        method: "POST",
        body: { videoUrl },
      }),
    }),
  }),
});

export const {
  useGetCaptionQuery,
  useGenerateCaptionMutation,
} = captionApi;
