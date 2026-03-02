import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL, createAxios } from "../../config";

export function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

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

    const axios = createAxios();

    // Load user profile
    axios
      .get(`${API_URL}/api/users/${userId}`)
      .then((res) => res.data)
      .then((data) => {
        setUser({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
        });
        setEditForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
        });
      })
      .catch(() => {
        setUser({ firstName: "", lastName: "", email: "" });
      });

    // Load user's courses with progress
    axios
      .get(`${API_URL}/api/users/${userId}/courses`)
      .then((res) => res.data)
      .then((data) => {
        setCourses(data || []);
      })
      .catch(() => {
        setCourses([]);
      });
  }, []);

  const handleSaveProfile = () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    setIsSaving(true);
    const axios = createAxios();

    axios
      .put(`${API_URL}/api/users/${userId}`, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
      })
      .then((res) => res.data)
      .then((data) => {
        setUser({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
        });
        setIsEditing(false);
      })
      .catch(() => {
        alert("Не удалось обновить профиль");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

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
              <button 
                className="button profile-action mb-12" 
                type="button"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Отмена" : "Изменить профиль"}
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
            
            {isEditing ? (
              <div className="profile-edit-form mb-20">
                <div className="profile-field">
                  <span className="profile-label">Имя</span>
                  <input
                    type="text"
                    className="input"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    placeholder="Введите имя"
                  />
                </div>
                <div className="profile-field">
                  <span className="profile-label">Фамилия</span>
                  <input
                    type="text"
                    className="input"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    placeholder="Введите фамилию"
                  />
                </div>
                <button
                  className="button mt-16"
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            ) : (
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
            )}
          </div>

          {courses.length > 0 && (
            <div className="profile-info mt-24">
              <h2 className="profile-info-title mb-20">Мои курсы</h2>
              <div className="courses-list">
                {courses.map((course) => (
                  <div key={course.id} className="course-item mb-16">
                    <div className="course-item-header">
                      <span className="course-item-title">{course.title}</span>
                      <span className="course-item-progress">
                        {course.progress.percentage}%
                      </span>
                    </div>
                    <div className="course-progress-bar">
                      <div 
                        className="course-progress-bar__fill" 
                        style={{ width: `${course.progress.percentage}%` }}
                      />
                    </div>
                    <div className="course-item-stats">
                      {course.progress.completedContent} / {course.progress.totalContent} уроков
                      {course.progress.solvedProblems > 0 && (
                        <span className="ml-16">
                          ✓ {course.progress.solvedProblems} задач решено
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
