import _axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const createAxios = () => {
  const token = localStorage.getItem("jwt_token");

  return _axios.create({
    headers: token ? { Authorization: token } : {},
  });
};

export { API_URL, createAxios };
