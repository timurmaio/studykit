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
      className="auth-form shadow mt-40"
      onSubmit={handleSubmit}
    >
      <header className="auth-form_head mb-24">Вход в систему</header>

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

      <button id="signin-form-submit" className="button mr-20" type="submit">
        Войти
      </button>

      <Link
        to="/signup"
        id="signin-form-change"
        className="button button--auth-change"
      >
        Регистрация
      </Link>

      <div className="alert">{error}</div>
    </form>
  );
}
