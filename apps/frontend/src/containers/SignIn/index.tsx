import { SyntheticEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../config";
import { SignInForm } from "../../components/SignInForm";
import { validateEmail, validatePassword } from "../../utils/validation";

interface LoginResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: number;
}

export function SignIn() {
  const navigate = useNavigate();
  const [state, setState] = useState({
    email: "",
    password: "",
    error: "",
    isLoading: false,
  });
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleChange = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    const name = target.name;
    const value = target.value;

    setState((s) => ({ ...s, [name]: value }));
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((e) => ({ ...e, [name]: undefined }));
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "email") {
      setFieldErrors((e) => ({ ...e, email: validateEmail(value) ?? undefined }));
    } else if (name === "password") {
      setFieldErrors((e) => ({ ...e, password: validatePassword(value) ?? undefined }));
    }
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    const emailErr = validateEmail(state.email);
    const passwordErr = validatePassword(state.password);
    setFieldErrors({
      email: emailErr ?? undefined,
      password: passwordErr ?? undefined,
    });
    if (emailErr || passwordErr) return;

    setState((s) => ({ ...s, isLoading: true, error: "" }));
    try {
      const signInData = {
        user: { email: state.email, password: state.password },
      };
      await apiPost<LoginResponse>("/api/users/login", signInData);
      window.dispatchEvent(new CustomEvent("auth:signin"));
      navigate("/courses");
    } catch (err: unknown) {
      const errors = (err as { errors?: string | string[] })?.errors;
      setState((s) => ({
        ...s,
        isLoading: false,
        error: Array.isArray(errors) ? errors.join(", ") : String(errors ?? "Ошибка входа"),
      }));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand" aria-hidden="true">
        <h2 className="auth-brand-statement">
          Учись.<br />Расти.<br />Достигай.
        </h2>
        <p className="auth-brand-tagline">
          Образовательная платформа — всё, что нужно для роста, в одном месте.
        </p>
        <div className="auth-brand-logo">StudyKit</div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <SignInForm
            error={state.error}
            fieldErrors={fieldErrors}
            isLoading={state.isLoading}
            handleChange={handleChange}
            handleBlur={handleBlur}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
