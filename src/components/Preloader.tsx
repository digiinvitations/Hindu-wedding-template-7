import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { WeddingData } from '../types';

interface PreloaderProps {
  data: WeddingData;
  onComplete: () => void;
}

// Global cache to ensure assets are only preloaded once across remounts/navigation
const globallyPreloadedUrls = new Set<string>();

export function Preloader({ data, onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    // Collect all asset URLs across the invitation
    const rawUrls: string[] = [];

    if (data.openingThumbnailUrl) rawUrls.push(data.openingThumbnailUrl);
    if (data.ogImageUrl) rawUrls.push(data.ogImageUrl);
    
    // Hero fallback poster
    rawUrls.push("https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop");

    // Events assets (backgrounds, caricatures, circular images, logos)
    if (data.events && Array.isArray(data.events)) {
      data.events.forEach(e => {
        if (e.backgroundUrl) rawUrls.push(e.backgroundUrl);
        if (e.caricatureUrl) rawUrls.push(e.caricatureUrl);
        if (e.circularImageUrl) rawUrls.push(e.circularImageUrl);
        if (e.logoUrl) rawUrls.push(e.logoUrl);
        if (e.image) rawUrls.push(e.image);
      });
    }

    // Hero global logo if present
    const firstEventLogo = data.events?.find(e => e.logoUrl)?.logoUrl;
    if (firstEventLogo) rawUrls.push(firstEventLogo);

    // Gallery images
    if (data.gallery && Array.isArray(data.gallery)) {
      data.gallery.forEach(url => {
        if (url) rawUrls.push(url);
      });
    }

    // Deduplicate so every unique file is requested exactly once
    const uniqueUrls = Array.from(new Set(rawUrls.filter(Boolean)));
    const total = uniqueUrls.length;

    if (total === 0) {
      setProgress(100);
      onComplete();
      return;
    }

    // Check how many are already preloaded in memory
    let loadedCount = uniqueUrls.filter(url => globallyPreloadedUrls.has(url)).length;
    
    // If all files were already preloaded in this session
    if (loadedCount === total) {
      setProgress(100);
      const timer = setTimeout(() => {
        if (isMounted) onComplete();
      }, 250);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }

    const initialProgress = Math.round((loadedCount / total) * 100);
    setProgress(initialProgress);

    let isCompleted = false;

    const handleSingleAssetComplete = (url: string) => {
      globallyPreloadedUrls.add(url);
      loadedCount++;
      if (isMounted) {
        const pct = Math.min(100, Math.round((loadedCount / total) * 100));
        setProgress(pct);
      }

      if (loadedCount >= total && !isCompleted) {
        isCompleted = true;
        finishPreloader();
      }
    };

    const finishPreloader = () => {
      if (isMounted) {
        setProgress(100);
        setTimeout(() => {
          if (isMounted) onComplete();
        }, 300); // Brief pause at 100% so it feels smooth and complete
      }
    };

    // Preload each unique image file once and decode it
    uniqueUrls.forEach(url => {
      if (globallyPreloadedUrls.has(url)) return;

      const img = new Image();
      // @ts-ignore
      img.fetchPriority = "high";

      const markDone = () => {
        if (typeof img.decode === "function") {
          img.decode()
            .then(() => handleSingleAssetComplete(url))
            .catch(() => handleSingleAssetComplete(url));
        } else {
          handleSingleAssetComplete(url);
        }
      };

      img.onload = markDone;
      img.onerror = () => handleSingleAssetComplete(url);
      img.src = url;
    });

    // Failsafe timeout: never freeze the screen for more than 5 seconds if a network request hangs
    const safetyTimeout = setTimeout(() => {
      if (!isCompleted) {
        isCompleted = true;
        uniqueUrls.forEach(url => globallyPreloadedUrls.add(url));
        finishPreloader();
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, [data, onComplete]);

  return (
    <div className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-[#fcf9e8] px-6">
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ 
          rotate: { repeat: Infinity, duration: 4, ease: "linear" },
          scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
        }}
        className="mb-8 flex items-center justify-center"
      >
        <span className="text-5xl drop-shadow-md">🌸</span>
      </motion.div>
      <div className="w-full max-w-xs">
        <div className="h-1 w-full bg-[#d4af37]/20 rounded-full overflow-visible relative">
          <motion.div 
            className="h-full bg-[#d4af37] absolute top-0 left-0 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
          {/* Progress Arrow (🌸) following the tip */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 text-[12px] drop-shadow-sm z-10"
            initial={{ left: "0%" }}
            animate={{ left: `calc(${progress}% - 6px)` }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            🌸
          </motion.div>
        </div>
        <p className="text-center text-[#9c7c1b] font-serif text-[10px] uppercase tracking-widest mt-6 font-bold opacity-90 drop-shadow-sm">
          {progress < 100 ? `Loading your invitation ${progress}%` : "Ready"}
        </p>
      </div>
    </div>
  );
}
