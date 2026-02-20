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
      .then((response) => {
        if (response.status === 201) {
          console.log("Зарегинились!");
          localStorage.setItem("jwt_token", response.data.jwtToken);
          localStorage.setItem("user_id", response.data.id);
          navigate("/courses");
        }
      })
      .catch((error) => {
        setState({ ...state, error: error.response.data.errors });
      });
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-4 offset-4">
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
