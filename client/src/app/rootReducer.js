import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { enrollApi } from "@/features/api/enrollApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { userApi } from "@/features/api/userApi";
import { chatApi } from "@/features/api/chatApi";
import { lectureApi } from "@/features/api/lectureApi";
import { lessonApi } from "@/features/api/lessonApi";
import { quizApi } from "@/features/api/quizApi";
import { questionApi } from "@/features/api/questionApi";

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [courseApi.reducerPath]: courseApi.reducer,
  [lectureApi.reducerPath]: lectureApi.reducer,
  [lessonApi.reducerPath]: lessonApi.reducer,
  [quizApi.reducerPath]: quizApi.reducer,
  [questionApi.reducerPath]: questionApi.reducer,   
  [enrollApi.reducerPath]: enrollApi.reducer,
  [courseProgressApi.reducerPath]: courseProgressApi.reducer, 
  auth:authReducer
});
export default rootReducer;