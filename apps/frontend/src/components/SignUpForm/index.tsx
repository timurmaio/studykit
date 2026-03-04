import { SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { TextField, Label, Input, Button } from "react-aria-components";

interface Props {
  handleSubmit: (event: SyntheticEvent) => void;
  handleChange: (event: SyntheticEvent) => void;
  changeFormType: () => void;
  error: string;
  isLoading?: boolean;
}

export function SignUpForm(props: Props) {
  const { handleSubmit, handleChange, changeFormType, error, isLoading = false } = props;

  return (
    <form id="signup-form" className="auth-form" onSubmit={handleSubmit}>
      <h1 className="auth-form_head mb-2">Создать аккаунт</h1>
      <p className="auth-form_subhead mb-8">
        Начни проходить курсы и отмечать прогресс
      </p>

      <div className="auth-form_row mb-5">
        <TextField name="firstName" isRequired>
          <Label className="auth-form_label mb-1">Имя</Label>
          <Input
            type="text"
            name="firstName"
            className="input w-full"
            onChange={handleChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            placeholder="Иван"
          />
        </TextField>
        <TextField name="lastName" isRequired>
          <Label className="auth-form_label mb-1">Фамилия</Label>
          <Input
            type="text"
            name="lastName"
            className="input w-full"
            onChange={handleChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            placeholder="Иванов"
          />
        </TextField>
      </div>

      <TextField name="email" isRequired className="mb-5">
        <Label className="auth-form_label mb-1">Email</Label>
        <Input
          type="email"
          name="email"
          className="input w-full"
          onChange={handleChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
          placeholder="example@mail.com"
        />
      </TextField>

      <TextField name="password" isRequired className="mb-6">
        <Label className="auth-form_label mb-1">Пароль</Label>
        <Input
          type="password"
          name="password"
          className="input w-full"
          onChange={handleChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
          placeholder="••••••"
        />
      </TextField>

      <Button
        type="submit"
        id="signup-form-submit"
        className="button auth-form_submit mb-4"
        isDisabled={isLoading}
      >
        {isLoading ? "Регистрация..." : "Зарегистрироваться"}
      </Button>

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
        <div className="alert alert-warning mt-4 mb-0" role="alert">
          {error}
        </div>
      ) : null}
    </form>
  );
}
