import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedStaffRoute({ children }) {
  const { user, role } = useSelector((state) => state.auth);

  if (!user || role !== "staff") {
    return <Navigate to="/404" replace />;
  }
  return children;
}

export default ProtectedStaffRoute;
