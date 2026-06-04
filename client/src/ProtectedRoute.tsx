import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useUserContext } from "./context/UserContext";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const { currentUser } = useUserContext();

  if (!currentUser) {
    const inviteMatch = location.pathname.match(/^\/accept-invite\/([^/]+)$/);
    if (inviteMatch) {
      return (
        <Navigate
          to={`/login?invite=${encodeURIComponent(inviteMatch[1])}`}
          replace
        />
      );
    }
    return <Navigate to="/login" state={location} replace />;
  }

  return <>{children}</>;
};
export default ProtectedRoute;
