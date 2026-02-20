import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import person from "./person.svg";

type Theme = "light" | "dark";
type ThemePreference = "system" | Theme;

interface Props {
  user: {
    firstName: string;
    lastName: string;
  };
}
export function Header(props: Props) {
  const { user } = props;
  const { firstName, lastName } = user;
  const navigate = useNavigate();
  const [themePreference, setThemePreference] = useState<ThemePreference>(
    "system"
  );

  useEffect(() => {
    const storedPreference = localStorage.getItem("theme");
    setThemePreference(
      storedPreference === "light" ||
        storedPreference === "dark" ||
        storedPreference === "system"
        ? storedPreference
        : "system"
    );
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_id");
    navigate("/signin");
  };

  const handleSignIn = () => {
    navigate("/signin");
  };

  const signed = localStorage.getItem("jwt_token");

  const applyTheme = (preference: ThemePreference) => {
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const resolvedTheme: Theme =
      preference === "system"
        ? systemPrefersDark
          ? "dark"
          : "light"
        : preference;

    document.documentElement.dataset.theme = resolvedTheme;
  };

  const handleThemeSelect = (preference: ThemePreference) => {
    setThemePreference(preference);
    localStorage.setItem("theme", preference);
    applyTheme(preference);
  };

  const signButton = signed ? (
    <button
      type="button"
      onClick={handleSignOut}
      className="button button--ghost header-action"
    >
      Выйти
    </button>
  ) : (
    <button
      type="button"
      onClick={handleSignIn}
      className="button header-action"
    >
      Войти
    </button>
  );

  const linkToProfile = signed ? (
    <Link
      to="/profile"
      className="link link--profile header-profile-link flex align-items-center"
    >
      <img src={person} width="12px" className="mr-4" alt="" />
      <span className="mr-4">Профиль</span>
    </Link>
  ) : null;

  const linkToLearning = signed ? (
    <NavLink
      to="/learning"
      className={({ isActive }: { isActive: boolean }) =>
        isActive ? "nav-link nav-link--active" : "nav-link mr-4"
      }
    >
      Обучение
    </NavLink>
  ) : null;

  const userName = signed ? (
    <span className="header-user-name">
      {firstName} {lastName}
    </span>
  ) : null;

  return (
    <header className="top-panel mb-20">
      <div className="container">
        <div className="top-panel_content">
          <nav className="top-panel_nav">
            {linkToLearning}
            <NavLink
              to="/courses"
              className={({ isActive }: { isActive: boolean }) =>
                isActive ? "nav-link nav-link--active" : "nav-link"
              }
            >
              Все курсы
            </NavLink>
          </nav>

          <span className="top-panel_logo">StudyKit</span>

          <div className="top-panel_profile">
            {linkToProfile}
            {userName}
            <div className="theme-toggle" role="group" aria-label="Выбор темы">
              <button
                type="button"
                className={`theme-toggle-btn${themePreference === "light" ? " theme-toggle-btn--active" : ""}`}
                onClick={() => handleThemeSelect("light")}
                title="Светлая"
                aria-pressed={themePreference === "light"}
              >
                ☀
              </button>
              <button
                type="button"
                className={`theme-toggle-btn${themePreference === "system" ? " theme-toggle-btn--active" : ""}`}
                onClick={() => handleThemeSelect("system")}
                title="Системная"
                aria-pressed={themePreference === "system"}
              >
                ◑
              </button>
              <button
                type="button"
                className={`theme-toggle-btn${themePreference === "dark" ? " theme-toggle-btn--active" : ""}`}
                onClick={() => handleThemeSelect("dark")}
                title="Тёмная"
                aria-pressed={themePreference === "dark"}
              >
                ☽
              </button>
            </div>
            {signButton}
          </div>
        </div>
      </div>
    </header>
  );
}
