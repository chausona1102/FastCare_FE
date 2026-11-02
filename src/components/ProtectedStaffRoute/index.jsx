import { Navigate } from "react-router-dom";
import { useAuth } from "~/hook/useAuth";

function ProtectedStaffRoute({ children }) {
  const { user, role } = useAuth();

  if (!user || role !== "staff") {
    return <Navigate to="/404" replace />;
  }
  return children;
}

export default ProtectedStaffRoute;
