import { SyntheticEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SignUpForm } from "../../components/SignUpForm";
import { API_URL } from "../../config";

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

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();

    const url = `${API_URL}/api/users`;

    const signUpData = {
      user: {
        first_name: state.firstName,
        last_name: state.lastName,
        email: state.email,
        password: state.password,
      },
    };

    axios
      .post(url, signUpData)
      .then((response: any) => {
        if (response.status === 201) {
          console.log("Зарегинились!");
          localStorage.setItem("jwt_token", response.data.jwtToken);
          localStorage.setItem("user_id", response.data.id);
          navigate("/courses");
        }
      })
      .catch((error: any) => {
        setState({ ...state, error: error.response.data.errors });
      });
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
