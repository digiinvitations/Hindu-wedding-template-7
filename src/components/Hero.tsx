import { motion } from "motion/react";
import { Heart, ArrowDown } from "lucide-react";
import { WeddingData } from "../types";
import { useState, useRef, useEffect } from "react";

interface HeroProps {
  data: WeddingData;
  shouldPlayVideo?: boolean;
  onVideoEnd?: () => void;
}

export function Hero({ data, shouldPlayVideo = true, onVideoEnd }: HeroProps) {
  const [showText, setShowText] = useState(!data.heroVideoUrl);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // High priority poster image for instant visibility
  const posterUrl = data.ogImageUrl 
    ? data.ogImageUrl
    : "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop";

  useEffect(() => {
    let playTimer: NodeJS.Timeout;

    if (shouldPlayVideo && videoRef.current && !videoError) {
      // Start playing once allowed
      const videoElement = videoRef.current;
      videoElement.play().catch((err) => {
        console.warn("Hero video autoplay restricted or pending interaction:", err);
        // If autoplay is blocked or failed, don't hold back the invitation text
        setShowText(true);
      });

      // Failsafe: if video is buffering slowly on mobile network, reveal text after 3s
      playTimer = setTimeout(() => {
        setShowText(true);
      }, 3000);
    } else if (!shouldPlayVideo && videoRef.current) {
      videoRef.current.pause();
    }

    return () => {
      clearTimeout(playTimer);
    };
  }, [shouldPlayVideo, videoError]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime } = videoRef.current;
      if (currentTime >= 1.5) {
        if (!showText) setShowText(true);
      }
    }
  };

  const handleEnded = () => {
    setShowText(true);
    if (onVideoEnd) onVideoEnd();
  };

  const handleVideoCanPlay = () => {
    setIsVideoReady(true);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setShowText(true);
  };

  return (
    <section className="relative min-h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden bg-blush-main">
      {/* Background Layer: Poster + Video with Graceful Fallback */}
      <div className="absolute inset-0 z-0 bg-blush-main overflow-hidden">
        
        {/* Instant Poster Image (Loads with High Fetch Priority, Never Blank) */}
        <img
          src={posterUrl}
          alt="Hero Poster"
          // @ts-ignore
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isVideoReady && !videoError ? "opacity-40" : "opacity-90"
          }`}
        />

        {/* Video Element: Lazy Preloaded, Deferred until viewState is ready */}
        {data.heroVideoUrl && !videoError && (
          <video
            ref={videoRef}
            playsInline
            muted
            poster={posterUrl}
            preload={shouldPlayVideo ? "metadata" : "none"}
            onCanPlay={handleVideoCanPlay}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onError={handleVideoError}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              isVideoReady ? "opacity-100" : "opacity-0"
            }`}
          >
            <source src={data.heroVideoUrl} type="video/mp4" />
          </video>
        )}

        {/* Dynamic Light/Pink Overlay for readability */}
        <div 
          className={`absolute inset-0 bg-white/20 transition-opacity duration-1000 ${
            data.heroVideoUrl && !showText && isVideoReady ? 'opacity-0' : 'opacity-100'
          }`} 
        />

        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-blush-main to-transparent pointer-events-none z-10" />
      </div>

      {/* Content */}
      <div className={`relative z-10 flex flex-col items-center justify-center px-6 text-center w-full max-w-md mx-auto pt-12 pb-6 h-full min-h-[100svh] transition-opacity duration-1000 ${showText ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        <div className="flex-1 flex flex-col items-center justify-center w-full mt-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 10 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex flex-col items-center w-full"
          >
            <Heart className="w-5 h-5 text-[#A91F3D] fill-[#A91F3D] mb-4 opacity-90" />
            <p className="font-serif text-[#8F1736] text-[14px] italic mb-4 max-w-[280px] leading-relaxed whitespace-pre-line font-medium">
              {data.heroMessage}
            </p>
            
            <div className="flex items-center justify-center gap-3 opacity-80 mb-6">
              <div className="h-[1px] w-12 bg-[#8F1736]"></div>
              <Heart className="w-3 h-3 text-[#A91F3D] fill-[#A91F3D]" />
              <div className="h-[1px] w-12 bg-[#8F1736]"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: showText ? 1 : 0, scale: showText ? 1 : 0.95 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="flex flex-col items-center justify-center w-full"
          >
            <h1 className="font-script text-5xl sm:text-6xl text-[#8F1736] drop-shadow-sm leading-none whitespace-nowrap">
              {data.bride.name}
            </h1>
            <div className="font-serif flex flex-col items-center gap-1.5 mt-2.5 mb-5 text-center">
              <p className="font-bold text-[14px] sm:text-[15px] text-[#78122B] tracking-wide leading-snug drop-shadow-2xs">
                {data.bride.parents}
              </p>
              {data.bride.education && (
                <p className="text-[12px] sm:text-[13px] text-[#5D4147]/90 font-medium italic">
                  {data.bride.education}
                </p>
              )}
              <p className="font-bold text-[13.5px] sm:text-[14.5px] text-[#8F1736] tracking-wide">
                {data.bride.profession}
              </p>
            </div>
            
            <span className="font-script text-3xl text-[#D995A5] my-1">&amp;</span>
            
            <h1 className="font-script text-5xl sm:text-6xl text-[#8F1736] drop-shadow-sm leading-none mt-3 whitespace-nowrap">
              {data.groom.name}
            </h1>
            <div className="font-serif flex flex-col items-center gap-1.5 mt-2.5 text-center">
              <p className="font-bold text-[14px] sm:text-[15px] text-[#78122B] tracking-wide leading-snug drop-shadow-2xs">
                {data.groom.parents}
              </p>
              {data.groom.education && (
                <p className="text-[12px] sm:text-[13px] text-[#5D4147]/90 font-medium italic">
                  {data.groom.education}
                </p>
              )}
              <p className="font-bold text-[13.5px] sm:text-[14.5px] text-[#8F1736] tracking-wide">
                {data.groom.profession}
              </p>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showText ? 0.8 : 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-6 flex flex-col items-center"
        >
          <span className="text-[10px] font-serif text-[#8F1736] uppercase tracking-[0.3em] mb-2 font-bold">Scroll</span>
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="w-4 h-4 text-[#8F1736]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
