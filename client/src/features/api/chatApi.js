import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CHAT_API = "http://localhost:8080/api/v1/chat/";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: CHAT_API,
    credentials: "include",
  }),
  tagTypes: ["UserCourseGroupChats"],
  endpoints: (builder) => ({
    StreamToken: builder.query({
      query: () => ({
        url: "token",
        method: "GET",
      }),
    }),
    UserFriends: builder.query({
      query: () => ({
        url: "friends",
        method: "GET",
      }),
    }),
    RecommendedUsers: builder.query({
      query: () => ({
        url: "recommend",
        method: "GET",
      }),
    }),
    OutGoingFriendReqs: builder.query({
      query: () => ({
        url: "outgoing-friend-requests",
        method: "GET",
      }),
    }),
    sendFriendRequest: builder.mutation({
      query: (userId) => ({
        url: `friend-request/${userId}`,
        method: "POST",
      }),
    }),
    FriendRequests: builder.query({
      query: () => ({
        url: "friend-requests",
        method: "GET",
      }),
    }),
    acceptFriendRequest: builder.mutation({
      query: (requestId) => ({
        url: `friend-request/${requestId}/accept`,
        method: "PUT",
      }),
    }),
    createCourseGroupChat: builder.mutation({
      query: ({ courseId, name }) => ({
        url: `course-group/${courseId}/create`, 
        method: "POST", 
        body: { name }, 
      })
    }),
    joinCourseGroupChat: builder.mutation({
      query: (courseId) => ({
        url: `course-group/${courseId}/join`,
        method: "POST",
      }),
      invalidatesTags: ["UserCourseGroupChats"],
    }),
    getUserCourseGroupChats: builder.query({
      query: () => ({
        url: "course-group/my",
        method: "GET",
      }),
      providesTags: ["UserCourseGroupChats"],
    }),
  }),
});
export const {
  useStreamTokenQuery,
  useUserFriendsQuery,
  useRecommendedUsersQuery,
  useOutGoingFriendReqsQuery,
  useSendFriendRequestMutation,
  useFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useCreateCourseGroupChatMutation,
  useJoinCourseGroupChatMutation,
  useGetUserCourseGroupChatsQuery,
} = chatApi;