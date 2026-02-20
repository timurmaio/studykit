import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";

export function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "" });

  const handleSignOut = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_id");
    navigate("/signin");
  };

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      return;
    }

    fetch(`${API_URL}/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
        });
      })
      .catch(() => {
        setUser({ firstName: "", lastName: "", email: "" });
      });
  }, []);

  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.trim() || "SK";

  return (
    <div className="container profile-page">
      <div className="row">
        <div className="col-12 col-lg-4 mb-24">
          <div className="profile-card">
            <div className="profile-card-banner" aria-hidden="true" />
            <div className="profile-card-body">
              <div className="profile-avatar">{initials}</div>
              <h2 className="profile-name mb-4">
                {user.firstName || "Студент"} {user.lastName}
              </h2>
              <p className="profile-email mb-20">
                {user.email || "email@example.com"}
              </p>
              <button className="button profile-action mb-12" type="button">
                Изменить профиль
              </button>
              <button
                className="button button--ghost profile-action"
                type="button"
                onClick={handleSignOut}
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-8">
          <div className="profile-info">
            <h2 className="profile-info-title mb-20">Личные данные</h2>
            <div className="profile-grid">
              <div className="profile-field">
                <span className="profile-label">Имя</span>
                <strong>{user.firstName || "—"}</strong>
              </div>
              <div className="profile-field">
                <span className="profile-label">Фамилия</span>
                <strong>{user.lastName || "—"}</strong>
              </div>
              <div className="profile-field profile-field--full">
                <span className="profile-label">Почта</span>
                <strong>{user.email || "—"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
