import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  console.log("Redux user:", user);
  console.log("localStorage user:", localStorage.getItem("fastcare_user"));

  if (!user || user.role !== "admin") {
    return <Navigate to="*" replace />;
  }
  return children;
}

export default ProtectedRoute;
