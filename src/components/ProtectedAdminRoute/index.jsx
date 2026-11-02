import { Navigate } from "react-router-dom";
import { useAuth } from "~/hook/useAuth";

function ProtectedAdminRoute({ children }) {
  const { user, role } = useAuth();

  if (!user || role !== "admin") {
    return <Navigate to="/404" replace />;
  }
  return children;
}

export default ProtectedAdminRoute;
