
// filepath: c:\Users\user\skillable\client\skillable\src\app\store.js
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { enrollApi } from "@/features/api/enrollApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { adminApi } from "@/features/api/adminApi";
import { userApi } from "@/features/api/userApi";
import authReducer from "@/features/authSlice";
import { chatApi } from "@/features/api/chatApi";
import { lectureApi } from "@/features/api/lectureApi";
import { lessonApi } from "@/features/api/lessonApi";
import { quizApi } from "@/features/api/quizApi";
import quizReducer from '@/features/quizSlice'
import { questionApi } from "@/features/api/questionApi";
import { captionApi } from "@/features/api/captionApi";
import { categoryApi } from "@/features/api/categoryApi";

export const appStore = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [enrollApi.reducerPath]: enrollApi.reducer,
    [courseProgressApi.reducerPath]: courseProgressApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    auth: authReducer,
    quiz: quizReducer, 
    [lectureApi.reducerPath]: lectureApi.reducer,
    [lessonApi.reducerPath]: lessonApi.reducer,
    [quizApi.reducerPath]: quizApi.reducer,
    [questionApi.reducerPath]: questionApi.reducer,
    [captionApi.reducerPath]: captionApi.reducer, 
    [categoryApi.reducerPath]: categoryApi.reducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      chatApi.middleware,
      courseApi.middleware,
      enrollApi.middleware,
      courseProgressApi.middleware,
      adminApi.middleware,
      userApi.middleware,
      lectureApi.middleware,
      lessonApi.middleware, 
      quizApi.middleware,
      questionApi.middleware, 
      captionApi.middleware,
      categoryApi.middleware
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