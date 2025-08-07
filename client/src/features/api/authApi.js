import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";

const AUTH_API = "/api/auth/";

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
        url: "login",
        method: "POST",
        body: inputData,
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
          console.error("Logout error:", error);
        }
      },
    }),
    getAuthUser: builder.query({
      query: () => ({
        url: "me",
        method: "GET",
      }),
    }),
    completeOnBoarding: builder.mutation({
      query: (userData) => ({
        url: "onboarding",
        method: "POST",
        body: userData,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "forgot-password",
        method: "POST",
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: `reset-password/${token}`,
        method: "POST",
        body: { password },
      }),
    }),
    resendConfirmation: builder.mutation({
      query: (email) => ({
        url: 'resend-confirmation',
        method: 'POST',
        body: { email },
      }),
    }),
    confirmEmail: builder.mutation({
      query: ({ email, code }) => ({
        url: 'confirm-email',
        method: 'POST',
        body: { email, code },
      }),
    }),
    validateResetToken: builder.query({
      query: (token) => ({
        url: `validate-reset-token/${token}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetAuthUserQuery,
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useCompleteOnBoardingMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendConfirmationMutation,
  useConfirmEmailMutation,
  useValidateResetTokenQuery,
} = authApi;
