import { Routes, Route } from "react-router-dom";
import { userRoutes, adminRoutes, staffRoutes } from "./routes";
import NotFound from "~/components/pages/NotFound";
import ProtectedAdminRoute from "~/components/ProtectedAdminRoute";
import ProtectedStaffRoute from "~/components/ProtectedStaffRoute";
import RoleRedirect from "~/components/RoleRedirect";
import Visited from "~/components/Visited";

function App() {
  return (
    <>
      <Visited />
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        {userRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              <route.Layout>
                <route.component />
              </route.Layout>
            }
          />
        ))}

        {adminRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              <ProtectedAdminRoute>
                <route.Layout>
                  <route.component />
                </route.Layout>
              </ProtectedAdminRoute>
            }
          />
        ))}
        {staffRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              <ProtectedStaffRoute>
                <route.Layout>
                  <route.component />
                </route.Layout>
              </ProtectedStaffRoute>
            }
          />
        ))}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
