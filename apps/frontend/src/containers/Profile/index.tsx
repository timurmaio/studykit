import { useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { apiPut } from "../../config";
import { useProfileLoaderData } from "../../routes";

interface ProfileState {
  user: { firstName: string; lastName: string; email: string };
  isEditing: boolean;
  editForm: { firstName: string; lastName: string };
  isSaving: boolean;
  courses: unknown[];
}

type ProfileAction =
  | { type: "SET_USER"; payload: { firstName: string; lastName: string; email: string } }
  | { type: "SET_EDIT_FORM"; payload: { firstName?: string; lastName?: string } }
  | { type: "SET_IS_EDITING"; payload: boolean }
  | { type: "SET_IS_SAVING"; payload: boolean }
  | { type: "SET_COURSES"; payload: unknown[] }
  | { type: "RESET_USER" };

function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        editForm: { firstName: action.payload.firstName, lastName: action.payload.lastName },
      };
    case "SET_EDIT_FORM":
      return { ...state, editForm: { ...state.editForm, ...action.payload } };
    case "SET_IS_EDITING":
      return { ...state, isEditing: action.payload };
    case "SET_IS_SAVING":
      return { ...state, isSaving: action.payload };
    case "SET_COURSES":
      return { ...state, courses: action.payload };
    case "RESET_USER":
      return {
        ...state,
        user: { firstName: "", lastName: "", email: "" },
        editForm: { firstName: "", lastName: "" },
      };
    default:
      return state;
  }
}

export function Profile() {
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth();
  const { user: loaderUser, courses: loaderCourses } = useProfileLoaderData();

  const initialState: ProfileState = {
    user: loaderUser ?? { firstName: "", lastName: "", email: "" },
    isEditing: false,
    editForm: loaderUser
      ? { firstName: loaderUser.firstName, lastName: loaderUser.lastName }
      : { firstName: "", lastName: "" },
    isSaving: false,
    courses: loaderCourses ?? [],
  };

  const [state, dispatch] = useReducer(profileReducer, initialState);

  const handleSignOut = () => {
    signOut();
    window.dispatchEvent(new CustomEvent("auth:signout"));
    navigate("/signin");
  };


  const handleSaveProfile = async () => {
    const userId = authUser?.id;
    if (!userId) return;

    dispatch({ type: "SET_IS_SAVING", payload: true });
    try {
      const data = await apiPut<{ firstName: string; lastName: string; email: string }>(
        `/api/users/${userId}`,
        {
          firstName: state.editForm.firstName,
          lastName: state.editForm.lastName,
        }
      );
      dispatch({
        type: "SET_USER",
        payload: {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
        },
      });
      dispatch({ type: "SET_IS_EDITING", payload: false });
    } catch {
      alert("Не удалось обновить профиль");
    } finally {
      dispatch({ type: "SET_IS_SAVING", payload: false });
    }
  };

  const initials =
    `${state.user.firstName.charAt(0)}${state.user.lastName.charAt(0)}`.trim() || "SK";

  return (
    <div className="mx-auto max-w-6xl px-4 profile-page">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 mb-6">
          <div className="profile-card">
            <div className="profile-card-banner" aria-hidden="true" />
            <div className="profile-card-body">
              <div className="profile-avatar">{initials}</div>
              <h2 className="profile-name mb-1">
                {state.user.firstName || "Студент"} {state.user.lastName}
              </h2>
              <p className="profile-email mb-5">
                {state.user.email || "email@example.com"}
              </p>
              <button
                className="button profile-action mb-3"
                type="button"
                onClick={() => dispatch({ type: "SET_IS_EDITING", payload: !state.isEditing })}
              >
                {state.isEditing ? "Отмена" : "Изменить профиль"}
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

            {state.isEditing ? (
              <div className="profile-edit-form mb-5">
                <div className="profile-field">
                  <span className="profile-label">Имя</span>
                  <input
                    type="text"
                    className="input"
                    value={state.editForm.firstName}
                    onChange={(e) =>
                      dispatch({ type: "SET_EDIT_FORM", payload: { firstName: e.target.value } })
                    }
                    placeholder="Введите имя"
                  />
                </div>
                <div className="profile-field">
                  <span className="profile-label">Фамилия</span>
                  <input
                    type="text"
                    className="input"
                    value={state.editForm.lastName}
                    onChange={(e) =>
                      dispatch({ type: "SET_EDIT_FORM", payload: { lastName: e.target.value } })
                    }
                    placeholder="Введите фамилию"
                  />
                </div>
                <button
                  className="button mt-4"
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={state.isSaving}
                >
                  {state.isSaving ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            ) : (
              <div className="profile-grid">
                <div className="profile-field">
                  <span className="profile-label">Имя</span>
                  <strong>{state.user.firstName || "—"}</strong>
                </div>
                <div className="profile-field">
                  <span className="profile-label">Фамилия</span>
                  <strong>{state.user.lastName || "—"}</strong>
                </div>
                <div className="profile-field profile-field--full">
                  <span className="profile-label">Почта</span>
                  <strong>{state.user.email || "—"}</strong>
                </div>
              </div>
            )}
          </div>

          {state.courses.length > 0 && (
            <div className="profile-info mt-6">
              <h2 className="profile-info-title mb-5">Мои курсы</h2>
              <div className="courses-list">
                {(state.courses as { id: number; title: string; progress: { percentage: number; completedContent: number; totalContent: number; solvedProblems: number } }[]).map((course) => (
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
