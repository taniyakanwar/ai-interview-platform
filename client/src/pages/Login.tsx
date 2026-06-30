// Login.tsx
// NooK — cozy split-screen login page
// Left panel: branded forest green panel with logo + tagline
// Right panel: clean warm form for signing in

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import { useAuth } from "@/context/AuthContext"

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      )
      const { token, user } = response.data
      login(token, user)
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // Full screen split into two halves on large screens, stacked on mobile
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF7F2] font-sans">

      {/* ───────────── LEFT PANEL — Branding ───────────── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="lg:w-[45%] bg-[#2D3B2A] relative flex flex-col justify-between p-10 lg:p-14 overflow-hidden min-h-[280px] lg:min-h-screen"
      >
        {/* Decorative soft glow blobs for warmth */}
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-[#9CB68A]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-[#D9C8B4]/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Top — Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative z-10 flex items-center gap-2.5"
        >
          {/* Logo mark */}
          <div className="w-9 h-9 bg-[#9CB68A] rounded-lg flex items-center justify-center">
            <span className="font-serif text-[#2D3B2A] text-lg font-bold">N</span>
          </div>
          <span className="font-serif text-xl font-semibold text-[#FAF7F2]">NooK</span>
        </motion.div>

        {/* Middle — Animated Corporate Memphis style illustration */}
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ delay: 0.3, duration: 0.6 }}
  className="relative z-10 flex justify-center items-center flex-1"
>
  {/* The whole illustration sways gently like a breeze */}
  <motion.svg
    width="250"
    height="250"
    viewBox="0 0 200 200"
    animate={{ rotate: [-2, 2, -2] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    style={{ transformOrigin: "100px 180px" }} // rotates from the base, like wind sway
  >
    {/* Plant pot — rounded trapezoid shape, Memphis style */}
    <path d="M70 160 L130 160 L122 195 L78 195 Z" fill="#D9C8B4" />
    {/* Pot rim highlight */}
    <rect x="68" y="155" width="64" height="12" rx="6" fill="#C9B79F" />

    {/* Plant stem */}
    <path d="M100 155 Q100 110 100 90" stroke="#6B8F71" strokeWidth="4" fill="none" strokeLinecap="round" />

    {/* Big rounded leaf — left */}
    <ellipse cx="75" cy="100" rx="28" ry="18" fill="#9CB68A" transform="rotate(-30 75 100)" />

    {/* Big rounded leaf — right */}
    <ellipse cx="125" cy="95" rx="28" ry="18" fill="#7FA374" transform="rotate(30 125 95)" />

    {/* Top leaf */}
    <ellipse cx="100" cy="65" rx="22" ry="30" fill="#9CB68A" />

    {/* Small accent leaf */}
    <ellipse cx="100" cy="60" rx="14" ry="20" fill="#B8CCA8" />

    {/* Friendly little dot details on pot — Memphis style accents */}
    <circle cx="85" cy="175" r="3" fill="#FAF7F2" opacity="0.6" />
    <circle cx="100" cy="180" r="3" fill="#FAF7F2" opacity="0.6" />
    <circle cx="115" cy="175" r="3" fill="#FAF7F2" opacity="0.6" />
  </motion.svg>
</motion.div>



        {/* Bottom — Tagline + message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative z-10"
        >
          <h2 className="font-serif text-3xl lg:text-4xl font-medium text-[#FAF7F2] leading-tight mb-3">
            A comfortable place<br />to learn and improve
          </h2>
          <p className="text-[#D9C8B4] text-sm leading-relaxed max-w-sm">
            Practice interviews at your own pace, in a space that feels calm — not stressful.
          </p>
        </motion.div>
      </motion.div>

      {/* ───────────── RIGHT PANEL — Form ───────────── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex-1 flex items-center justify-center p-8 lg:p-14"
      >
        <div className="w-full max-w-sm">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="font-serif text-3xl font-semibold text-[#2E2A26] mb-2">
              Welcome back.
            </h1>
            <p className="text-[#8B8378] text-sm">
              New to NooK?{" "}
              <Link to="/register" className="text-[#4A6B52] font-medium underline underline-offset-2 hover:text-[#3A5641] transition-colors">
                Sign up
              </Link>
            </p>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#C97B5C]/10 border border-[#C97B5C]/30 rounded-xl p-3 mb-5"
            >
              <p className="text-[#C97B5C] text-sm text-center">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#6B6358] block">
                Your email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-[#E5DFD5] rounded-xl px-4 py-3 text-[#2E2A26] text-sm focus:outline-none focus:border-[#4A6B52] focus:ring-2 focus:ring-[#4A6B52]/15 transition-all duration-200"
              />
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#6B6358] block">
                Your password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border border-[#E5DFD5] rounded-xl px-4 py-3 text-[#2E2A26] text-sm focus:outline-none focus:border-[#4A6B52] focus:ring-2 focus:ring-[#4A6B52]/15 transition-all duration-200"
              />
            </div>

            {/* Sign in button — pill shaped, lime/sage green */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#9CB68A] hover:bg-[#8CA87A] text-[#2D3B2A] font-semibold py-3.5 rounded-full transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Log in"}
            </motion.button>

          </motion.form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#E5DFD5]" />
            <span className="text-[#A8A096] text-xs">or log in with</span>
            <div className="flex-1 h-px bg-[#E5DFD5]" />
          </div>

          {/* Social login — circular icon buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center"
          >
            
            <a href="http://localhost:5000/api/auth/google"
              className="w-12 h-12 bg-white border border-[#E5DFD5] rounded-full flex items-center justify-center hover:border-[#4A6B52]/40 hover:shadow-sm transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </a>
          </motion.div>

        </div>
      </motion.div>
    </div>
  )
}

export default Login