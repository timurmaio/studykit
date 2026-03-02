import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiGet, apiPost } from "../config";

export type Role = "student" | "admin" | "teacher";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  role?: Role;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = useCallback(() => {
    apiPost("/api/users/logout").catch(() => {});
    setUser(null);
  }, []);

  useEffect(() => {
    apiGet<User>("/api/users/me")
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const refreshUser = useCallback(() => {
    apiGet<User>("/api/users/me")
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const handleSignOutEvent = () => signOut();
    const handleSignInEvent = () => refreshUser();
    window.addEventListener("auth:signout", handleSignOutEvent);
    window.addEventListener("auth:signin", handleSignInEvent);
    return () => {
      window.removeEventListener("auth:signout", handleSignOutEvent);
      window.removeEventListener("auth:signin", handleSignInEvent);
    };
  }, [signOut, refreshUser]);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
