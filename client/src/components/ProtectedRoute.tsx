// ProtectedRoute.tsx
// This component "guards" certain pages so only logged-in users can see them
// If the user is NOT logged in, it redirects them to the Login page instead

import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { ReactNode } from "react"

// This component wraps around any page we want to protect
// Usage: <ProtectedRoute><Dashboard /></ProtectedRoute>
function ProtectedRoute({ children }: { children: ReactNode }) {

  // Get the current auth state from our AuthContext
  const { user, isLoading } = useAuth()

  // While we're still checking localStorage for a saved session, show nothing
  // (prevents a flash of "redirecting to login" before we know the real status)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        {/* Simple loading spinner while we check auth status */}
        <div className="w-8 h-8 border-3 border-[#E5DFD5] border-t-[#4A6B52] rounded-full animate-spin" />
      </div>
    )
  }

  // If there's no logged-in user, redirect to the login page
  // "replace" means this redirect won't be added to browser history (so back button works cleanly)
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If the user IS logged in, show the protected page (children) normally
  return <>{children}</>
}

export default ProtectedRoute