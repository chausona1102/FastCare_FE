import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    role: null,
    isAuthChecked: false, 
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      const decoded = jwtDecode(token);
      state.token = token;
      state.user = user;
      state.role = decoded.role;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
    },
    setAuthChecked: (state) => {
      state.isAuthChecked = true;
    },
  },
});

export const { setCredentials, logout, setAuthChecked } = authSlice.actions;
export default authSlice.reducer;