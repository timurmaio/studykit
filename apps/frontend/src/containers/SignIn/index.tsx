import { SyntheticEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SignInForm } from "../../components/SignInForm";
import { API_URL } from "../../config";

export function SignIn() {
  const navigate = useNavigate();
  const [state, setState] = useState({
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

    const url = `${API_URL}/api/users/login`;

    const signInData = {
      user: {
        email: state.email,
        password: state.password,
      },
    };

    axios
      .post(url, signInData)
      .then((response: any) => {
        if (response.status === 200) {
          console.log("Залогинились!");
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
    <div className="container auth-page">
      <div className="auth-decor auth-decor--mint" aria-hidden="true" />
      <div className="auth-decor auth-decor--peach" aria-hidden="true" />
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <SignInForm
            error={state.error}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
