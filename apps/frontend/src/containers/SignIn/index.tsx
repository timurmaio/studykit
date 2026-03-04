import { SyntheticEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../config";
import { SignInForm } from "../../components/SignInForm";

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

  const handleChange = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    const name = target.name;
    const value = target.value;

    setState({
      ...state,
      [name]: value,
    });
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    const signInData = {
      user: {
        email: state.email,
        password: state.password,
      },
    };

    setState((s) => ({ ...s, isLoading: true, error: "" }));
    try {
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
            isLoading={state.isLoading}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
