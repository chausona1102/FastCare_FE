import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, setAuthChecked } from "~/store/slices/authSlice";
import axiosClient from "~/api/axiosClient";

function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const isAuthChecked = useSelector((state) => state.auth.isAuthChecked);

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await axiosClient.post("/api/auth/refresh");
        dispatch(setCredentials({ token: data.accessToken, user: null }));
        const meRes = await axiosClient.get("/api/auth/me");
        dispatch(setCredentials({ token: data.accessToken, user: meRes.data.user }));
      } catch {
        // chưa đăng nhập hoặc refresh token hết hạn
      } finally {
        dispatch(setAuthChecked());
      }
    };
    init();
  }, [dispatch]);

  if (!isAuthChecked) return null;

  return children;
}

export default AuthInitializer;