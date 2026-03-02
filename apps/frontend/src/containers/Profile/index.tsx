import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { apiGet, apiPut } from "../../config";

export function Profile() {
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth();
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [courses, setCourses] = useState<unknown[]>([]);

  const handleSignOut = () => {
    signOut();
    window.dispatchEvent(new CustomEvent("auth:signout"));
    navigate("/signin");
  };

  useEffect(() => {
    const userId = authUser?.id;
    if (!userId) {
      return;
    }

    apiGet<{ firstName: string; lastName: string; email: string }>(
      `/api/users/${userId}`
    )
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

    apiGet<unknown[]>(`/api/users/${userId}/courses`)
      .then((data) => setCourses(data || []))
      .catch(() => setCourses([]));
  }, []);

  const handleSaveProfile = async () => {
    const userId = authUser?.id;
    if (!userId) return;

    setIsSaving(true);
    try {
      const data = await apiPut<{ firstName: string; lastName: string; email: string }>(
        `/api/users/${userId}`,
        {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
        }
      );
      setUser({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
      });
      setIsEditing(false);
    } catch {
      alert("Не удалось обновить профиль");
    } finally {
      setIsSaving(false);
    }
  };

  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.trim() || "SK";

  return (
    <div className="mx-auto max-w-6xl px-4 profile-page">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 mb-6">
          <div className="profile-card">
            <div className="profile-card-banner" aria-hidden="true" />
            <div className="profile-card-body">
              <div className="profile-avatar">{initials}</div>
              <h2 className="profile-name mb-1">
                {user.firstName || "Студент"} {user.lastName}
              </h2>
              <p className="profile-email mb-5">
                {user.email || "email@example.com"}
              </p>
              <button
                className="button profile-action mb-3"
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
        <div className="lg:col-span-8">
          <div className="profile-info">
            <h2 className="profile-info-title mb-5">Личные данные</h2>

            {isEditing ? (
              <div className="profile-edit-form mb-5">
                <div className="profile-field">
                  <span className="profile-label">Имя</span>
                  <input
                    type="text"
                    className="input"
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                    placeholder="Введите имя"
                  />
                </div>
                <div className="profile-field">
                  <span className="profile-label">Фамилия</span>
                  <input
                    type="text"
                    className="input"
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                    placeholder="Введите фамилию"
                  />
                </div>
                <button
                  className="button mt-4"
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
            <div className="profile-info mt-6">
              <h2 className="profile-info-title mb-5">Мои курсы</h2>
              <div className="courses-list">
                {(courses as { id: number; title: string; progress: { percentage: number; completedContent: number; totalContent: number; solvedProblems: number } }[]).map((course) => (
                  <div key={course.id} className="course-item mb-4">
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
                      {course.progress.completedContent} /{" "}
                      {course.progress.totalContent} уроков
                      {course.progress.solvedProblems > 0 && (
                        <span className="ml-4">
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
