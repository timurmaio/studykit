import { SyntheticEvent } from "react";
import { Link } from "react-router-dom";

interface Props {
  handleSubmit: (event: SyntheticEvent) => void;
  handleChange: (event: SyntheticEvent) => void;
  changeFormType: () => void;
  error: string;
}

export function SignUpForm(props: Props) {
  const { handleSubmit, handleChange, changeFormType, error } = props;

  return (
    <form
      id="signup-form"
      className="auth-form auth-card"
      onSubmit={handleSubmit}
    >
      <header className="auth-form_head mb-8">Создать аккаунт</header>
      <p className="auth-form_subhead mb-24">
        Начни проходить курсы и отмечать прогресс
      </p>

      <label className="auth-form_label" htmlFor="firstName">
        Имя:
      </label>
      <input
        id="firstName"
        name="firstName"
        className="input mb-20"
        type="text"
        onChange={handleChange}
        placeholder="Иван"
        required
      />

      <label className="auth-form_label" htmlFor="lastName">
        Фамилия:
      </label>
      <input
        id="lastName"
        name="lastName"
        className="input mb-20"
        type="text"
        onChange={handleChange}
        placeholder="Иванов"
        required
      />

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
        id="signup-form-submit"
        className="button auth-form_submit mr-16"
        type="submit"
      >
        Зарегистрироваться
      </button>

      <Link
        to="/signin"
        id="signup-form-change"
        className="button button--auth-change auth-form_switch"
        onClick={changeFormType}
      >
        Вход
      </Link>

      {error ? (
        <div className="alert alert-warning mt-16 mb-0">{error}</div>
      ) : null}
    </form>
  );
}
