import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CHAT_NOTIFICATION_API = "/api/chat"; // Adjust if your backend uses a different prefix

export const chatNotificationApi = createApi({
  reducerPath: "chatNotificationApi",
  tagTypes: ["ChatNotification"],
  baseQuery: fetchBaseQuery({
    baseUrl: CHAT_NOTIFICATION_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getChatNotifications: builder.query({
      query: () => ({
        url: "/unread-notifications",
        method: "GET",
      }),
      providesTags: ["ChatNotification"],
    }),
    markAllChatNotificationsRead: builder.mutation({
      query: () => ({
        url: "/mark-all-read",
        method: "POST",
      }),
      invalidatesTags: ["ChatNotification"],
    }),
  }),
});

export const {
  useGetChatNotificationsQuery,
  useMarkAllChatNotificationsReadMutation,
} = chatNotificationApi;
