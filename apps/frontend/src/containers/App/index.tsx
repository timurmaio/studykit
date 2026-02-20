import { useState, useEffect } from "react";
import { API_URL } from "../../config";
import { Header } from "../../components/Header";

export function App(): JSX.Element {
  const [state, setState] = useState({
    id: "",
    email: "",
    avatar: "",
    firstName: "",
    lastName: "",
    role: "",
    user: {
      firstName: "",
      lastName: "",
    },
  });

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const hasSavedPreference =
      storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "system";
    if (!hasSavedPreference) {
      localStorage.setItem("theme", "system");
    }

    const applyTheme = () => {
      const preference = localStorage.getItem("theme") || "system";
      const resolvedTheme =
        preference === "system"
          ? mediaQuery.matches
            ? "dark"
            : "light"
          : preference;
      document.documentElement.dataset.theme = resolvedTheme;
    };

    applyTheme();

    const handleSystemThemeChange = () => {
      if (localStorage.getItem("theme") === "system") {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    const userId = localStorage.getItem("user_id");

    if (userId) {
      try {
        fetch(`${API_URL}/api/users/${userId}`)
          .then((res) => res.json())
          .then((data) =>
            setState((prev) => ({
              ...prev,
              user: data,
            }))
          );
      } catch {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user_id");
      }
    }
    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  return (
    <div>
      <Header user={state.user} />
    </div>
  );
}
