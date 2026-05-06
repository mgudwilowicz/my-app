import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useUserContext } from "./context/UserContext";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();

  const { currentUser } = useUserContext();
  console.log("🚀 ~ ProtectedRoute ~ user:", currentUser);
  if (!currentUser) {
    return <Navigate to="/login" state={location} replace />;
  }

  return <>{children}</>;
};
export default ProtectedRoute;
