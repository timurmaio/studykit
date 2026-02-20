import { useState, useEffect } from "react";
import { API_URL } from "../../config";
import { Header } from "../../components/Header";

export function App(): JSX.Element {
  const [state, setState] = useState({
    id: "",
    email: "",
    avatar: "",
    firstName: "",
    lastName: "",
    role: "",
    user: {
      firstName: "",
      lastName: "",
    },
  });

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    if (userId) {
      try {
        fetch(`${API_URL}/api/users/${userId}`)
          .then((res) => res.json())
          .then((data) => setState({ ...state, user: data }));
      } catch {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user_id");
      }
    }
  }, []);

  return (
    <div>
      <Header user={state.user} />
    </div>
  );
}
