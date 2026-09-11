import axios from "axios";

// Why a shared instance instead of calling axios.get() everywhere:
// 1. One place to set the base URL — if your backend URL changes
//    (e.g. Render deployment vs localhost:5000), you edit ONE line, not every file.
// 2. One place to attach the JWT token — without this, every single
//    service file would need to manually read the token and set headers.
const api = axios.create({
  // import.meta.env.VITE_API_URL is Vite's way of reading environment variables
  // in frontend code. Vite ONLY exposes vars prefixed with VITE_ to the browser
  // bundle — that's a safety guard so you never accidentally ship a server
  // secret (like JWT_SECRET) into your public frontend build.
  // On Render, we'll set VITE_API_URL to your live backend URL.
  // Locally, if that env var isn't set, it falls back to localhost — so your
  // dev workflow doesn't change at all.
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
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