import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "motion/react";
import { EventDetails } from "../types";
import { Clock, MapPin, Calendar, Sparkles, Heart } from "lucide-react";
import confetti from "canvas-confetti";

interface TimelineProps {
  events: EventDetails[];
}

// Ceremony-specific theme accents
const ceremonyThemes = {
  haldi: {
    name: "Haldi",
    light: "bg-amber-50/90",
    border: "border-amber-200",
    text: "text-amber-900",
    subtitleText: "text-amber-700/80",
    dot: "bg-amber-400",
    ring: "ring-amber-200",
    badge: "bg-amber-100/80 border-amber-300/70 text-amber-900",
    celebrateBtn: "hover:bg-amber-100 text-amber-800 border-amber-300",
    confetti: ["#F59E0B", "#FBBF24", "#FCD34D", "#D97706", "#FEF3C7", "#F59E0B"],
  },
  mehndi: {
    name: "Mehndi",
    light: "bg-emerald-50/90",
    border: "border-emerald-200",
    text: "text-emerald-900",
    subtitleText: "text-emerald-700/80",
    dot: "bg-emerald-400",
    ring: "ring-emerald-200",
    badge: "bg-emerald-100/80 border-emerald-300/70 text-emerald-900",
    celebrateBtn: "hover:bg-emerald-100 text-emerald-800 border-emerald-300",
    confetti: ["#10B981", "#34D399", "#6EE7B7", "#059669", "#A7F3D0", "#D1FAE5"],
  },
  sangeet: {
    name: "Sangeet",
    light: "bg-indigo-50/90",
    border: "border-indigo-200",
    text: "text-indigo-900",
    subtitleText: "text-indigo-700/80",
    dot: "bg-indigo-400",
    ring: "ring-indigo-200",
    badge: "bg-indigo-100/80 border-indigo-300/70 text-indigo-900",
    celebrateBtn: "hover:bg-indigo-100 text-indigo-800 border-indigo-300",
    confetti: ["#6366F1", "#818CF8", "#A5B4FC", "#4F46E5", "#C7D2FE", "#E0E7FF"],
  },
  wedding: {
    name: "Wedding",
    light: "bg-rose-50/90",
    border: "border-rose-200",
    text: "text-rose-900",
    subtitleText: "text-rose-700/80",
    dot: "bg-rose-500",
    ring: "ring-rose-200",
    badge: "bg-rose-100/80 border-rose-300/70 text-rose-900",
    celebrateBtn: "hover:bg-rose-100 text-rose-800 border-rose-300",
    confetti: ["#F43F5E", "#FB7185", "#FDA4AF", "#E11D48", "#FECDD3", "#FFE4E6"],
  },
  none: {
    name: "Ceremony",
    light: "bg-blush-light",
    border: "border-pink-border",
    text: "text-wine-dark",
    subtitleText: "text-[#5D4147]/80",
    dot: "bg-burgundy",
    ring: "ring-pink-border",
    badge: "bg-blush-main/80 border-pink-border text-wine-dark",
    celebrateBtn: "hover:bg-pink-border/40 text-wine-dark border-pink-border",
    confetti: ["#8F1736", "#A91F3D", "#D995A5", "#E8C7CD", "#F8E8EA"],
  },
};

