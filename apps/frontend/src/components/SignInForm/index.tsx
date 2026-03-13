import { SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { handleSubmit, handleChange, handleBlur, error, fieldErrors, isLoading = false } = props;
  return (
    <form id="signin-form" className="auth-form" onSubmit={handleSubmit}>
      <h1 className="auth-form_head mb-2">{t("auth.welcomeBack")}</h1>
      <p className="auth-form_subhead mb-8">{t("auth.signInToContinue")}</p>

      <TextField name="email" isRequired className="mb-5" >
        <Label className="auth-form_label mb-1">{t("auth.email")}</Label>
        <Input
          type="email"
          name="email"
          className={`input w-full${fieldErrors.email ? " input--error" : ""}`}
          onChange={handleChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
          onBlur={handleBlur}
          placeholder={t("auth.emailPlaceholder")}
          aria-describedby={fieldErrors.email ? "signin-email-error" : undefined}
        />
        {fieldErrors.email ? (
          <p id="signin-email-error" className="form-field-error mt-1" role="alert">
            {fieldErrors.email}
          </p>
        ) : null}
      </TextField>

      <TextField name="password" isRequired className="mb-6" >
        <Label className="auth-form_label mb-1">{t("auth.password")}</Label>
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
        {isLoading ? t("auth.signingIn") : t("auth.signIn")}
      </Button>

      <p className="auth-form_footer">
        {t("auth.noAccount")}{" "}
        <Link
          to="/signup"
          id="signin-form-change"
          className="auth-form_switch-link"
        >
          {t("auth.createAccount")}
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
