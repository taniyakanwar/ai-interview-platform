// App.tsx
// This is the main file that defines all the routes (pages) of our app
// Think of it like a table of contents — each URL maps to a component

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"

// Pages — we'll create these one by one
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import Dashboard from "@/pages/Dashboard"
import ProtectedRoute from "@/components/ProtectedRoute"
import GoogleCallback from "@/pages/GoogleCallback"

function App() {
  return (
    // BrowserRouter enables navigation between pages without full page reloads
    <BrowserRouter>

      {/* AuthProvider wraps everything so all pages can access auth state */}
      <AuthProvider>

        <Routes>
          {/* / → redirect to /login by default */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* /login → show Login page */}
          <Route path="/login" element={<Login />} />

          {/* /register → show Register page */}
          <Route path="/register" element={<Register />} />
           
           {/* google sign in then loading then dashboard  */}
          <Route path="/auth/callback" element={<GoogleCallback />} />

          {/* /dashboard → show Dashboard page (we'll protect this later) */}
          {/* Dashboard is now protected — wrapped in ProtectedRoute */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>

      </AuthProvider>
    </BrowserRouter>
  )
}

export default App