export function Timeline({ events }: TimelineProps) {
  const [activeSparkleIndex, setActiveSparkleIndex] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Track scroll position across timeline container for smooth automatic lotus scrolling
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 70%", "end 30%"],
  });

  // Butter-smooth physics for the scrolling lotus
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    mass: 0.5,
    restDelta: 0.001,
  });

  // Calculate lotus position along vertical track
  const lotusTop = useTransform(smoothProgress, [0, 1], ["2%", "98%"]);
  const lotusScale = useTransform(smoothProgress, [0, 0.1, 0.9, 1], [0.88, 1.05, 1.05, 0.88]);
  const lotusRotate = useTransform(smoothProgress, [0, 0.5, 1], [-6, 2, -6]);

  if (!events || events.length === 0) return null;

  // Sort events chronologically by date/time
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(`${a.date} 2026 ${a.time || "12:00 PM"}`).getTime();
    const dateB = new Date(`${b.date} 2026 ${b.time || "12:00 PM"}`).getTime();
    if (!isNaN(dateA) && !isNaN(dateB)) return dateA - dateB;
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.time || "").localeCompare(b.time || "");
  });

  const triggerCelebration = (e: React.MouseEvent<HTMLElement>, index: number, styleKey: string) => {
    e.stopPropagation();
    const theme = ceremonyThemes[styleKey as keyof typeof ceremonyThemes] || ceremonyThemes.none;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // Trigger colorful ceremony confetti
    confetti({
      particleCount: 45,
      spread: 70,
      origin: { x, y },
      colors: theme.confetti,
      ticks: 80,
      gravity: 1.1,
      scalar: 0.9,
      zIndex: 9999,
    });

    // Animate flying sparkles badge effect
    setActiveSparkleIndex(index);
    setTimeout(() => {
      setActiveSparkleIndex((current) => (current === index ? null : current));
    }, 1200);
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split("-");
        const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
        return dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  return (
    <section className="py-20 px-4 md:px-6 bg-[#fffaf5] flex flex-col items-center overflow-hidden relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/floral-flourish.png')]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg flex flex-col items-center relative z-10"
      >
        <h2 className="font-serif text-4xl md:text-5xl uppercase tracking-widest text-wine-dark font-bold text-center drop-shadow-sm mb-12">
          Event Schedule
        </h2>

        {/* Timeline Container with Target Ref */}
        <div ref={timelineRef} className="w-full relative">
          {/* Main vertical line */}
          <div className="absolute left-8 md:left-12 top-0 bottom-0 w-0.5 bg-[#e8e2d9]" />

          {/* Dynamic Highlight Line that fills behind the scrolling Lotus */}
          <motion.div
            style={{ height: lotusTop }}
            className="absolute left-8 md:left-12 top-0 w-0.5 bg-gradient-to-b from-burgundy via-pink-accent to-amber-400 z-1 rounded-full shadow-[0_0_8px_rgba(169,31,61,0.45)]"
          />

          {/* Smooth Automatic Scrolling Lotus Flower */}
          <motion.div
            style={{
              top: lotusTop,
              scale: lotusScale,
              rotate: lotusRotate,
            }}
            className="absolute left-8 md:left-12 -translate-x-1/2 -translate-y-1/2 z-25 pointer-events-none flex items-center justify-center transition-opacity duration-300"
            title="Automatic Timeline Lotus"
          >
            {/* Glowing Lotus Aura */}
            <div className="absolute w-12 h-12 rounded-full bg-pink-300/30 blur-xs animate-pulse" />

            {/* Regal Wedding Lotus SVG */}
            <svg
              viewBox="0 0 64 64"
              className="w-9 h-9 md:w-11 md:h-11 drop-shadow-[0_4px_10px_rgba(143,23,54,0.4)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="lotusOuterPetalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FB7185" />
                  <stop offset="60%" stopColor="#BE123C" />
                  <stop offset="100%" stopColor="#881337" />
                </linearGradient>
                <linearGradient id="lotusMidPetalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FDA4AF" />
                  <stop offset="70%" stopColor="#E11D48" />
                  <stop offset="100%" stopColor="#9F1239" />
                </linearGradient>
                <linearGradient id="lotusCenterPetalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF1F2" />
                  <stop offset="50%" stopColor="#F43F5E" />
                  <stop offset="100%" stopColor="#9F1239" />
                </linearGradient>
                <radialGradient id="lotusGoldenBud" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="70%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </radialGradient>
              </defs>

              {/* Green Base Sepals */}
              <path
                d="M32 52 C20 54 10 49 8 45 C18 43 26 47 32 52 Z"
                fill="#059669"
                opacity="0.85"
              />
              <path
                d="M32 52 C44 54 54 49 56 45 C46 43 38 47 32 52 Z"
                fill="#047857"
                opacity="0.85"
              />

              {/* Outer Petals */}
              <path
                d="M32 48 C18 46 6 36 4 24 C16 26 26 36 32 48 Z"
                fill="url(#lotusOuterPetalGrad)"
              />
              <path
                d="M32 48 C46 46 58 36 60 24 C48 26 38 36 32 48 Z"
                fill="url(#lotusOuterPetalGrad)"
              />

              {/* Mid Layer Petals */}
              <path
                d="M32 50 C21 47 13 36 15 16 C27 21 30 38 32 50 Z"
                fill="url(#lotusMidPetalGrad)"
              />
              <path
                d="M32 50 C43 47 51 36 49 16 C37 21 34 38 32 50 Z"
                fill="url(#lotusMidPetalGrad)"
              />

              {/* Center Petal */}
              <path
                d="M32 52 C25 38 23 20 32 8 C41 20 39 38 32 52 Z"
                fill="url(#lotusCenterPetalGrad)"
              />

              {/* Golden Bud */}
              <ellipse cx="32" cy="46" rx="6" ry="3.5" fill="url(#lotusGoldenBud)" />
              <circle cx="32" cy="44" r="1.5" fill="#FFFFFF" opacity="0.9" />

              {/* Radiant Sparks */}
              <circle cx="32" cy="18" r="1.2" fill="#FEF08A" opacity="0.9" />
              <circle cx="27" cy="27" r="1" fill="#FEF08A" opacity="0.8" />
              <circle cx="37" cy="27" r="1" fill="#FEF08A" opacity="0.8" />
            </svg>
          </motion.div>

          {/* Event Cards */}
          {sortedEvents.map((event, index) => {
            const styleKey = (event.decorativeStyle?.toLowerCase() || "none") as keyof typeof ceremonyThemes;
            const theme = ceremonyThemes[styleKey] || ceremonyThemes.none;
            const formattedDate = formatDateDisplay(event.date);

            return (
              <motion.div
                key={event.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, type: "spring", bounce: 0.3 }}
                className="mb-8 relative w-full flex flex-row items-stretch pl-16 md:pl-24 pr-2"
              >
                {/* Timeline Dot with ceremony accent */}
                <div
                  className={`absolute left-8 md:left-12 top-7 transform -translate-x-1/2 flex items-center justify-center w-5 h-5 rounded-full ${theme.dot} ring-4 ${theme.ring} shadow-sm z-10`}
                />

                {/* Event Card */}
                <div
                  onClick={(e) => triggerCelebration(e, index, styleKey)}
                  className={`cursor-pointer group bg-white p-5 rounded-2xl border ${theme.border} shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-300 relative w-full flex flex-col gap-3.5`}
                >
                  {/* Top row: Circular Image + Ceremony Title & Tagline */}
                  <div className="flex items-center gap-4">
                    {/* Circular Image */}
                    {event.circularImageUrl ? (
                      <div
                        className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full border-2 ${theme.border} overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-105`}
                      >
                        <img
                          src={event.circularImageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full border-2 ${theme.border} ${theme.light} flex items-center justify-center shadow-sm`}
                      >
                        <Heart className={`w-6 h-6 ${theme.text} opacity-60`} />
                      </div>
                    )}

                    {/* Title & Subtitle */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className={`font-serif text-lg md:text-xl font-bold uppercase tracking-widest ${theme.text} truncate`}
                        >
                          {event.title}
                        </h3>

                        {/* Interactive Celebration Sparkles Pill */}
                        <button
                          type="button"
                          onClick={(e) => triggerCelebration(e, index, styleKey)}
                          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider border ${theme.celebrateBtn} transition-all active:scale-95`}
                          title="Celebrate Ceremony"
                        >
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          <span className="hidden sm:inline">Celebrate</span>
                        </button>
                      </div>

                      {(event.hashtag || event.subtitle) && (
                        <div className="mt-0.5 flex flex-col gap-0.5">
                          {event.subtitle && (
                            <span
                              className={`font-serif text-[11px] md:text-xs uppercase tracking-wider ${theme.subtitleText}`}
                            >
                              {event.subtitle}
                            </span>
                          )}
                          {event.hashtag && (
                            <span
                              className={`font-serif text-[11px] font-bold tracking-widest ${theme.text} opacity-90`}
                            >
                              {event.hashtag}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Clean Badge Pills for Dates, Timings & Location (No Description) */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-black/5">
                    {/* Date Badge Pill */}
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border shadow-2xs ${theme.badge}`}
                    >
                      <Calendar className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span>{formattedDate}</span>
                    </div>

                    {/* Time Badge Pill */}
                    {event.time && (
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border shadow-2xs ${theme.badge}`}
                      >
                        <Clock className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        <span>{event.time}</span>
                      </div>
                    )}

                    {/* Location Badge Pill (if present) */}
                    {event.location && (
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border shadow-2xs ${theme.badge}`}
                      >
                        <MapPin className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        <span className="truncate max-w-[160px]">{event.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Flying Sparkles Interactive Effect on Click */}
                  <AnimatePresence>
                    {activeSparkleIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 0 }}
                        animate={{ opacity: 1, scale: 1.2, y: -24 }}
                        exit={{ opacity: 0, scale: 1.4, y: -40 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="pointer-events-none absolute -top-4 right-6 flex items-center gap-1 px-3 py-1 bg-white/95 rounded-full shadow-lg border border-pink-border text-wine-dark font-serif text-xs font-bold z-20"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                        <span>Blessings &amp; Joy!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
