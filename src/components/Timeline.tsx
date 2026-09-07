import { motion } from "motion/react";
import { EventDetails } from "../types";
import { Clock, MapPin, CalendarHeart } from "lucide-react";

interface TimelineProps {
  events: EventDetails[];
}

// Map styles to requested accent colors
const accentColors = {
  haldi: { 
    light: "bg-amber-50", 
    border: "border-amber-200", 
    text: "text-amber-800",
    dot: "bg-amber-400"
  },
  mehndi: { 
    light: "bg-emerald-50", 
    border: "border-emerald-200", 
    text: "text-emerald-800",
    dot: "bg-emerald-400"
  },
  sangeet: { 
    light: "bg-indigo-50", 
    border: "border-indigo-200", 
    text: "text-indigo-800",
    dot: "bg-indigo-400"
  },
  wedding: { 
    light: "bg-rose-50", 
    border: "border-rose-200", 
    text: "text-rose-800",
    dot: "bg-rose-500"
  },
  none: { 
    light: "bg-[#faf9f7]", 
    border: "border-[#e8e2d9]", 
    text: "text-[#5a4838]",
    dot: "bg-[#c6b6a6]"
  }
};

export function Timeline({ events }: TimelineProps) {
  if (!events || events.length === 0) return null;

  // Sort events automatically by date/time
  const sortedEvents = [...events].sort((a, b) => {
    // Attempt to parse dates, if they fail, fallback to 0 to maintain original order
    const dateA = new Date(`${a.date} 2026 ${a.time || '12:00 PM'}`).getTime();
    const dateB = new Date(`${b.date} 2026 ${b.time || '12:00 PM'}`).getTime();
    if (!isNaN(dateA) && !isNaN(dateB)) return dateA - dateB;
    // simple string compare fallback if it's YYYY-MM-DD
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.time || "").localeCompare(b.time || "");
  });

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

        <div className="w-full relative">
          {/* Main vertical line - slightly off-center to allow card on the right on mobile */}
          <div className="absolute left-8 md:left-12 top-0 bottom-0 w-0.5 bg-[#e8e2d9]" />

          {sortedEvents.map((event, index) => {
            const styleKey = event.decorativeStyle || "none";
            const colors = accentColors[styleKey as keyof typeof accentColors] || accentColors.none;
            
            return (
              <motion.div 
                key={event.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, type: "spring", bounce: 0.3 }}
                className="mb-10 relative w-full flex flex-row items-stretch pl-16 md:pl-24 pr-2"
              >
                {/* Timeline Dot/Flower */}
                <div className={`absolute left-8 md:left-12 top-6 transform -translate-x-1/2 flex items-center justify-center w-5 h-5 rounded-full ${colors.dot} ring-4 ring-[#fffaf5] shadow-sm z-10`} />
                
                {/* Content Card */}
                <div className="bg-white p-5 rounded-2xl border border-[#e8e2d9] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow relative w-full flex flex-col gap-4">
                  
                  {/* Top row: Circle Image & Title/Tagline */}
                  <div className="flex items-center gap-4">
                    {/* Circular Image */}
                    {event.circularImageUrl ? (
                      <div className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full border-2 ${colors.border} overflow-hidden shadow-sm`}>
                        <img 
                          src={event.circularImageUrl} 
                          alt={event.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full border-2 ${colors.border} ${colors.light} flex items-center justify-center shadow-sm`}>
                         <CalendarHeart className={`w-6 h-6 ${colors.text} opacity-50`} />
                      </div>
                    )}
                    
                    {/* Title & Subtitle */}
                    <div className="flex flex-col">
                      <h3 className={`font-serif text-lg md:text-xl font-bold uppercase tracking-widest ${colors.text}`}>
                        {event.title}
                      </h3>
                      {(event.hashtag || event.subtitle) && (
                        <div className="mt-1 flex flex-col gap-0.5">
                          {event.subtitle && (
                            <span className="font-serif text-[10px] md:text-xs uppercase tracking-widest text-[#8a7664] opacity-80">
                              {event.subtitle}
                            </span>
                          )}
                          {event.hashtag && (
                            <span className={`font-serif text-[10px] font-bold tracking-widest ${colors.text} opacity-90`}>
                              {event.hashtag}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details (Date, Description) */}
                  <div className="flex flex-col gap-2.5 bg-[#faf9f7] rounded-xl p-3.5 border border-[#f3eee8]">
                    <div className="flex flex-col gap-2">
                      <p className={`font-serif text-lg md:text-xl uppercase tracking-widest flex items-center gap-2 font-bold ${colors.text}`}>
                        <Clock className={`w-5 h-5 ${colors.text}`} /> 
                        {event.date}
                      </p>
                    </div>

                    {event.description && (
                      <div className="w-full h-px bg-[#e8e2d9] my-0.5" />
                    )}

                    {event.description && (
                      <p className="text-[11px] md:text-xs text-[#705e4f] leading-relaxed font-serif italic whitespace-pre-line">
                        {event.description}
                      </p>
                    )}
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
