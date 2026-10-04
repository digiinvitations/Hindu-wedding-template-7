import React, { useState } from "react";
import { Heart, Instagram, Settings, X, KeyRound, Phone } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { WeddingData } from "../types";
import { getDefaultTemplateId } from "../services/db";

interface FooterProps {
  data: WeddingData;
}

export function Footer({ data }: FooterProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template') || getDefaultTemplateId();
  
  const [showPrompt, setShowPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAdminClick = () => {
    setShowPrompt(true);
    setPassword("");
    setError("");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "6396") {
      setShowPrompt(false);
      navigate(`/admin?template=${encodeURIComponent(templateId)}`);
    } else {
      setError("Incorrect password.");
    }
  };

  return (
    <footer className="py-14 bg-blush-light border-t border-pink-border flex flex-col items-center text-center px-4 relative">
      {/* Bride & Groom Name Sequence (Bride-Side Priority) */}
      <h4 className="font-serif text-2xl uppercase tracking-widest text-wine-dark font-bold mb-3 drop-shadow-sm">
        {data.bride.name} &amp; {data.groom.name}
      </h4>
      
      <div className="flex items-center gap-2 opacity-60 mb-6">
        <div className="w-8 h-[1px] bg-wine-dark"></div>
        <Heart className="w-3 h-3 text-wine-dark fill-wine-dark" />
        <div className="w-8 h-[1px] bg-wine-dark"></div>
      </div>
      
      {/* Creator Branding & Phone Display */}
      <div className="flex flex-col items-center gap-2 text-wine-dark/90 font-serif">
        <p className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
          Created with <Heart className="w-3.5 h-3.5 text-pink-accent fill-pink-accent" /> by digiinvitations_
          <a 
            href="https://www.instagram.com/digiinvitations_?igsi=MWh1ZnZhMm1xNnNkdw==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-pink-accent transition-colors ml-1"
            title="Follow on Instagram"
          >
            <Instagram className="w-4 h-4" />
          </a>
        </p>
        <p className="text-xs tracking-wider font-semibold text-wine-dark/80">
          To Create Yours Contact: <a href="tel:+919456411569" className="hover:underline font-bold">+91 9456411569</a>
        </p>
      </div>

      {/* Creator Contact Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full max-w-xs">
        {/* Call Now Button */}
        <a
          href="tel:+919456411569"
          className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-burgundy hover:bg-wine-dark text-white rounded-full font-serif text-xs uppercase tracking-wider font-semibold shadow-md active:scale-95 transition-all"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Now</span>
        </a>

        {/* WhatsApp Button (WhatsApp Green styling) */}
        <a
          href="https://wa.me/919456411569?text=Hello%20digiinvitations_%2C%20I%20would%20like%20to%20create%20a%20wedding%20invitation%20website!"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full font-serif text-xs uppercase tracking-wider font-semibold shadow-md active:scale-95 transition-all"
        >
          {/* WhatsApp SVG Icon */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.983.541 1.761.814 2.796.814 3.18 0 5.767-2.586 5.767-5.766.001-3.181-2.586-5.766-5.767-5.766zm3.409 8.169c-.144.404-.73.74-1.018.784-.287.043-.655.109-2.12-.511-1.874-.792-3.08-2.699-3.173-2.824-.093-.125-.758-.999-.758-1.921 0-.923.479-1.378.65-1.569.171-.191.372-.239.497-.239.124 0 .249.001.357.006.115.005.27-.043.421.32.156.375.534 1.303.58 1.397.047.094.078.204.016.328-.063.125-.094.203-.187.312-.094.11-.197.245-.281.33-.094.093-.192.195-.083.382.109.187.487.804 1.045 1.301.719.641 1.325.84 1.512.934.187.094.296.078.406-.047.109-.125.468-.546.593-.733.125-.187.249-.156.421-.093.171.063 1.09.514 1.277.608.187.094.312.141.358.219.047.078.047.452-.097.856zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.957-1.397A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.067c-1.637 0-3.15-.494-4.417-1.341l-.317-.214-3.037.856.857-2.964-.236-.339A8.026 8.026 0 0 1 3.933 12c0-4.448 3.619-8.067 8.067-8.067 4.448 0 8.067 3.619 8.067 8.067 0 4.448-3.619 8.067-8.067 8.067z"/>
          </svg>
          <span>WhatsApp</span>
        </a>
      </div>

      {/* Admin Access Button (Password: 6396) */}
      <div className="mt-10 flex justify-center w-full">
        <button 
          onClick={handleAdminClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blush-main text-wine-dark/70 hover:text-wine-dark border border-pink-border rounded-full shadow-2xs hover:bg-blush-light transition-colors text-[10px] font-serif uppercase tracking-widest"
          title="Admin Access"
        >
          <Settings className="w-3 h-3" />
          Admin Access
        </button>
      </div>

      {/* Custom Password Prompt Modal */}
      {showPrompt && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-wine-dark/40 backdrop-blur-sm px-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowPrompt(false)}
              className="absolute top-4 right-4 text-wine-dark/60 hover:text-wine-dark transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 bg-blush-light rounded-full flex items-center justify-center mb-3">
                <KeyRound className="w-6 h-6 text-burgundy" />
              </div>
              <h3 className="font-serif text-xl text-wine-dark font-bold">Admin Access</h3>
              <p className="text-sm text-wine-dark/70 font-serif mt-1">Please enter the password</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoFocus
                  className="w-full px-4 py-3 bg-blush-main/50 border border-pink-border rounded-lg text-center font-serif text-wine-dark focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy transition-all"
                />
                {error && <p className="text-red-500 text-xs text-center mt-2 font-serif">{error}</p>}
              </div>
              
              <button 
                type="submit"
                className="w-full bg-burgundy text-white font-serif tracking-widest uppercase text-sm py-3 rounded-lg shadow-md hover:bg-wine-dark transition-colors font-semibold"
              >
                Access Panel
              </button>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
