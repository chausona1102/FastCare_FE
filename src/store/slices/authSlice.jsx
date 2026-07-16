import { createSlice } from "@reduxjs/toolkit";

import { jwtDecode } from "jwt-decode";

const getInitialState = () => {
  const token = localStorage.getItem("fastcare_access_token");
  if (!token) return { user: null, token: null, role: null };

  try {
    const decoded = jwtDecode(token);
    // Kiểm tra token hết hạn chưa
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("fastcare_access_token");
      return { user: null, token: null, role: null };
    }
    return {
      user: JSON.parse(localStorage.getItem("fastcare_user")),
      token,
      role: decoded.role,
    };
  } catch {
    return { user: null, token: null, role: null };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      const decoded = jwtDecode(token);
      state.token = token;
      state.user = user;
      state.role = decoded.role;
      localStorage.setItem("fastcare_access_token", token);
      localStorage.setItem("fastcare_user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      localStorage.removeItem("fastcare_access_token");
      localStorage.removeItem("fastcare_user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
