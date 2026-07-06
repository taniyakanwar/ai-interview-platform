// client/src/pages/Landing.tsx

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OrbitCorner from "@/components/OrbitCorner";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] relative overflow-hidden">
      
      <OrbitCorner />

      {/* ---------- Top bar ---------- */}
      {/* Fades in from slightly above, no delay — first thing the user sees */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center justify-between px-8 py-6"
      >
        <div>
          <h1 className="text-2xl font-semibold text-[#2D3B2A]" style={{ fontFamily: "Fraunces, serif" }}>
            NooK
          </h1>
          <p className="text-xs italic text-[#2D3B2A]/60" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            noun — a cozy corner for quiet focus
          </p>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="text-sm font-medium text-[#2D3B2A] hover:text-[#9CB68A] transition-colors"
        >
          Login
        </button>
      </motion.header>

      {/* ---------- Hero section ---------- */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        
        {/* Headline slides up + fades in, starts right after top bar (delay: 0.2s) */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-semibold text-[#2D3B2A] max-w-2xl leading-tight"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Ace Your Next Technical Interview
        </motion.h2>

        {/* Subheading follows a bit later (delay: 0.4s) */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="mt-4 text-base md:text-lg text-[#2D3B2A]/70 max-w-md"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Practice coding problems, track your progress, and prep smarter — all in one place.
        </motion.p>

        {/* CTA button pops in last (delay: 0.6s), with a subtle scale-up for a "pop" feel */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          onClick={() => navigate("/register")}
          className="mt-8 px-8 py-3 rounded-full bg-[#2D3B2A] text-[#FAF7F2] font-medium
                     hover:bg-[#2D3B2A]/90 transition-colors"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Get Started
        </motion.button>
      </main>

      {/* ---------- Footer ---------- */}
      {/* Fades in last, no movement — just a gentle appear */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="py-6 text-center text-sm text-[#2D3B2A]/50"
      >
        © 2026 NooK. Built by Taniya.
      </motion.footer>
    </div>
  );
}