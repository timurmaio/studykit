import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TextField, Label, Input, TextArea, Button } from "react-aria-components";
import { apiGet, apiPost } from "../../config";
import type { CourseItem } from "../../types/Course";

const inputClass =
  "block w-full py-2 px-3 text-base leading-snug text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border-strong)] rounded-[6px] outline-none transition-colors duration-150 focus:border-[var(--color-accent)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] placeholder:text-[var(--color-text-muted)] disabled:bg-[var(--color-bg)] disabled:cursor-not-allowed";

export function NewCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseItem | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState({
    lecture_id: "",
    type: "MarkdownContent" as "MarkdownContent" | "SqlProblemContent",
    serial: "0",
    title: "",
    body: "",
    initial_code: "SELECT 1;",
    solution_code: "SELECT 1;",
  });
  const [fieldErrors, setFieldErrors] = useState<{ lecture_id?: string; title?: string }>({});

  useEffect(() => {
    if (!id) return;
    apiGet<CourseItem>(`/api/courses/${id}`)
      .then(setCourse)
      .catch(() => setError("Не удалось загрузить курс"));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const courseId = id;
    const lectureId = Number(state.lecture_id);
    const newErrors: { lecture_id?: string; title?: string } = {};
    if (!courseId || !lectureId) {
      newErrors.lecture_id = "Выберите раздел лекции";
    }
    if (!state.title.trim()) {
      newErrors.title = "Укажите название";
    }
    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        course_content: {
          lecture_id: lectureId,
          title: state.title.trim(),
          body: state.body,
          serial_number: state.serial ? parseInt(state.serial, 10) : 0,
          type: state.type,
        },
      };
      if (state.type === "SqlProblemContent") {
        (payload.course_content as Record<string, unknown>).initial_code = state.initial_code || "SELECT 1;";
        (payload.course_content as Record<string, unknown>).solution_code = state.solution_code || "SELECT 1;";
      }
      await apiPost(`/api/courses/${courseId}/contents`, payload);
      navigate(`/courses/${courseId}`);
    } catch (err: unknown) {
      setError(String((err as { errors?: string })?.errors ?? "Ошибка при создании"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setState((s) => ({ ...s, [name]: value }));
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (!course && !error) {
    return <div className="mx-auto max-w-6xl px-4 py-8">Загрузка...</div>;
  }

  if (error && !course) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="alert alert-warning">{error}</div>
        <Link to="/teaching" className="link mt-4 inline-block">Назад к преподаванию</Link>
      </div>
    );
  }

  const lectures = course?.lectures ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to={`/courses/${id}`} className="link mb-6 inline-block">← Назад к курсу</Link>
      <h2 className="text-2xl font-bold mb-6">Добавить контент</h2>

      <form className="new-content-form panel p-6" onSubmit={handleSubmit}>
        <div className="form-group mb-4">
          <label htmlFor="lecture_id" className="auth-form_label block mb-1">Раздел</label>
          <select
            id="lecture_id"
            name="lecture_id"
            value={state.lecture_id}
            onChange={handleChange}
            className={`${inputClass}${fieldErrors.lecture_id ? " input--error" : ""}`}
            required
            aria-describedby={fieldErrors.lecture_id ? "newcourse-lecture-error" : undefined}
            aria-invalid={!!fieldErrors.lecture_id}
          >
            <option value="">Выберите раздел</option>
            {lectures.map((l) => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
          {fieldErrors.lecture_id ? (
            <p id="newcourse-lecture-error" className="form-field-error mt-1" role="alert">
              {fieldErrors.lecture_id}
            </p>
          ) : null}
        </div>

        <TextField name="title" className="form-group mb-4" >
          <Label className="auth-form_label block mb-1">Название</Label>
          <Input
            type="text"
            name="title"
            value={state.title}
            className={`${inputClass}${fieldErrors.title ? " input--error" : ""}`}
            placeholder="Название лекции или задания"
            onChange={handleChange}
            onBlur={(e) => {
              const v = (e.target as HTMLInputElement).value;
              setFieldErrors((prev) => ({ ...prev, title: !v.trim() ? "Укажите название" : undefined }));
            }}
            aria-describedby={fieldErrors.title ? "newcourse-title-error" : undefined}
          />
          {fieldErrors.title ? (
            <p id="newcourse-title-error" className="form-field-error mt-1" role="alert">
              {fieldErrors.title}
            </p>
          ) : null}
        </TextField>

        <div className="form-group mb-4">
          <Label className="auth-form_label block mb-1" htmlFor="serial">Порядковый номер</Label>
          <Input
            type="text"
            name="serial"
            id="serial"
            value={state.serial}
            className={inputClass}
            placeholder="0"
            onChange={handleChange}
          />
        </div>

        <div className="form-group mb-5">
          <label htmlFor="type" className="auth-form_label block mb-1">Тип контента</label>
          <select
            id="type"
            name="type"
            className={inputClass}
            value={state.type}
            onChange={handleChange}
          >
            <option value="MarkdownContent">Лекция (Markdown)</option>
            <option value="SqlProblemContent">Практика SQL</option>
          </select>
        </div>

        <div className="form-group mb-5">
          <Label className="auth-form_label block mb-1" htmlFor="body">
            {state.type === "MarkdownContent" ? "Содержимое (Markdown)" : "Описание задания"}
          </Label>
          <TextArea
            name="body"
            id="body"
            value={state.body}
            rows={6}
            className={inputClass}
            onChange={handleChange}
          />
        </div>

        {state.type === "SqlProblemContent" && (
          <>
            <div className="form-group mb-5">
              <Label className="auth-form_label block mb-1" htmlFor="initial_code">Начальный код (setup)</Label>
              <TextArea
                name="initial_code"
                id="initial_code"
                value={state.initial_code}
                rows={4}
                className={`${inputClass} font-mono text-sm`}
                placeholder="CREATE TABLE ...; INSERT INTO ..."
                onChange={handleChange}
              />
            </div>
            <div className="form-group mb-5">
              <Label className="auth-form_label block mb-1" htmlFor="solution_code">Эталонное решение</Label>
              <TextArea
                name="solution_code"
                id="solution_code"
                value={state.solution_code}
                rows={4}
                className={`${inputClass} font-mono text-sm`}
                placeholder="SELECT ..."
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {error && <div className="mb-4 text-[var(--color-danger)] text-sm">{error}</div>}

        <div className="flex gap-3">
          <Button type="submit" className="button" isDisabled={isSubmitting}>
            {isSubmitting ? "Создание..." : "Создать"}
          </Button>
          <Link to={`/courses/${id}`} className="button button--ghost">Отмена</Link>
        </div>
      </form>
    </div>
  );
}
