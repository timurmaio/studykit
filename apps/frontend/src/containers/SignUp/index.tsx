import { SyntheticEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiPost } from "../../config";
import { SignUpForm } from "../../components/SignUpForm";
import { validateEmail, validatePassword, validateRequired } from "../../utils/validation";

interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: number;
}

type SignUpFieldErrors = { firstName?: string; lastName?: string; email?: string; password?: string };

export function SignUp() {
  const navigate = useNavigate();

  const [state, setState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    error: "",
    isLoading: false,
  });
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});

  const handleChange = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    const name = target.name;
    const value = target.value;

    setState((s) => ({ ...s, [name]: value }));
    if (fieldErrors[name as keyof SignUpFieldErrors]) {
      setFieldErrors((e) => ({ ...e, [name]: undefined }));
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "firstName") {
      setFieldErrors((e) => ({ ...e, firstName: validateRequired(value, "имя") ?? undefined }));
    } else if (name === "lastName") {
      setFieldErrors((e) => ({ ...e, lastName: validateRequired(value, "фамилию") ?? undefined }));
    } else if (name === "email") {
      setFieldErrors((e) => ({ ...e, email: validateEmail(value) ?? undefined }));
    } else if (name === "password") {
      setFieldErrors((e) => ({ ...e, password: validatePassword(value) ?? undefined }));
    }
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    const firstNameErr = validateRequired(state.firstName, "имя");
    const lastNameErr = validateRequired(state.lastName, "фамилию");
    const emailErr = validateEmail(state.email);
    const passwordErr = validatePassword(state.password);
    setFieldErrors({
      firstName: firstNameErr ?? undefined,
      lastName: lastNameErr ?? undefined,
      email: emailErr ?? undefined,
      password: passwordErr ?? undefined,
    });
    if (firstNameErr || lastNameErr || emailErr || passwordErr) return;

    const signUpData = {
      user: {
        first_name: state.firstName,
        last_name: state.lastName,
        email: state.email,
        password: state.password,
      },
    };

    setState((s) => ({ ...s, isLoading: true, error: "" }));
    try {
      await apiPost<UserResponse>("/api/users", signUpData);
      toast.success("Аккаунт создан");
      window.dispatchEvent(new CustomEvent("auth:signin"));
      navigate("/courses");
    } catch (err: unknown) {
      const errors = (err as { errors?: string | string[] })?.errors;
      setState((s) => ({
        ...s,
        isLoading: false,
        error: Array.isArray(errors) ? errors.join(", ") : String(errors ?? "Ошибка регистрации"),
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
          <SignUpForm
            error={state.error}
            fieldErrors={fieldErrors}
            isLoading={state.isLoading}
            changeFormType={() => navigate("/signin")}
            handleChange={handleChange}
            handleBlur={handleBlur}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
