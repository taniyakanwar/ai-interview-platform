// ComingSoon.tsx
// A reusable placeholder component shown for pages that haven't been built yet.
// Instead of writing a new "under construction" page for every sidebar link,
// we build this ONE component and reuse it everywhere — just passing different props.

import { motion } from "framer-motion"; 
// framer-motion gives us the gentle fade/slide-in animation, same as we used in Layout.tsx

import type { LucideIcon } from "lucide-react"; 
// LucideIcon is the TypeScript type for any icon imported from lucide-react.
// This lets us pass ANY icon (Code, MessageSquare, FileText, etc.) into this component as a prop.

// Define what props this component expects to receive from its parent page.
interface ComingSoonProps {
  icon: LucideIcon;       // the icon component itself (not JSX yet, we render it below)
  title: string;          // e.g. "Coding Practice"
  description: string;    // short 1-line description of what this feature will do
}

// The component itself — takes the props above and destructures them directly in the function signature.
export default function ComingSoon({ icon: Icon, title, description }: ComingSoonProps) {
  return (
    // motion.div instead of a plain div — this enables the fade/slide-in animation on mount.
    <motion.div
      initial={{ opacity: 0, y: 12 }}   // starting state: invisible, slightly lower
      animate={{ opacity: 1, y: 0 }}    // animate to: fully visible, in place
      transition={{ duration: 0.35, ease: "easeOut" }} // smooth 0.35s animation
      className="flex flex-col items-center justify-center text-center h-[70vh] px-6"
      // flex + items-center + justify-center: centers everything vertically & horizontally
      // h-[70vh]: takes up most of the visible screen height so it feels intentional, not empty
    >
      {/* Icon container — a soft circular badge behind the icon, using our sage green accent */}
      <div className="w-20 h-20 rounded-full bg-[#9CB68A]/20 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-[#2D3B2A]" strokeWidth={1.5} />
        {/* w-10 h-10: icon size. text-[#2D3B2A]: our forest green brand color.
            strokeWidth={1.5}: makes the icon lines thinner/elegant instead of bold/clunky */}
      </div>

      {/* Page title, e.g. "Coding Practice" */}
      <h2 className="font-serif text-2xl text-[#2D3B2A] mb-2">
        {title}
      </h2>
      {/* font-serif: uses Fraunces (our heading font) registered in Tailwind theme */}

      {/* Short description of the upcoming feature */}
      <p className="text-[#4A4A4A] max-w-md mb-4">
        {description}
      </p>

      {/* Small "coming soon" badge for a playful, intentional touch */}
      <span className="text-xs font-medium tracking-wide uppercase text-[#9CB68A] bg-[#9CB68A]/10 px-3 py-1 rounded-full">
        Coming Soon
      </span>
    </motion.div>
  );
}