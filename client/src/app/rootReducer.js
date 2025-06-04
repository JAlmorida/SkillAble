import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { enrollApi } from "@/features/api/enrollApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [courseApi.reducerPath]: courseApi.reducer,
  [enrollApi.reducerPath]: enrollApi.reducer,
  [courseProgressApi.reducerPath]: courseProgressApi.reducer, 
  auth:authReducer
});
export default rootReducer;