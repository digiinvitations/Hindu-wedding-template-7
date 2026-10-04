import React, { useState } from "react";
import { motion } from "motion/react";
import { HeartDivider } from "./HeartDivider";
import { Mail, Users, CheckCircle2, XCircle } from "lucide-react";
import { submitRSVP, getRSVPs, getDefaultTemplateId } from "../services/db";

interface RSVPProps {
  templateId?: string;
}

export function RSVP({ templateId }: RSVPProps) {
  const effectiveTemplateId = (templateId && templateId.trim()) ? templateId.trim() : getDefaultTemplateId();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [loadingRsvps, setLoadingRsvps] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleViewerAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "2580") {
      setIsAuthenticated(true);
      setErrorMsg("");
      setLoadingRsvps(true);
      const data = await getRSVPs(effectiveTemplateId);
      setRsvps(data);
      setLoadingRsvps(false);
    } else {
      setErrorMsg("Incorrect password");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    
    const formData = new FormData(e.currentTarget);
    const rsvpData = {
      name: formData.get("name"),
      attending: formData.get("attending"),
      guests: Number(formData.get("guests") || 1),
      message: formData.get("message")
    };

    try {
      await submitRSVP(rsvpData, effectiveTemplateId);
      setStatus("success");
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      setStatus("idle");
      alert("Failed to submit. Please try again.");
    }
  };

  return (
    <section className="py-16 px-6 bg-blush-light flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md flex flex-col items-center"
      >
        <Mail className="w-6 h-6 text-wine-dark mb-4 opacity-80" strokeWidth={1.5} />
        <h2 className="font-serif text-4xl md:text-5xl uppercase tracking-widest text-wine-dark font-bold text-center drop-shadow-sm">
          RSVP
        </h2>
        
        <HeartDivider />

        {status === "success" ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full p-8 text-center bg-blush-main rounded-xl border border-pink-border shadow-sm mt-6"
          >
            <h3 className="font-script text-3xl text-wine-dark mb-2">Thank You</h3>
            <p className="text-text-body text-sm opacity-80 font-serif">We have received your response with love and joy!</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full mt-6 flex flex-col gap-4 text-left">
            {/* Name Field */}
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-xs font-semibold text-text-body pl-1">
                Your Name *
              </label>
              <input 
                type="text" 
                id="name" 
                name="name"
                required 
                placeholder="Your full name"
                className="w-full bg-white/70 border border-pink-border rounded-md px-4 py-3 text-sm text-text-body focus:outline-none focus:border-wine-dark focus:ring-1 focus:ring-wine-dark transition-colors"
                disabled={status === "submitting"}
              />
            </div>

            {/* Attendance Field */}
            <div className="flex flex-col gap-1">
              <label htmlFor="attending" className="text-xs font-semibold text-text-body pl-1">
                Will you be attending? *
              </label>
              <div className="relative">
                <select 
                  id="attending" 
                  name="attending"
                  required 
                  defaultValue=""
                  className="w-full bg-white/70 border border-pink-border rounded-md px-4 py-3 text-sm text-text-body appearance-none focus:outline-none focus:border-wine-dark focus:ring-1 focus:ring-wine-dark transition-colors cursor-pointer"
                  disabled={status === "submitting"}
                >
                  <option value="" disabled hidden>Select your response...</option>
                  <option value="yes">Yes, gladly attending</option>
                  <option value="no">Regretfully decline</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-wine-dark">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Number of Guests Field */}
            <div className="flex flex-col gap-1">
              <label htmlFor="guests" className="text-xs font-semibold text-text-body pl-1">
                Number of Guests *
              </label>
              <div className="relative">
                <select 
                  id="guests" 
                  name="guests"
                  required 
                  defaultValue="1"
                  className="w-full bg-white/70 border border-pink-border rounded-md px-4 py-3 text-sm text-text-body appearance-none focus:outline-none focus:border-wine-dark focus:ring-1 focus:ring-wine-dark transition-colors cursor-pointer"
                  disabled={status === "submitting"}
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5+ Guests</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-wine-dark">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Wishes / Message Field */}
            <div className="flex flex-col gap-1">
              <label htmlFor="message" className="text-xs font-semibold text-text-body pl-1">
                Your Wishes
              </label>
              <textarea 
                id="message" 
                name="message"
                rows={3}
                placeholder="Write your blessings and wishes..."
                className="w-full bg-white/70 border border-pink-border rounded-md px-4 py-3 text-sm text-text-body focus:outline-none focus:border-wine-dark focus:ring-1 focus:ring-wine-dark transition-colors resize-none"
                disabled={status === "submitting"}
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={status === "submitting"}
              className="mt-2 w-full bg-burgundy text-white py-3.5 rounded-md font-serif text-sm tracking-widest uppercase shadow-md hover:bg-wine-dark transition-colors active:scale-95 disabled:opacity-70 flex justify-center items-center font-semibold"
            >
              {status === "submitting" ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Send RSVP"
              )}
            </button>
          </form>
        )}
      </motion.div>

      {/* Guest Response Viewer Section */}
      <div className="w-full max-w-md mt-12 flex flex-col items-center border-t border-pink-border/60 pt-8">
        <button 
          onClick={() => setIsViewerOpen(!isViewerOpen)}
          className="text-xs uppercase tracking-widest text-wine-dark/70 hover:text-wine-dark flex items-center gap-2 transition-colors font-semibold"
        >
          {isViewerOpen ? "Close Guest Responses" : "View Guest Responses"}
        </button>

        {isViewerOpen && (
          <div className="w-full mt-6 bg-white p-6 rounded-xl border border-pink-border shadow-sm">
            {!isAuthenticated ? (
              <form onSubmit={handleViewerAccess} className="flex flex-col gap-3">
                <p className="text-sm text-wine-dark mb-2 text-center font-medium">Enter password to view responses</p>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent border border-pink-border rounded-md px-4 py-2 text-sm text-center focus:outline-none focus:border-wine-dark focus:ring-1 focus:ring-wine-dark"
                />
                {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}
                <button type="submit" className="w-full bg-burgundy text-white py-2 rounded-md font-serif text-sm hover:bg-wine-dark transition-colors">
                  Access Viewer
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-1">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-pink-border/40">
                  <div>
                    <h3 className="font-serif font-bold text-wine-dark">Guest Responses</h3>
                    <p className="text-[10px] text-wine-dark/60 font-sans">Section: {effectiveTemplateId}</p>
                  </div>
                  <span className="text-xs font-semibold bg-blush-main text-wine-dark px-2.5 py-1 rounded-full border border-pink-border">
                    Total: {rsvps.length}
                  </span>
                </div>
                
                {loadingRsvps ? (
                  <p className="text-center text-sm text-wine-dark/60 py-4 font-serif">Loading responses...</p>
                ) : rsvps.length === 0 ? (
                  <p className="text-center text-sm text-wine-dark/60 py-4 font-serif">No responses yet.</p>
                ) : (
                  rsvps.map((rsvp, idx) => (
                    <div key={idx} className="bg-blush-light p-3.5 rounded-lg border border-pink-border/60 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-bold text-wine-dark text-sm">{rsvp.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${rsvp.attending === 'yes' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                            {rsvp.attending === 'yes' ? (
                              <><CheckCircle2 className="w-3 h-3" /> Attending</>
                            ) : (
                              <><XCircle className="w-3 h-3" /> Declined</>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Guests Badge */}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] bg-white border border-pink-border/80 px-2 py-0.5 rounded-md text-text-body font-medium">
                          <Users className="w-3 h-3 text-wine-dark opacity-70" />
                          {rsvp.guests ? `${rsvp.guests} ${Number(rsvp.guests) === 1 ? 'Guest' : 'Guests'}` : '1 Guest'}
                        </span>
                      </div>

                      {/* Wishes / Message */}
                      {rsvp.message && (
                        <p className="text-xs text-text-body italic border-l-2 border-wine-dark/30 pl-2.5 mt-1.5 bg-white/50 py-1 rounded-r">
                          "{rsvp.message}"
                        </p>
                      )}

                      {/* Date */}
                      {rsvp.submittedAt && (
                        <p className="text-[10px] text-wine-dark/50 mt-1 text-right">
                          {new Date(rsvp.submittedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
