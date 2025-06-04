// filepath: c:\Users\user\skillable\client\skillable\src\app\store.js
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { enrollApi } from "@/features/api/enrollApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { adminApi } from "@/features/api/adminApi";
import { userApi } from "@/features/api/userApi";
import authReducer from "@/features/authSlice";

export const appStore = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [enrollApi.reducerPath]: enrollApi.reducer,
    [courseProgressApi.reducerPath]: courseProgressApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      courseApi.middleware,
      enrollApi.middleware,
      courseProgressApi.middleware,
      adminApi.middleware,
      userApi.middleware
    ),
});

// Initialize app with user data
const initializeApp = async () => {
  try {
    await appStore.dispatch(userApi.endpoints.loadUser.initiate({}, { forceRefetch: true }));
  } catch (error) {
    console.error('Failed to load user data:', error);
  }
};

initializeApp();