import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HamburgerIcon, CloseIcon } from "../icons";
import person from "./person.svg";

type Theme = "light" | "dark";
type ThemePreference = "system" | Theme;

interface Props {
  user: {
    firstName: string;
    lastName: string;
    role?: string;
  };
  isSigned: boolean;
  onSignOut: () => void;
}

export function Header(props: Props) {
  const { user, isSigned, onSignOut } = props;
  const { firstName, lastName } = user;
  const navigate = useNavigate();
  const [themePreference, setThemePreference] = useState<ThemePreference>(
    "system"
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  const handleSignOut = () => {
    onSignOut();
    navigate("/signin");
  };

  const handleSignIn = () => {
    navigate("/signin");
  };

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

  const closeMenu = () => setIsMenuOpen(false);

  const signButton = isSigned ? (
    <button
      type="button"
      onClick={() => {
        closeMenu();
        handleSignOut();
      }}
      className="button button--ghost header-action"
    >
      Выйти
    </button>
  ) : (
    <button
      type="button"
      onClick={() => {
        closeMenu();
        handleSignIn();
      }}
      className="button header-action"
    >
      Войти
    </button>
  );

  const linkToProfile = isSigned ? (
    <Link
      to="/profile"
      className="link link--profile header-profile-link flex align-items-center"
      onClick={closeMenu}
    >
      <img src={person} width="12px" className="mr-4" alt="" />
      <span className="mr-4">Профиль</span>
    </Link>
  ) : null;

  const linkToLearning = isSigned ? (
    <NavLink
      to="/learning"
      className={({ isActive }: { isActive: boolean }) =>
        isActive ? "nav-link nav-link--active" : "nav-link mr-1"
      }
      onClick={closeMenu}
    >
      Обучение
    </NavLink>
  ) : null;

  const linkToTeaching =
    isSigned && (props.user.role === "teacher" || props.user.role === "admin") ? (
      <NavLink
        to="/teaching"
        className={({ isActive }: { isActive: boolean }) =>
          isActive ? "nav-link nav-link--active" : "nav-link mr-1"
        }
        onClick={closeMenu}
      >
        Преподавание
      </NavLink>
    ) : null;

  const userName = isSigned ? (
    <span className="header-user-name">
      {firstName} {lastName}
    </span>
  ) : null;

  const navLinks = (
    <>
      {linkToLearning}
      {linkToTeaching}
      <NavLink
        to="/courses"
        className={({ isActive }: { isActive: boolean }) =>
          isActive ? "nav-link nav-link--active" : "nav-link"
        }
        onClick={closeMenu}
      >
        Все курсы
      </NavLink>
    </>
  );

  const themeToggle = (
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
  );

  return (
    <header className={`top-panel mb-5${isMenuOpen ? " top-panel--menu-open" : ""}`}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="top-panel_content">
          <button
            type="button"
            className="top-panel_menu-btn"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Открыть меню"
            aria-expanded={isMenuOpen}
          >
            <HamburgerIcon />
          </button>

          <nav className="top-panel_nav top-panel_desktop-nav">
            {navLinks}
          </nav>

          <span className="top-panel_logo">StudyKit</span>

          <div className="top-panel_profile top-panel_desktop-profile">
            {linkToProfile}
            {userName}
            {themeToggle}
            {signButton}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <>
          <div
            className="top-panel_overlay"
            onClick={closeMenu}
            role="button"
            tabIndex={-1}
            aria-label="Закрыть меню"
          />
          <div className="top-panel_drawer" role="dialog" aria-label="Меню навигации">
            <button
              type="button"
              className="top-panel_drawer-close"
              onClick={closeMenu}
              aria-label="Закрыть меню"
            >
              <CloseIcon />
            </button>
            <nav className="top-panel_drawer-nav">{navLinks}</nav>
            <div className="top-panel_drawer-profile">
              {linkToProfile}
              {userName}
              {themeToggle}
              {signButton}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
