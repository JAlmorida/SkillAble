import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../authSlice";

const USER_API = "http://localhost:8080/api/v1/user/";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    loadUser: builder.query({
      query: () => ({
        url: "profile",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    updateUser: builder.mutation({
      query: (formData) => ({
        url: "profile/update",
        method: "PUT",
        body: formData,
      }),
    }),
    getAllUsers: builder.query({
      query: () => ({
        url: "admin/users", 
        method: "GET", 
      }),
      providesTags: ["Users"], 
    }), 
    getUserEnrollmentDetails: builder.query({
      query: (userId) => ({
        url: `admin/users/${userId}/enrollments`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [{ type: "UserEnrollments", id: userId }]
    }), 
    getSettings: builder.query({
      query: () => 'settings',
    }),
    updateSettings: builder.mutation({
      query: (settings) => ({
        url: 'settings',
        method: 'POST',
        body: settings,
      }),
    }),
    changeUserRole: builder.mutation({
      query: ({ userId, newRole }) => ({
        url: "/change-role", // NOT /users/change-role
        method: "PATCH",
        body: { userId, newRole },
      }),
    }),
  }),
});

export const { 
  useLoadUserQuery,
  useUpdateUserMutation, 
  useGetAllUsersQuery, 
  useGetUserEnrollmentDetailsQuery, 
  useGetSettingsQuery,
  useUpdateSettingsMutation, 
  useChangeUserRoleMutation
} = userApi;
