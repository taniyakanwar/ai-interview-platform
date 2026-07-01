// Layout.tsx
// This is a wrapper component that combines the Sidebar + the page content
// Every logged-in page (Dashboard, Coding Practice, etc.) will use this Layout
// So the sidebar automatically appears on all of them without repeating code

import { ReactNode } from "react"
import { motion } from "framer-motion"
import Sidebar from "@/components/Sidebar"

// children = whatever page content we pass inside <Layout>...</Layout>
function Layout({ children }: { children: ReactNode }) {
  return (
    // Full screen, horizontal flex — sidebar on left, content on right
    <div className="flex h-screen bg-[#FAF7F2] font-sans overflow-hidden">

      {/* Left side — fixed sidebar */}
      <Sidebar />

      {/* Right side — scrollable page content */}
      {/* flex-1 makes this take up all remaining space after the sidebar */}
      <main className="flex-1 overflow-y-auto">

        {/* Animate page content on every route change — fade + slide up */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}   // start invisible, slightly below
          animate={{ opacity: 1, y: 0 }}    // animate to fully visible
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full"
        >
          {children}
        </motion.div>

      </main>
    </div>
  )
}

export default Layout