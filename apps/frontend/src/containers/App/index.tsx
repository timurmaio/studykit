import { useAuth } from "../../contexts/AuthContext";
import { Header } from "../../components/Header";

export function App() {
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <div>
      <Header
        user={{
          firstName: user?.firstName ?? "",
          lastName: user?.lastName ?? "",
          role: user?.role,
        }}
        isSigned={isAuthenticated}
        onSignOut={signOut}
      />
    </div>
  );
}
