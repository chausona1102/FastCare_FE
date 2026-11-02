import { useSelector } from "react-redux";

export function useAuth() {
  const { user, token, role } = useSelector((state) => state.auth);
  return {
    token: token,
    isAuthenticated: !!token,
    user,
    role,
  };
}
