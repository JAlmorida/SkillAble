import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CHAT_API = "/api/v1/chat/";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: CHAT_API,
    credentials: "include",
  }),
  tagTypes: ["UserCourseGroupChats", "UserFriends", "FriendRequests"],
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
      providesTags: ["UserFriends"],
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
      invalidatesTags: ["UserCourseGroupChats", "UserFriends", "FriendRequests"],
    }),
    FriendRequests: builder.query({
      query: () => ({
        url: "friend-requests",
        method: "GET",
      }),
      providesTags: ["FriendRequests"],
    }),
    acceptFriendRequest: builder.mutation({
      query: (requestId) => ({
        url: `friend-request/${requestId}/accept`,
        method: "PUT",
      }),
      invalidatesTags: ["UserCourseGroupChats", "UserFriends", "FriendRequests"],
    }),
    createCourseGroupChat: builder.mutation({
      query: ({ courseId, name }) => ({
        url: `course-group/${courseId}/create`, 
        method: "POST", 
        body: { name }, 
      }),
      invalidatesTags: ["UserCourseGroupChats"]
    }),
    joinCourseGroupChat: builder.mutation({
      query: (courseId) => ({
        url: `course-group/${courseId}/join`,
        method: "POST",
      }),
      invalidatesTags: ["UserCourseGroupChats"],
    }),
    leaveCourseGroupChat: builder.mutation({
      query: (channelId) => ({
        url: `course-group/${channelId}/leave`,
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
    checkGroupChatMembership: builder.query({
      query: (courseId) => ({
        url: `course-group/${courseId}/membership`,
        method: "GET",
      }),
    }),
    rejoinCourseGroupChat: builder.mutation({
      query: (courseId) => ({
        url: `course-group/${courseId}/rejoin`,
        method: "POST",
      }),
      invalidatesTags: ["UserCourseGroupChats"],
    }),
    deleteAcceptedFriendRequest: builder.mutation({
      query: (id) => ({
        url: `friend-requests/accepted/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UserFriends"],
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
  useLeaveCourseGroupChatMutation,
  useGetUserCourseGroupChatsQuery,
  useCheckGroupChatMembershipQuery,
  useRejoinCourseGroupChatMutation,
  useDeleteAcceptedFriendRequestMutation,
} = chatApi;
