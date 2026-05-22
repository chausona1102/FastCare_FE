import { Routes, Route } from "react-router-dom";
import { userRoutes, adminRoutes } from "./routes";
import NotFound from "~/components/pages/NotFound";
import ProtectedRoute from "~/components/ProtectedRoute";

function App() {
  return (
    <Routes>
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
            <ProtectedRoute>
              <route.Layout>
                <route.component />
              </route.Layout>
            </ProtectedRoute>
          }
        />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
