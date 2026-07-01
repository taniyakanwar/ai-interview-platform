// Dashboard.tsx
// Main dashboard page — shows user greeting, stat cards, weak topics, and AI suggestions
// All data is placeholder for now — real data comes once backend features are built

import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"
import {
  Code2,        // icon for questions solved
  Flame,        // icon for streak
  Trophy,       // icon for interview score
  BrainCircuit, // icon for weak topics
  Sparkles,     // icon for AI suggestions
  ArrowRight,   // icon for action buttons
} from "lucide-react"

// ── Stat card data — placeholder numbers for now ──────────────────────────────
const stats = [
  {
    label: "Questions Solved",
    value: "0",
    sub: "Start solving today!",
    icon: Code2,
    color: "bg-[#EAF2E8]",       // light sage green background
    iconColor: "text-[#4A6B52]", // forest green icon
  },
  {
    label: "Current Streak",
    value: "0 days",
    sub: "Log in daily to build streak",
    icon: Flame,
    color: "bg-[#FFF4EC]",       // warm peach background
    iconColor: "text-[#C97B5C]", // terracotta icon
  },
  {
    label: "Interview Score",
    value: "N/A",
    sub: "Complete an interview first",
    icon: Trophy,
    color: "bg-[#F5F0FF]",       // soft lavender background
    iconColor: "text-[#7C5CBF]", // purple icon
  },
]

// ── Weak topics — placeholder for now ────────────────────────────────────────
const weakTopics = [
  "Dynamic Programming",
  "Graph Algorithms",
  "System Design",
]

// ── AI suggestions — placeholder for now ─────────────────────────────────────
const aiSuggestions = [
  "Solve 2 medium DP problems today to strengthen your weak area",
  "Review BFS and DFS — commonly asked in interviews",
  "Try a mock interview to get your first interview score",
]

// ── Stagger animation helper ──────────────────────────────────────────────────
// This makes child elements animate in one by one instead of all at once
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // each child animates 0.1s after the previous one
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },  // start invisible and 20px below
  visible: { opacity: 1, y: 0 },  // animate to visible and original position
}

function Dashboard() {
  // Get the logged-in user from AuthContext
  const { user } = useAuth()

  // Get just the first name from the full name (e.g. "Taniya Kanwar" → "Taniya")
  const firstName = user?.name?.split(" ")[0] || "there"

  // Get current time to show appropriate greeting
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
    "Good evening"

  return (
    // Padded content area
    <div className="p-8 max-w-5xl mx-auto">

      {/* ── Greeting section ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="font-serif text-3xl font-semibold text-[#2E2A26]">
          {greeting}, {firstName} 
        </h1>
        <p className="text-[#8B8378] mt-1 text-sm">
          Here's your progress overview. Keep going — every step counts 🌿
        </p>
      </motion.div>

      {/* ── Stat cards ── */}
      {/* staggerChildren makes each card animate in one by one */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className={`${stat.color} rounded-2xl p-5 border border-black/5`}
            >
              {/* Icon */}
              <div className={`${stat.iconColor} mb-3`}>
                <Icon size={22} />
              </div>
              {/* Value — big number */}
              <p className="text-2xl font-bold text-[#2E2A26] font-serif">
                {stat.value}
              </p>
              {/* Label */}
              <p className="text-sm font-medium text-[#2E2A26] mt-0.5">
                {stat.label}
              </p>
              {/* Subtitle */}
              <p className="text-xs text-[#8B8378] mt-1">
                {stat.sub}
              </p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ── Bottom two columns — Weak Topics + AI Suggestions ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >

        {/* Weak Topics card */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-[#E5DFD5] rounded-2xl p-5"
        >
          {/* Card header */}
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit size={18} className="text-[#4A6B52]" />
            <h2 className="font-semibold text-[#2E2A26] text-sm">Weak Topics</h2>
          </div>

          {/* Topic pills */}
          <div className="flex flex-wrap gap-2">
            {weakTopics.map((topic) => (
              <span
                key={topic}
                className="bg-[#FFF4EC] text-[#C97B5C] border border-[#C97B5C]/20 text-xs font-medium px-3 py-1.5 rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>

          {/* Practice button */}
          <button className="mt-4 flex items-center gap-1.5 text-xs text-[#4A6B52] font-medium hover:gap-2.5 transition-all duration-200">
            Practice these topics
            <ArrowRight size={14} />
          </button>
        </motion.div>

        {/* AI Suggestions card */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-[#E5DFD5] rounded-2xl p-5"
        >
          {/* Card header */}
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-[#7C5CBF]" />
            <h2 className="font-semibold text-[#2E2A26] text-sm">AI Suggestions</h2>
          </div>

          {/* Suggestion list */}
          <ul className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2.5">
                {/* Small numbered dot */}
                <span className="w-5 h-5 bg-[#EAF2E8] text-[#4A6B52] rounded-full text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-xs text-[#6B6358] leading-relaxed">
                  {suggestion}
                </p>
              </li>
            ))}
          </ul>
        </motion.div>

      </motion.div>
    </div>
  )
}

export default Dashboard