import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  isAuthChecked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload || null;
      state.isAuthenticated = Boolean(action.payload);
      state.isAuthChecked = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isAuthChecked = true;
    },
    setAuthChecked: (state) => {
      state.isAuthChecked = true;
    },
  },
});

export const { clearCredentials, setAuthChecked, setCredentials } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
