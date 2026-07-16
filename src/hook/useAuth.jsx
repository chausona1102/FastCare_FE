import { useSelector } from "react-redux";

export function useAuth() {
  const { user, token, role } = useSelector((state) => state.auth);
  return {
    isAuthenticated: !!token,
    user,
    role,
  };
}
