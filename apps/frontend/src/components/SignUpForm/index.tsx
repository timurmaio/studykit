import { SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { TextField, Label, Input, Button } from "react-aria-components";

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

interface Props {
  handleSubmit: (event: SyntheticEvent) => void;
  handleChange: (event: SyntheticEvent) => void;
  handleBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  changeFormType: () => void;
  error: string;
  fieldErrors: FieldErrors;
  isLoading?: boolean;
}

export function SignUpForm(props: Props) {
  const { handleSubmit, handleChange, handleBlur, changeFormType, error, fieldErrors, isLoading = false } = props;

  return (
    <form id="signup-form" className="auth-form" onSubmit={handleSubmit}>
      <h1 className="auth-form_head mb-2">Создать аккаунт</h1>
      <p className="auth-form_subhead mb-8">
        Начни проходить курсы и отмечать прогресс
      </p>

      <div className="auth-form_row mb-5">
        <TextField name="firstName" isRequired >
          <Label className="auth-form_label mb-1">Имя</Label>
          <Input
            type="text"
            name="firstName"
            className={`input w-full${fieldErrors.firstName ? " input--error" : ""}`}
            onChange={handleChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            onBlur={handleBlur}
            placeholder="Иван"
            aria-describedby={fieldErrors.firstName ? "signup-firstname-error" : undefined}
          />
          {fieldErrors.firstName ? (
            <p id="signup-firstname-error" className="form-field-error mt-1" role="alert">
              {fieldErrors.firstName}
            </p>
          ) : null}
        </TextField>
        <TextField name="lastName" isRequired >
          <Label className="auth-form_label mb-1">Фамилия</Label>
          <Input
            type="text"
            name="lastName"
            className={`input w-full${fieldErrors.lastName ? " input--error" : ""}`}
            onChange={handleChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            onBlur={handleBlur}
            placeholder="Иванов"
            aria-describedby={fieldErrors.lastName ? "signup-lastname-error" : undefined}
          />
          {fieldErrors.lastName ? (
            <p id="signup-lastname-error" className="form-field-error mt-1" role="alert">
              {fieldErrors.lastName}
            </p>
          ) : null}
        </TextField>
      </div>

      <TextField name="email" isRequired className="mb-5" >
        <Label className="auth-form_label mb-1">Email</Label>
        <Input
          type="email"
          name="email"
          className={`input w-full${fieldErrors.email ? " input--error" : ""}`}
          onChange={handleChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
          onBlur={handleBlur}
          placeholder="example@mail.com"
          aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
        />
        {fieldErrors.email ? (
          <p id="signup-email-error" className="form-field-error mt-1" role="alert">
            {fieldErrors.email}
          </p>
        ) : null}
      </TextField>

      <TextField name="password" isRequired className="mb-6" >
        <Label className="auth-form_label mb-1">Пароль</Label>
        <Input
          type="password"
          name="password"
          className={`input w-full${fieldErrors.password ? " input--error" : ""}`}
          onChange={handleChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
          onBlur={handleBlur}
          placeholder="••••••"
          aria-describedby={fieldErrors.password ? "signup-password-error" : undefined}
        />
        {fieldErrors.password ? (
          <p id="signup-password-error" className="form-field-error mt-1" role="alert">
            {fieldErrors.password}
          </p>
        ) : null}
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
