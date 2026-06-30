// GoogleCallback.tsx
// This page is shown briefly right after a user logs in with Google
// Our backend redirects here with the token and user info in the URL
// This page's only job: read that data, save it, then go to the dashboard

import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"

function GoogleCallback() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // useSearchParams reads the ?key=value pairs from the current URL
  const [searchParams] = useSearchParams()

  // This runs once when the page loads
  useEffect(() => {
    // Read the token and user data that our backend attached to the URL
    // Example URL: http://localhost:5173/auth/google/callback?token=abc123&user=%7B...%7D
    const token = searchParams.get("token")
    const userParam = searchParams.get("user")

    if (token && userParam) {
      try {
        // The user object was sent as a URL-encoded JSON string, so we parse it back
        const user = JSON.parse(decodeURIComponent(userParam))

        // Save token + user globally (same as a normal login)
        login(token, user)

        // Redirect to dashboard
        navigate("/dashboard")
      } catch (err) {
        // If something went wrong parsing the data, send back to login with an error
        console.error("Failed to parse Google callback data:", err)
        navigate("/login")
      }
    } else {
      // If no token was found, something went wrong — go back to login
      navigate("/login")
    }
  }, []) // empty array = run only once when this page loads

  // ── Render — simple loading screen while we process the login ──────────────
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center font-sans">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        {/* Simple spinning loader */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-[#E5DFD5] border-t-[#4A6B52] rounded-full mx-auto mb-4"
        />
        <p className="text-[#6B6358] font-serif text-lg">
          Signing you in...
        </p>
      </motion.div>
    </div>
  )
}

export default GoogleCallback