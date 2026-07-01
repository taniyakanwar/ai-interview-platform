// Sidebar.tsx
// Left-side navigation bar — visible on all logged-in pages
// Contains NooK logo, navigation links to every feature, and user info + logout at the bottom

import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import {
  LayoutDashboard,  // icon for Dashboard
  Code2,            // icon for Coding Practice
  MessageCircleQuestion, // icon for AI Doubt Solver
  FileText,         // icon for Resume Analyzer
  Mic,              // icon for Interview Simulator
  Map,              // icon for Roadmap Generator
  NotebookText,     // icon for Notes
  User,             // icon for Profile
  LogOut,           // icon for Logout button
} from "lucide-react"

// Define all our navigation links in one array — easy to add more later
const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Coding Practice", path: "/coding-practice", icon: Code2 },
  { label: "AI Doubt Solver", path: "/doubt-solver", icon: MessageCircleQuestion },
  { label: "Resume Analyzer", path: "/resume-analyzer", icon: FileText },
  { label: "Interview Simulator", path: "/interview-simulator", icon: Mic },
  { label: "Roadmap Generator", path: "/roadmap", icon: Map },
  { label: "Notes", path: "/notes", icon: NotebookText },
  { label: "Profile", path: "/profile", icon: User },
]

function Sidebar() {
  // useLocation tells us the current URL — we use this to highlight the active link
  const location = useLocation()

  // useNavigate lets us redirect after logout
  const navigate = useNavigate()

  // Get current user and logout function from our AuthContext
  const { user, logout } = useAuth()

  // Handle logout — clear auth state, then redirect to login page
  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    // Fixed-width sidebar, full height, warm dark green background (matches our brand)
    <div className="w-64 h-screen bg-[#2D3B2A] flex flex-col flex-shrink-0">

      {/* ── Logo section ── */}
      <div className="p-6 flex items-center gap-2.5">
        <div className="w-9 h-9 bg-[#9CB68A] rounded-lg flex items-center justify-center">
          <span className="font-serif text-[#2D3B2A] text-lg font-bold">N</span>
        </div>
        <span className="font-serif text-xl font-semibold text-[#FAF7F2]">NooK</span>
      </div>

      {/* ── Navigation links ── */}
      {/* flex-1 makes this section grow and push the user info to the bottom */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          // Check if this link matches the current page URL
          const isActive = location.pathname === item.path

          // Get the icon component for this item
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#9CB68A]/20 text-[#FAF7F2]" // active link styling — subtle green highlight
                  : "text-[#D9C8B4]/80 hover:bg-white/5 hover:text-[#FAF7F2]" // inactive link styling
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* ── User info + Logout (bottom of sidebar) ── */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          {/* User avatar — shows first letter of name if no avatar image */}
          <div className="w-8 h-8 bg-[#9CB68A] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[#2D3B2A] text-sm font-semibold">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </span>
          </div>
          {/* User name and email — truncate if too long */}
          <div className="overflow-hidden">
            <p className="text-[#FAF7F2] text-sm font-medium truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[#D9C8B4]/60 text-xs truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#D9C8B4]/80 hover:bg-white/5 hover:text-[#FAF7F2] transition-all duration-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

    </div>
  )
}

export default Sidebar