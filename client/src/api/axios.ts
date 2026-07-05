import axios from "axios";

// Why a shared instance instead of calling axios.get() everywhere:
// 1. One place to set the base URL — if your backend URL changes
//    (e.g. Railway deployment vs localhost:5000), you edit ONE line, not every file.
// 2. One place to attach the JWT token — without this, every single
//    service file would need to manually read the token and set headers.
const api = axios.create({
  baseURL: "http://localhost:5000/api", // will become an env var later, hardcoded for now to keep this step focused
});

// Request interceptor = a checkpoint that runs BEFORE every request leaves the app.
// This is where we attach the JWT, so protected routes on your backend
// (the ones using your `protect` middleware) don't reject the request with 401.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // adjust key name if your AuthContext stores it differently
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;