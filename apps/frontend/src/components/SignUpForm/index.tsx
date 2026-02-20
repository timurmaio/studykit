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
    <form id="signup-form" className="auth-form" onSubmit={handleSubmit}>
      <h1 className="auth-form_head mb-8">Создать аккаунт</h1>
      <p className="auth-form_subhead mb-32">
        Начни проходить курсы и отмечать прогресс
      </p>

      <div className="auth-form_row mb-20">
        <div>
          <label className="auth-form_label mb-4" htmlFor="firstName">
            Имя
          </label>
          <input
            id="firstName"
            name="firstName"
            className="input"
            type="text"
            onChange={handleChange}
            placeholder="Иван"
            required
          />
        </div>
        <div>
          <label className="auth-form_label mb-4" htmlFor="lastName">
            Фамилия
          </label>
          <input
            id="lastName"
            name="lastName"
            className="input"
            type="text"
            onChange={handleChange}
            placeholder="Иванов"
            required
          />
        </div>
      </div>

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
        id="signup-form-submit"
        className="button auth-form_submit mb-16"
        type="submit"
      >
        Зарегистрироваться
      </button>

      <p className="auth-form_footer">
        Уже есть аккаунт?{" "}
        <Link
          to="/signin"
          id="signup-form-change"
          className="auth-form_switch-link"
          onClick={changeFormType}
        >
          Войти
        </Link>
      </p>

      {error ? (
        <div className="alert alert-warning mt-16 mb-0">{error}</div>
      ) : null}
    </form>
  );
}
