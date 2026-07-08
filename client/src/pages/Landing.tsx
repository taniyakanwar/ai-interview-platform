import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Code2,
  FileText,
  Map,
  MessageSquare,
  Mic,
  Sparkles,
} from "lucide-react";
import OrbitCorner from "@/components/OrbitCorner";

const fadeUp = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const features = [
  {
    icon: Code2,
    title: "Coding Practice",
    text: "Solve focused technical questions and build the rhythm you need for real interviews.",
  },
  {
    icon: MessageSquare,
    title: "AI Doubt Solver",
    text: "Ask why your solution fails, compare approaches, and understand the idea behind the answer.",
  },
  {
    icon: FileText,
    title: "Resume Analyzer",
    text: "Get practical feedback on your resume so your projects, skills, and impact are easier to read.",
  },
  {
    icon: Mic,
    title: "Interview Simulator",
    text: "Practice explaining your thinking out loud with prompts that feel closer to the real thing.",
  },
  {
    icon: Map,
    title: "Roadmap Generator",
    text: "Turn your current level and target role into a clear, calming preparation path.",
  },
  {
    icon: BookOpen,
    title: "Notes",
    text: "Keep patterns, mistakes, explanations, and revision notes together in one quiet workspace.",
  },
];

const steps = [
  "Choose your target role and preparation timeline.",
  "Practice problems with guidance when you get stuck.",
  "Review progress, weak areas, notes, and resume feedback.",
  "Walk into interviews with a sharper plan and calmer mind.",
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D3B2A] relative overflow-x-hidden">
      <OrbitCorner />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-6 py-5 md:px-10"
      >
        <button
          onClick={() => navigate("/")}
          className="text-left"
          aria-label="Go to NooK home"
        >
          <h1 className="text-2xl font-semibold leading-none" style={{ fontFamily: "Fraunces, serif" }}>
            NooK
          </h1>
          <p className="mt-1 text-xs italic text-[#2D3B2A]/60" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            noun - a cozy corner for quiet focus
          </p>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="rounded-full px-4 py-2 text-sm font-medium text-[#2D3B2A] transition-colors hover:text-[#769866]"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="hidden rounded-full bg-[#2D3B2A] px-5 py-2.5 text-sm font-medium text-[#FAF7F2] transition-colors hover:bg-[#2D3B2A]/90 sm:inline-flex"
          >
            Start
          </button>
        </div>
      </motion.header>

      <main className="relative z-10">
        <section className="relative flex min-h-screen items-center px-6 pt-28 md:px-10">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.35 }}
              variants={stagger}
              className="max-w-3xl text-center lg:text-left"
            >
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#9CB68A]/45 bg-white/55 px-4 py-2 text-sm text-[#2D3B2A]/75 shadow-sm backdrop-blur lg:mx-0"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Sparkles size={16} />
                Your interview prep, finally in one calm place
              </motion.div>

              <motion.h2
                variants={fadeUp}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="text-5xl font-semibold leading-[1.04] md:text-7xl"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Ace Your Next Technical Interview
              </motion.h2>

              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#2D3B2A]/70 md:text-lg lg:mx-0"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Practice coding problems, solve doubts, improve your resume, and follow a roadmap that makes preparation feel less scattered.
              </motion.p>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
              >
                <button
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2D3B2A] px-7 py-3.5 font-medium text-[#FAF7F2] shadow-lg shadow-[#2D3B2A]/15 transition hover:-translate-y-0.5 hover:bg-[#2D3B2A]/90"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Get Started
                  <ArrowRight size={18} />
                </button>
                <a
                  href="#features"
                  className="rounded-full px-7 py-3.5 font-medium text-[#2D3B2A] transition hover:bg-white/60"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Explore Features
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 26 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.35 }}
              transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
              className="relative mx-auto hidden w-full max-w-md lg:block"
              aria-hidden="true"
            >
              <div className="landing-dashboard-panel">
                <div className="flex items-center justify-between border-b border-[#2D3B2A]/10 pb-5">
                  <div>
                    <p className="text-sm text-[#2D3B2A]/55">Today&apos;s focus</p>
                    <h3 className="mt-1 text-2xl font-semibold" style={{ fontFamily: "Fraunces, serif" }}>
                      Dynamic Programming
                    </h3>
                  </div>
                  <Brain className="text-[#769866]" size={34} />
                </div>

                <div className="mt-6 space-y-4">
                  {["2 problems solved", "Resume score improved", "Mock answer recorded"].map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false, amount: 0.5 }}
                      transition={{ duration: 0.5, delay: 0.55 + index * 0.12 }}
                      className="flex items-center gap-3 rounded-md bg-[#FAF7F2] p-4"
                    >
                      <CheckCircle2 className="text-[#769866]" size={22} />
                      <span className="text-sm font-medium text-[#2D3B2A]/75">{item}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-7 rounded-md bg-[#2D3B2A] p-5 text-[#FAF7F2]">
                  <p className="text-sm text-[#FAF7F2]/65">Next prompt</p>
                  <p className="mt-2 text-lg font-semibold">Explain your approach before coding.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="relative min-h-screen px-6 py-28 md:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.25 }}
            variants={stagger}
            className="mx-auto max-w-6xl"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.65 }} className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#769866]">Features</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl" style={{ fontFamily: "Fraunces, serif" }}>
                Everything you need before the interview tab opens.
              </h2>
            </motion.div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, text }, index) => (
                <motion.article
                  key={title}
                  variants={fadeUp}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="landing-feature-card"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-[#2D3B2A] text-[#FAF7F2]">
                    <Icon size={23} />
                  </div>
                  <h3 className="text-xl font-semibold" style={{ fontFamily: "Fraunces, serif" }}>
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#2D3B2A]/66" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {text}
                  </p>
                  <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-[#2D3B2A]/10">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${50 + index * 7}%` }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.8, delay: 0.15 }}
                      className="h-full rounded-full bg-[#9CB68A]"
                    />
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="relative flex min-h-screen items-center bg-[#2D3B2A] px-6 py-28 text-[#FAF7F2] md:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={stagger}
            className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.65 }}>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#C9D8B8]">Flow</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl" style={{ fontFamily: "Fraunces, serif" }}>
                A prep routine that knows where you are.
              </h2>
              <p className="mt-6 max-w-md leading-8 text-[#FAF7F2]/70" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                NooK keeps the practical pieces connected: practice, doubt solving, notes, resume work, and interview speaking practice.
              </p>
            </motion.div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step}
                  variants={fadeUp}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="landing-step-row"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#C9D8B8] font-semibold text-[#2D3B2A]">
                    {index + 1}
                  </span>
                  <p className="text-base leading-7 text-[#FAF7F2]/82 md:text-lg">{step}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="relative flex min-h-screen items-center px-6 py-28 md:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.35 }}
            variants={stagger}
            className="mx-auto w-full max-w-5xl text-center"
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.65 }}
              className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#9CB68A] text-[#2D3B2A] shadow-xl shadow-[#2D3B2A]/10"
            >
              <Sparkles size={34} />
            </motion.div>

            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.7 }}
              className="mx-auto max-w-3xl text-4xl font-semibold leading-tight md:text-6xl"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Build your quiet corner for serious preparation.
            </motion.h2>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.7 }}
              className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#2D3B2A]/70 md:text-lg"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Start with one problem, one note, one clearer explanation. NooK keeps the momentum warm and organized.
            </motion.p>

            <motion.button
              variants={fadeUp}
              transition={{ duration: 0.7 }}
              onClick={() => navigate("/register")}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#2D3B2A] px-8 py-4 font-medium text-[#FAF7F2] shadow-lg shadow-[#2D3B2A]/15 transition hover:-translate-y-0.5 hover:bg-[#2D3B2A]/90"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Create Your NooK
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </section>
      </main>

      <footer className="relative z-10 px-6 py-7 text-center text-sm text-[#2D3B2A]/50">
        (c) 2026 NooK. Built by Taniya.
      </footer>
    </div>
  );
}
