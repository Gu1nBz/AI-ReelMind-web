import { Spin } from "antd";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function AdminGuard({ children }: PropsWithChildren) {
  const { admin, adminReady, refreshAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!adminReady) {
      void refreshAdmin();
    }
  }, [adminReady, refreshAdmin]);

  if (!adminReady) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <Spin />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}

