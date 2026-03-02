import { SyntheticEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TextField, Label, Input, TextArea, Button } from "react-aria-components";
import { apiPost } from "../../config";

function NewCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    type: "MarkdownContent",
    serial: "",
    title: "",
    body: "",
  });

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    const courseId = id;
    if (!courseId) return;

    try {
      await apiPost(`/api/courses/${courseId}/content`, {
        course_content: {
          title: state.title,
          body: state.body,
          serial_number: state.serial,
          type: state.type,
        },
      });
      navigate(`/courses/${courseId}`);
    } catch {
      // TODO: show error to user
    }
  };

  const handleInputChange = (event: SyntheticEvent) => {
    const target = event.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    const name = target.name;
    const value = target.value;
    setState({ ...state, [name]: value });
  };

  return (
    <form className="new-content-form" onSubmit={handleSubmit}>
      <TextField name="title" className="form-group mb-4">
        <Label className="auth-form_label block mb-1">Название</Label>
        <Input
          type="text"
          name="title"
          value={state.title}
          className="block w-full py-2 px-3 text-base leading-snug text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border-strong)] rounded-[6px] outline-none transition-colors duration-150 focus:border-[var(--color-accent)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] placeholder:text-[var(--color-text-muted)] disabled:bg-[var(--color-bg)] disabled:cursor-not-allowed"
          id="new-content-title"
          placeholder="Название лекции"
          onChange={handleInputChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
        />
      </TextField>

      <TextField name="serial" className="form-group mb-4">
        <Label className="auth-form_label block mb-1" htmlFor="new-content-serial">
          Порядковый номер
        </Label>
        <Input
          type="text"
          name="serial"
          value={state.serial}
          className="block w-full py-2 px-3 text-base leading-snug text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border-strong)] rounded-[6px] outline-none transition-colors duration-150 focus:border-[var(--color-accent)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] placeholder:text-[var(--color-text-muted)] disabled:bg-[var(--color-bg)] disabled:cursor-not-allowed"
          id="new-content-serial"
          placeholder="Например: 3"
          onChange={handleInputChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
        />
      </TextField>

      <div className="form-group mb-5">
        <label htmlFor="new-content-type" className="auth-form_label block mb-1">
          Тип контента
        </label>
        <select
          className="block w-full py-2 px-3 text-base leading-snug text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border-strong)] rounded-[6px] outline-none transition-colors duration-150 focus:border-[var(--color-accent)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] placeholder:text-[var(--color-text-muted)] disabled:bg-[var(--color-bg)] disabled:cursor-not-allowed"
          name="type"
          id="new-content-type"
          value={state.type}
          onChange={handleInputChange}
        >
          <option value="MarkdownContent">Лекция</option>
          <option value="SqlProblemContent">Практика SQL</option>
        </select>
      </div>

      <TextField name="body" className="form-group mb-5">
        <Label className="auth-form_label block mb-1" htmlFor="new-content-body">
          Содержимое
        </Label>
        <TextArea
          name="body"
          id="new-content-body"
          value={state.body}
          rows={6}
          className="block w-full py-2 px-3 text-base leading-snug text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border-strong)] rounded-[6px] outline-none transition-colors duration-150 focus:border-[var(--color-accent)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] placeholder:text-[var(--color-text-muted)] disabled:bg-[var(--color-bg)] disabled:cursor-not-allowed"
          onChange={handleInputChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
        />
      </TextField>

      <Button type="submit" className="button auth-form_submit">
        Создать
      </Button>
    </form>
  );
}

export default NewCourse;
