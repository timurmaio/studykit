import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface TeacherRouteProps {
  children: React.ReactNode;
}

export function TeacherRoute({ children }: TeacherRouteProps) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        Загрузка...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  if (!isTeacher) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}
