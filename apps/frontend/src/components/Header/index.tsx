import { Link, NavLink, useNavigate } from "react-router-dom";
import person from "./person.svg";

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

  const handleSignOut = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_id");
    navigate("/signin");
  };

  const handleSignIn = () => {
    navigate("/signin");
  };

  const signed = localStorage.getItem("jwt_token");

  const signButton = signed ? (
    <button type="button" onClick={handleSignOut} className="button">
      Выйти
    </button>
  ) : (
    <button type="button" onClick={handleSignIn} className="button">
      Войти
    </button>
  );

  const linkToProfile = signed ? (
    <Link to="/profile" className="link link--profile flex align-items-center">
      <img src={person} width="12px" className="mr-4" alt="" />
      <span className="mr-4">Профиль</span>
    </Link>
  ) : null;

  const linkToLearning = signed ? (
    <NavLink
      to="/learning"
      className={({ isActive }) =>
        isActive ? "nav-link nav-link--active" : "nav-link mr-4"
      }
    >
      Обучение
    </NavLink>
  ) : null;

  const userName = signed ? (
    <span style={{ lineHeight: "32px", marginRight: "16px" }}>
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
              className={({ isActive }) =>
                isActive ? "nav-link nav-link--active" : "nav-link"
              }
            >
              Все курсы
            </NavLink>
          </nav>

          <span className="top-panel_logo">StudyKit</span>

          <div className="top-panel_profile">
            {/*{linkToProfile}*/}
            {userName}
            {signButton}
          </div>
        </div>
      </div>
    </header>
  );
}
