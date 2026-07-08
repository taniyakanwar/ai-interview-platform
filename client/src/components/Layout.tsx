// Layout.tsx
import { ReactNode, useState } from "react"
import { motion } from "framer-motion"
import Sidebar from "@/components/Sidebar"

function Layout({ children }: { children: ReactNode }) {
  // Collapsed state lives here, not in Sidebar — because both Sidebar's width
  // AND the main content's width need to react to this same value
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-[#FAF7F2] font-sans overflow-hidden">

      {/* Pass collapsed state + toggle function down to Sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((prev) => !prev)} />

      <main className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
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