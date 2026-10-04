import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { Hero } from './components/Hero';
import { InvitationMessage } from './components/InvitationMessage';
import { MusicControl } from './components/MusicControl';
import { ScratchCardSection } from './components/ScratchCard';
import { Countdown } from './components/Countdown';
import { Events } from './components/Events';
import { Timeline } from './components/Timeline';
import { Venue } from './components/Venue';
import { RSVP } from './components/RSVP';
import { ClosingMessage } from './components/ClosingMessage';
import { Footer } from './components/Footer';
import { getWeddingData, getDefaultTemplateId } from './services/db';
import { WeddingData } from './types';
import { AdminPanel } from './components/AdminPanel';
import { Preloader } from './components/Preloader';
import { Reveal } from './components/Reveal';
import { EnvironmentEffects } from './components/EnvironmentEffects';

function PublicView() {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template') || getDefaultTemplateId();

  const [data, setData] = useState<WeddingData | null>(null);
  const [isPreloading, setIsPreloading] = useState(true);
  const [viewState, setViewState] = useState<'thumbnail' | 'opening-video' | 'main'>('thumbnail');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isScratched, setIsScratched] = useState(false);
  const [isHeroEnded, setIsHeroEnded] = useState(false);
  const openingVideoRef = useRef<HTMLVideoElement>(null);
  const videoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadData() {
      const dbData = await getWeddingData(templateId);
      setData(dbData);
      if (!dbData.openingThumbnailUrl) {
        setViewState('main');
      }
    }
    loadData();
  }, [templateId]);

  const handleThumbnailClick = () => {
    if (viewState === 'opening-video') {
      // If user clicks again while video is buffering, skip straight to main
      if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
      setViewState('main');
      return;
    }

    if (data?.openingVideoUrl) {
      setViewState('opening-video');
      
      // Safety timeout: if video fails to play/load within 4 seconds, don't trap the user
      videoTimeoutRef.current = setTimeout(() => {
        setViewState('main');
      }, 4000);

      if (openingVideoRef.current) {
        openingVideoRef.current.play().catch((err) => {
          console.warn("Opening video playback error, transitioning to main:", err);
          if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
          setViewState('main');
        });
      }
    } else {
      setViewState('main');
    }
  };

  useEffect(() => {
    if (data) {
      const brideName = data.bride?.name?.trim() || "Bride";
      const groomName = data.groom?.name?.trim() || "Groom";
      const formattedTitle = `${brideName} & ${groomName} | Wedding Invitation`;
      const descriptionText = `You are invited to the wedding of ${brideName} & ${groomName}.`;

      // Set document title
      document.title = formattedTitle;

      const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
        let el = document.querySelector(selector);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attrName, attrVal);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      // Description & Social Tags
      setMetaTag('meta[name="description"]', 'name', 'description', descriptionText);
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', formattedTitle);
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', descriptionText);
      setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', formattedTitle);
      setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', descriptionText);

      if (data.ogImageUrl) {
        setMetaTag('meta[property="og:image"]', 'property', 'og:image', data.ogImageUrl);
        setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', data.ogImageUrl);
      }
    }
  }, [data]);

  if (!data) {
    return <div className="min-h-screen bg-blush-main flex items-center justify-center font-serif text-wine-dark">Loading...</div>;
  }

  if (isPreloading) {
    return <Preloader data={data} onComplete={() => setIsPreloading(false)} />;
  }

  const thumbnailSrc = data.openingThumbnailUrl;

  return (
    <div className={`w-full bg-blush-main relative mx-auto max-w-md shadow-2xl overflow-hidden sm:my-0 ${viewState !== 'main' ? 'h-[100svh]' : 'min-h-[100svh]'}`}>
      
      {/* Audio player remains mounted across transitions */}
      <MusicControl musicUrl={data.musicUrl} shouldPlay={viewState !== 'thumbnail'} />

      {/* Global Environment Animations (Petals, Birds, Butterflies) */}
      {viewState === 'main' && <EnvironmentEffects />}

      {/* Main Content (Hero video only plays when viewState === 'main' to prevent bandwidth contention) */}
      <main className="w-full min-h-[100svh] bg-blush-main relative overflow-hidden">
        <Hero 
          data={data} 
          shouldPlayVideo={viewState === 'main'} 
          onVideoEnd={() => setIsHeroEnded(true)} 
        />
        <Reveal delay={0.1}><InvitationMessage message={data.invitationMessage} isHeroEnded={isHeroEnded} /></Reveal>
        <Reveal delay={0.1}><ScratchCardSection data={data} onReveal={() => setIsScratched(true)} /></Reveal>
        {isScratched && <Reveal delay={0.1}><Countdown targetDate={data.weddingDate} /></Reveal>}
        <Reveal delay={0.1}><Events events={data.events} globalLogo={data?.hero?.logoUrl} /></Reveal>
        <Reveal delay={0.1}><Timeline events={data.events} /></Reveal>
        <Reveal delay={0.1}><Venue venue={data.venue} groom={data.groom} bride={data.bride} weddingDate={data.weddingDate} /></Reveal>
        <Reveal delay={0.1}><RSVP templateId={templateId} /></Reveal>
        <Reveal delay={0.1}><ClosingMessage data={data} /></Reveal>
        <Reveal delay={0.1}><Footer data={data} /></Reveal>
      </main>

      {/* Opening Video Overlay (z-[9999]) - Deferred loading, only active when triggered */}
      {data.openingVideoUrl && (
        <div 
          className={`absolute inset-0 z-[9999] bg-blush-main flex items-center justify-center transition-opacity duration-500 ${
            viewState === 'opening-video' ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <video
            ref={openingVideoRef}
            src={data.openingVideoUrl}
            playsInline
            muted
            preload={viewState === 'opening-video' ? 'auto' : 'none'}
            onLoadedData={() => {
              if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
              setIsVideoPlaying(true);
            }}
            onError={() => {
              console.warn("Failed to load opening video.");
              if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
              setViewState('main');
            }}
            onTimeUpdate={(e) => {
              if (e.currentTarget.currentTime > 0.1) {
                if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
                setIsVideoPlaying(true);
              }
            }}
            onEnded={() => {
              if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
              setViewState('main');
            }}
            onClick={() => {
              if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
              setViewState('main');
            }}
            className="w-full h-full object-contain cursor-pointer"
          />
        </div>
      )}

      {/* Thumbnail Overlay (z-[9999]) */}
      {thumbnailSrc && (
        <div 
          className={`absolute inset-0 z-[9999] bg-blush-main flex flex-col items-center justify-center cursor-pointer transition-opacity duration-700 ${
            viewState === 'thumbnail' || (viewState === 'opening-video' && !isVideoPlaying) 
              ? 'opacity-100' 
              : 'opacity-0 pointer-events-none'
          }`}
          onClick={handleThumbnailClick}
        >
          <img 
            src={thumbnailSrc} 
            alt="Opening" 
            // @ts-ignore
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 w-full h-full object-contain" 
          />
          
          {/* Tap to open indicator */}
          <div className="absolute bottom-20 z-10 bg-white/40 backdrop-blur-md border border-white/50 px-6 py-2.5 rounded-full shadow-lg flex items-center justify-center animate-pulse">
            <span className="font-serif text-wine-dark uppercase tracking-widest text-xs font-bold drop-shadow-sm">
              Tap to open
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicView />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}
