// Sidebar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import {
  LayoutDashboard,
  Code2,
  MessageCircleQuestion,
  FileText,
  Mic,
  Map,
  NotebookText,
  User,
  LogOut,
  ChevronLeft,   // icon for collapse toggle button
  ChevronRight,  // icon for expand toggle button
} from "lucide-react"

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

// Sidebar now receives its collapsed state + toggle handler as props from Layout
interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    // Width now switches between full (w-64) and narrow (w-20) based on isCollapsed
    // transition-all + duration animates the width change smoothly instead of snapping
    <div
      className={`h-screen bg-[#2D3B2A] flex flex-col flex-shrink-0 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >

      {/* ── Logo section + toggle button ── */}
      <div className="p-6 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 bg-[#9CB68A] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="font-serif text-[#2D3B2A] text-lg font-bold">N</span>
          </div>
          {/* Hide the "NooK" text label when collapsed - only show the logo mark */}
          {!isCollapsed && (
            <span className="font-serif text-xl font-semibold text-[#FAF7F2] whitespace-nowrap">
              NooK
            </span>
          )}
        </div>

        {/* Toggle button - only show here when NOT collapsed (icon swaps position when collapsed, see below) */}
        {!isCollapsed && (
          <button
            onClick={onToggle}
            className="text-[#D9C8B4]/70 hover:text-[#FAF7F2] transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {/* When collapsed, show the expand button centered below the logo instead */}
      {isCollapsed && (
        <div className="px-6 pb-2 flex justify-center">
          <button
            onClick={onToggle}
            className="text-[#D9C8B4]/70 hover:text-[#FAF7F2] transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* ── Navigation links ── */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined} // shows label as browser tooltip when collapsed
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isCollapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-[#9CB68A]/20 text-[#FAF7F2]"
                  : "text-[#D9C8B4]/80 hover:bg-white/5 hover:text-[#FAF7F2]"
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {/* Hide text label when collapsed - icon-only mode */}
              {!isCollapsed && item.label}
            </Link>
          )
        })}
      </nav>

      {/* ── User info + Logout (bottom of sidebar) ── */}
      <div className="p-4 border-t border-white/10">
        <div className={`flex items-center gap-3 px-2 py-2 mb-1 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 bg-[#9CB68A] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[#2D3B2A] text-sm font-semibold">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </span>
          </div>
          {/* Hide name/email block entirely when collapsed */}
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-[#FAF7F2] text-sm font-medium truncate">
                {user?.name || "User"}
              </p>
              <p className="text-[#D9C8B4]/60 text-xs truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#D9C8B4]/80 hover:bg-white/5 hover:text-[#FAF7F2] transition-all duration-200 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!isCollapsed && "Logout"}
        </button>
      </div>

    </div>
  )
}

export default Sidebar