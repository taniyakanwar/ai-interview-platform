// App.tsx
// This is the main file that defines all the routes (pages) of our app
// Think of it like a table of contents — each URL maps to a component

import { BrowserRouter, Routes, Route,  } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"

// Pages — we'll create these one by one
import Landing from "@/pages/Landing"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import Dashboard from "@/pages/Dashboard"
import Layout from "@/components/Layout"
import ProtectedRoute from "@/components/ProtectedRoute"
import GoogleCallback from "@/pages/GoogleCallback"


// NEW —  placeholder pages for dashboard
import CodingPractice from "@/pages/CodingPractice"
import ProblemDetail from "@/pages/ProblemDetail"
import AIDoubtSolver from "@/pages/AIDoubtSolver"
import ResumeAnalyzer from "@/pages/ResumeAnalyzer"
import InterviewSimulator from "@/pages/InterviewSimulator"
import RoadmapGenerator from "@/pages/RoadmapGenerator"
import Notes from "@/pages/Notes"
import SearchPage from "@/pages/SearchPage"
import Profile from "@/pages/Profile"
import AdminPanel from "@/pages/AdminPanel"

function App() {
  return (
    // BrowserRouter enables navigation between pages without full page reloads
    <BrowserRouter>

      {/* AuthProvider wraps everything so all pages can access auth state */}
      <AuthProvider>

        <Routes>
          {/* / → redirect to /login by default */}
          {/* / → show Landing page as the entry point */}
          <Route path="/" element={<Landing />} />
          {/* /login → show Login page */}
          <Route path="/login" element={<Login />} />

          {/* /register → show Register page */}
          <Route path="/register" element={<Register />} />
           
           {/* google sign in then loading then dashboard  */}
          <Route path="/auth/callback" element={<GoogleCallback />} />

          {/* /dashboard → show Dashboard page (we'll protect this later) */}
          {/* Dashboard is now protected — wrapped in ProtectedRoute */}
          {/* All protected pages share the same Layout (sidebar + content) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/coding-practice"
            element={
              <ProtectedRoute>
                <Layout>
                  <CodingPractice />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/problems/:slug"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProblemDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/doubt-solver"
            element={
              <ProtectedRoute>
                <Layout>
                  <AIDoubtSolver />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resume-analyzer"
            element={
              <ProtectedRoute>
                <Layout>
                  <ResumeAnalyzer />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/interview-simulator"
            element={
              <ProtectedRoute>
                <Layout>
                  <InterviewSimulator />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/roadmap"
            element={
              <ProtectedRoute>
                <Layout>
                  <RoadmapGenerator />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Layout>
                  <Notes />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Layout>
                  <SearchPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminPanel />
                </Layout>
              </ProtectedRoute>
            }
          />



        </Routes>

      </AuthProvider>
    </BrowserRouter>
  )
}

export default App