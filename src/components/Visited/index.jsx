import { useEffect } from "react";
import api from "~/api";
import axiosClient from "~/api/axiosClient";
import { useAuth } from "~/hook/useAuth";
import { useLocation } from "react-router-dom";

function Visited() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    let sessionId = sessionStorage.getItem("sessionId");
    if (/^\/(admin|staff)/.test(pathname)) {
      return;
    }

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("sessionId", sessionId);
    }

    axiosClient
      .post(api.visited, {
        path: pathname,
        sessionId,
      })
      .catch((error) => {
        console.error("Create visited failed:", error);
      });
  }, [pathname, user?._id, user?.id]);

  return null;
}

export default Visited;
