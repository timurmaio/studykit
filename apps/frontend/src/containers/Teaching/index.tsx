import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { apiGet, apiPost } from "../../config";
import type { CourseItem } from "../../types/Course";

export function Teaching() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const loadCourses = useCallback(() => {
    if (!user?.id) return;
    setIsLoading(true);
    apiGet<CourseItem[]>(`/api/courses?owner=${user.id}`)
      .then(setCourses)
      .catch(() => setError("Не удалось загрузить курсы"))
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim() || isCreating) return;
    setIsCreating(true);
    setCreateError("");
    try {
      const res = await apiPost<{ id: number }>("/api/courses", {
        course: { title: createTitle.trim(), description: createDescription.trim() || undefined },
      });
      setCreateTitle("");
      setCreateDescription("");
      setShowCreateForm(false);
      loadCourses();
      toast.success("Курс создан");
      if (res?.id) {
        navigate(`/courses/${res.id}`);
      }
    } catch (err: unknown) {
      setCreateError(String((err as { errors?: string })?.errors ?? "Ошибка создания курса"));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 teaching-page">
      <h1 className="text-3xl font-bold mb-6">Преподавание</h1>
      <p className="text-[var(--color-text-muted)] mb-8">
        Здесь вы управляете своими курсами: создавайте новые, добавляйте лекции и задания.
      </p>

      {showCreateForm ? (
        <form onSubmit={handleCreate} className="panel p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Новый курс</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Название</label>
            <input
              type="text"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="Название курса"
              className="block w-full max-w-md py-2 px-3 text-base leading-snug text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border-strong)] rounded-[6px] outline-none focus:border-[var(--color-accent)]"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Описание (необязательно)</label>
            <textarea
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="Краткое описание курса"
              rows={3}
              className="block w-full max-w-md py-2 px-3 text-base leading-snug text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border-strong)] rounded-[6px] outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          {createError && <div className="mb-4 text-[var(--color-danger)] text-sm">{createError}</div>}
          <div className="flex gap-3">
            <button type="submit" className="button" disabled={isCreating}>
              {isCreating ? "Создание..." : "Создать курс"}
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                setShowCreateForm(false);
                setCreateError("");
              }}
            >
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="button mb-8"
          onClick={() => setShowCreateForm(true)}
        >
          Создать курс
        </button>
      )}

      {error && (
        <div className="alert alert-warning mb-6">{error}</div>
      )}

      {isLoading ? (
        <div className="text-[var(--color-text-muted)]">Загрузка курсов...</div>
      ) : courses.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-[var(--color-text-muted)] mb-4">
            У вас пока нет курсов. Создайте первый курс, чтобы начать добавлять материалы.
          </p>
          {!showCreateForm && (
            <button type="button" className="button" onClick={() => setShowCreateForm(true)}>
              Создать курс
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="panel p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <Link to={`/courses/${course.id}`} className="font-semibold hover:underline">
                  {course.title}
                </Link>
                {course.description && (
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    {course.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Link to={`/courses/${course.id}`} className="button button--ghost">
                  Открыть
                </Link>
                <Link to={`/courses/${course.id}/analytics`} className="button button--ghost">
                  Аналитика
                </Link>
                <Link
                  to={`/courses/${course.id}/teach`}
                  className="button"
                >
                  Добавить контент
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
