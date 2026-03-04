import { SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { TextField, Label, Input, Button } from "react-aria-components";

interface Props {
  handleSubmit: (event: SyntheticEvent) => void;
  handleChange: (event: SyntheticEvent) => void;
  handleBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  error: string;
  fieldErrors: { email?: string; password?: string };
  isLoading?: boolean;
}

export function SignInForm(props: Props) {
  const { handleSubmit, handleChange, handleBlur, error, fieldErrors, isLoading = false } = props;
  return (
    <form id="signin-form" className="auth-form" onSubmit={handleSubmit}>
      <h1 className="auth-form_head mb-2">С возвращением</h1>
      <p className="auth-form_subhead mb-8">
        Войдите, чтобы продолжить обучение
      </p>

      <TextField name="email" isRequired className="mb-5" >
        <Label className="auth-form_label mb-1">Email</Label>
        <Input
          type="email"
          name="email"
          className={`input w-full${fieldErrors.email ? " input--error" : ""}`}
          onChange={handleChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
          onBlur={handleBlur}
          placeholder="example@mail.com"
          aria-describedby={fieldErrors.email ? "signin-email-error" : undefined}
        />
        {fieldErrors.email ? (
          <p id="signin-email-error" className="form-field-error mt-1" role="alert">
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
          aria-describedby={fieldErrors.password ? "signin-password-error" : undefined}
        />
        {fieldErrors.password ? (
          <p id="signin-password-error" className="form-field-error mt-1" role="alert">
            {fieldErrors.password}
          </p>
        ) : null}
      </TextField>

      <Button
        type="submit"
        id="signin-form-submit"
        className="button auth-form_submit mb-4"
        isDisabled={isLoading}
      >
        {isLoading ? "Вход..." : "Войти"}
      </Button>

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
        <div className="alert alert-warning mt-4 mb-0" role="alert">
          {error}
        </div>
      ) : null}
    </form>
  );
}
