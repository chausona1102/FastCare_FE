import {Navigate} from "react-router-dom";
import { useSelector } from "react-redux";

function RoleRedirect() {
    const user = useSelector((state) => state.auth.user);

    if (!user) {
        return <Navigate to="/home" replace />;
    }
    switch (user.role) {
        case "admin":
            return <Navigate to="/admin" replace />;
        case "staff":
            return <Navigate to="/staff" replace />;
        default:
            return <Navigate to="/home" replace />;
    }
}

export default RoleRedirect;