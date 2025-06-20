import { createSlice } from "@reduxjs/toolkit";

// Get initial values from localStorage
const getInitialUser = () => {
  try {
    return localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;
  } catch (error) {
    return null;
  }
};

const initialState = {
  user: getInitialUser(),
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
}; 

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        
        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.token);
    },
    userLoggedOut: (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        
        // Clear localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    },
    setUser: (state, action) => {
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
    }
  },
});

export const { userLoggedIn, userLoggedOut, setUser } = authSlice.actions;
export default authSlice.reducer;