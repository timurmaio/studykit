import { SyntheticEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../config";
import { SignUpForm } from "../../components/SignUpForm";

interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: number;
}

export function SignUp() {
  const navigate = useNavigate();

  const [state, setState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    error: "",
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

    const signUpData = {
      user: {
        first_name: state.firstName,
        last_name: state.lastName,
        email: state.email,
        password: state.password,
      },
    };

    try {
      await apiPost<UserResponse>("/api/users", signUpData);
      window.dispatchEvent(new CustomEvent("auth:signin"));
      navigate("/courses");
    } catch (err: unknown) {
      const errors = (err as { errors?: string | string[] })?.errors;
      setState({
        ...state,
        error: Array.isArray(errors) ? errors.join(", ") : String(errors ?? "Ошибка регистрации"),
      });
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
          <SignUpForm
            error={state.error}
            changeFormType={() => navigate("/signin")}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
