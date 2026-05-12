import axios from "axios";

const api = axios.create({
  baseURL: "https://webharvest-pro.onrender.com/api",
});

export default api;