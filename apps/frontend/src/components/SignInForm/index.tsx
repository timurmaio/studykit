import { SyntheticEvent } from "react";
import { Link } from "react-router-dom";

interface Props {
  handleSubmit: (event: SyntheticEvent) => void;
  handleChange: (event: SyntheticEvent) => void;
  error: string;
}

export function SignInForm(props: Props) {
  const { handleSubmit, handleChange, error } = props;
  return (
    <form id="signin-form" className="auth-form" onSubmit={handleSubmit}>
      <h1 className="auth-form_head mb-8">С возвращением</h1>
      <p className="auth-form_subhead mb-32">
        Войдите, чтобы продолжить обучение
      </p>

      <label className="auth-form_label mb-4" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        name="email"
        className="input mb-20"
        type="email"
        onChange={handleChange}
        placeholder="example@mail.com"
        required
      />

      <label className="auth-form_label mb-4" htmlFor="password">
        Пароль
      </label>
      <input
        id="password"
        name="password"
        className="input mb-24"
        type="password"
        onChange={handleChange}
        placeholder="••••••"
        required
      />

      <button
        id="signin-form-submit"
        className="button auth-form_submit mb-16"
        type="submit"
      >
        Войти
      </button>

      <p className="auth-form_footer">
        Нет аккаунта?{" "}
        <Link
          to="/signup"
          id="signin-form-change"
          className="auth-form_switch-link"
        >
          Создать аккаунт
        </Link>
      </p>

      {error ? (
        <div className="alert alert-warning mt-16 mb-0">{error}</div>
      ) : null}
    </form>
  );
}
