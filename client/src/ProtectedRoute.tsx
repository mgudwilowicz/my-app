import type { ReactNode } from "react";
import type { User } from "./context/UserContext";
import { Navigate } from "react-router";

type ProtectedRouteProps = {
  user: User | null;
  children: ReactNode;
};

const ProtectedRoute = ({ user, children }: ProtectedRouteProps) => {
  console.log("🚀 ~ ProtectedRoute ~ user:", user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
export default ProtectedRoute;
