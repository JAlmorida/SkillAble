// filepath: c:\Users\user\skillable\client\skillable\src\features\api\authApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";

// Corrected base URL to match server routing
const AUTH_API = "http://localhost:8080/api/auth/";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: AUTH_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (inputData) => ({
        url: "register",
        method: "POST",
        body: inputData,
      }),
    }),
    loginUser: builder.mutation({
      query: (inputData) => ({
          url:"login",
          method:"POST",
          body:inputData
      }),
      async onQueryStarted(_, {queryFulfilled, dispatch}) {
          try {
              const result = await queryFulfilled;
              dispatch(userLoggedIn({user:result.data.user}));
          } catch (error) {
              console.log(error);
          }
      }
  }),
logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "POST",
        credentials: "include",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(userLoggedOut());
        } catch (error) {
          console.error('Logout error:', error);
        }
      },
    }),
  }),
});

export const {
  useGetAuthUserQuery, 
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
} = authApi;
