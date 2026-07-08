import { BookOpen, Code2, FileText, Map, MessageSquare, Mic } from "lucide-react";

const orbitIcons = [
  { Icon: Code2, bg: "#2D3B2A" },
  { Icon: MessageSquare, bg: "#9CB68A" },
  { Icon: FileText, bg: "#2D3B2A" },
  { Icon: Mic, bg: "#9CB68A" },
  { Icon: Map, bg: "#2D3B2A" },
  { Icon: BookOpen, bg: "#9CB68A" },
];

const ORBIT_RADIUS = 260;
const ICON_SIZE = 112;

export default function OrbitCorner() {
  return (
    <div
      className="fixed bottom-[-230px] left-[-230px] z-0 h-[560px] w-[560px] pointer-events-none"
      style={{ opacity: 0.42 }}
      aria-hidden="true"
    >
      <div className="absolute inset-[78px] rounded-full border border-[#2D3B2A]/10" />

      {orbitIcons.map(({ Icon, bg }, index) => {
        const angle = (360 / orbitIcons.length) * index;

        return (
          <div
            key={index}
            className="orbit-item flex items-center justify-center rounded-full shadow-lg shadow-[#2D3B2A]/12"
            style={{
              width: ICON_SIZE,
              height: ICON_SIZE,
              backgroundColor: bg,
              ["--start-angle" as any]: `${angle}deg`,
              ["--counter-angle" as any]: `${-angle}deg`,
              ["--orbit-radius" as any]: `${ORBIT_RADIUS}px`,
            }}
          >
            <Icon size={42} color="#FAF7F2" strokeWidth={1.8} />
          </div>
        );
      })}
    </div>
  );
}
