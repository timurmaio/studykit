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
    <form
      id="signin-form"
      className="auth-form auth-card"
      onSubmit={handleSubmit}
    >
      <header className="auth-form_head mb-8">С возвращением</header>
      <p className="auth-form_subhead mb-24">
        Войдите, чтобы продолжить обучение
      </p>

      <label className="auth-form_label" htmlFor="email">
        Электронная почта:
      </label>
      <input
        id="email"
        name="email"
        className="input mb-20"
        type="text"
        onChange={handleChange}
        placeholder="example@mail.com"
        required
      />

      <label className="auth-form_label" htmlFor="password">
        Пароль:
      </label>
      <input
        id="password"
        name="password"
        className="input mb-20"
        type="password"
        onChange={handleChange}
        placeholder="******"
        required
      />

      <button
        id="signin-form-submit"
        className="button auth-form_submit mr-16"
        type="submit"
      >
        Войти
      </button>

      <Link
        to="/signup"
        id="signin-form-change"
        className="button button--auth-change auth-form_switch"
      >
        Регистрация
      </Link>

      {error ? (
        <div className="alert alert-warning mt-16 mb-0">{error}</div>
      ) : null}
    </form>
  );
}
