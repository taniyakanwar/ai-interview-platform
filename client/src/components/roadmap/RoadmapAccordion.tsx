// RoadmapAccordion.tsx
// The actual tracker — Week -> Day -> Task, nested collapsible sections.
// This is the "source of truth" view; the graph above is just a visual
// summary that scrolls you down into this.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink, Check } from "lucide-react";
import { RoadmapWeek, RoadmapDay } from "@/types/roadmap.types";

interface RoadmapAccordionProps {
  weeks: RoadmapWeek[];
  onToggleTask: (taskId: string) => void;
  // Weeks register themselves here so RoadmapGenerator can scroll to a
  // specific week when its graph node is clicked — a ref map keyed by
  // weekNumber, set via a callback ref below.
  weekRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
}

function dayProgress(day: RoadmapDay) {
  if (day.tasks.length === 0) return 0;
  return day.tasks.filter((t) => t.isCompleted).length / day.tasks.length;
}

function weekProgress(week: RoadmapWeek) {
  const all = week.days.flatMap((d) => d.tasks);
  if (all.length === 0) return 0;
  return all.filter((t) => t.isCompleted).length / all.length;
}

export default function RoadmapAccordion({ weeks, onToggleTask, weekRefs }: RoadmapAccordionProps) {
  // Auto-expand the FIRST week that isn't fully complete — that's where
  // the student actually is right now, no reason to make them hunt for it.
  const safeWeeks = weeks ?? [];
  const firstIncomplete = weeks.find((w) => weekProgress(w) < 1)?.weekNumber ?? weeks[0]?.weekNumber;
  const [openWeek, setOpenWeek] = useState<number | null>(firstIncomplete);
  const [openDay, setOpenDay] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {safeWeeks.map((week) => {
        const progress = weekProgress(week);
        const isOpen = openWeek === week.weekNumber;

        return (
          <div
            key={week.id}
            ref={(el) => {weekRefs.current[week.weekNumber] = el;}}
            className="rounded-2xl border border-[#D9C8B4]/60 bg-white overflow-hidden scroll-mt-6"
          >
            {/* Week header */}
            <button
              onClick={() => setOpenWeek(isOpen ? null : week.weekNumber)}
              className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-[#FAF7F2] transition-colors"
            >
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-serif font-semibold text-sm"
                style={{
                  backgroundColor: progress === 1 ? "#2D3B2A" : "#9CB68A",
                  color: "#FAF7F2",
                }}
              >
                {week.weekNumber}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg text-[#2D3B2A] truncate">{week.theme}</h3>
                {/* Thin progress bar — quick glance without opening the week */}
                <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-[#FAF7F2] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#9CB68A] transition-all duration-500"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>

              <ChevronDown
                className={`flex-shrink-0 text-[#2D3B2A] transition-transform ${isOpen ? "rotate-180" : ""}`}
                size={20}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-1 border-t border-[#D9C8B4]/40">
                    {week.description && (
                      <p className="text-sm text-[#2D3B2A]/70 mb-4 mt-3">{week.description}</p>
                    )}

                    <div className="flex flex-col gap-2">
                      {week.days.map((day) => {
                        const dProgress = dayProgress(day);
                        const dayOpen = openDay === day.id;

                        return (
                          <div key={day.id} className="rounded-xl bg-[#FAF7F2]/60">
                            <button
                              onClick={() => setOpenDay(dayOpen ? null : day.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left"
                            >
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  backgroundColor: dProgress === 1 ? "#2D3B2A" : "transparent",
                                  border: dProgress === 1 ? "none" : "1.5px solid #9CB68A",
                                }}
                              >
                                {dProgress === 1 && <Check size={13} color="#FAF7F2" />}
                              </div>
                              <span className="text-sm font-medium text-[#2D3B2A]">
                                Day {day.dayNumber} — {day.focus}
                              </span>
                              <ChevronDown
                                size={15}
                                className={`ml-auto text-[#2D3B2A]/50 transition-transform ${dayOpen ? "rotate-180" : ""}`}
                              />
                            </button>

                            <AnimatePresence initial={false}>
                              {dayOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <ul className="px-4 pb-4 pl-13 flex flex-col gap-2">
                                    {day.tasks.map((task) => (
                                      <li key={task.id} className="flex items-start gap-3 pl-9">
                                        <button
                                          onClick={() => onToggleTask(task.id)}
                                          className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
                                          style={{
                                            backgroundColor: task.isCompleted ? "#2D3B2A" : "white",
                                            border: task.isCompleted ? "none" : "1.5px solid #9CB68A",
                                          }}
                                        >
                                          {task.isCompleted && <Check size={12} color="#FAF7F2" />}
                                        </button>
                                        <span
                                          className={`text-sm flex-1 ${
                                            task.isCompleted
                                              ? "text-[#2D3B2A]/40 line-through"
                                              : "text-[#2D3B2A]/90"
                                          }`}
                                        >
                                          {task.content}
                                        </span>
                                        {task.resourceUrl && (
                                          
                                           <a href={task.resourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#9CB68A] hover:text-[#2D3B2A] transition-colors flex-shrink-0"
                                          >
                                            <ExternalLink size={14} />
                                          </a>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}