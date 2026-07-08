// App.tsx
// This is the main file that defines all the routes (pages) of our app
// Think of it like a table of contents — each URL maps to a component

import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"

// Pages
import Landing from "@/pages/Landing"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import Dashboard from "@/pages/Dashboard"
import Layout from "@/components/Layout"
import ProtectedRoute from "@/components/ProtectedRoute"
import GoogleCallback from "@/pages/GoogleCallback"

import CodingPractice from "@/pages/CodingPractice"
import ProblemDetail from "@/pages/ProblemDetail"
import AIDoubtSolver from "@/pages/AIDoubtSolver"
import ResumeAnalyzer from "@/pages/ResumeAnalyzer"
import InterviewSimulator from "@/pages/InterviewSimulator"
import RoadmapGenerator from "@/pages/RoadmapGenerator"
import SearchPage from "@/pages/SearchPage"
import Profile from "@/pages/Profile"
import AdminPanel from "@/pages/AdminPanel"
import NotePage from "@/pages/NotePage"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* / → show Landing page as the entry point */}
          <Route path="/" element={<Landing />} />

          {/* /login → show Login page */}
          <Route path="/login" element={<Login />} />

          {/* /register → show Register page */}
          <Route path="/register" element={<Register />} />

          {/* google sign in then loading then dashboard */}
          <Route path="/auth/callback" element={<GoogleCallback />} />

          {/* /dashboard → show Dashboard page */}
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

          {/* ── Notes feature — single source of truth, properly protected + wrapped in Layout ── */}
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Layout>
                  <NotePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <NotePage />
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