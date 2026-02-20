import { useNavigate } from "react-router-dom";

export function Profile() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_id");
    navigate("/signin");
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-3">
          <div className="panel h-600">
            <img src="" alt="" />
            <button>Изменить фото</button>
            <button onClick={handleSignOut}>Выйти</button>
          </div>
        </div>
        <div className="col-9">
          <div className="panel h-600">
            <header>Личные данные</header>
            <button>Изменить</button>
          </div>
        </div>
      </div>
    </div>
  );
}
