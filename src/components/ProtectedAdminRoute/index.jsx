import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedAdminRoute({ children }) {
  const { user, role } = useSelector((state) => state.auth);

  if (!user || role !== "admin") {
    return <Navigate to="/404" replace />;
  }
  return children;
}

export default ProtectedAdminRoute;
