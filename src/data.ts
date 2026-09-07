import { WeddingData } from "./types";

export const weddingData: WeddingData = {
  groom: {
    name: "Veer",
    parents: "Son of Mr. & Mrs. Khan",
    education: "M.Tech, PhD",
    profession: "Software Engineer",
  },
  bride: {
    name: "Zara",
    parents: "Daughter of Mr. & Mrs. Pathan",
    education: "B.Tech, MBA",
    profession: "Advocate, High Court",
  },
  weddingDate: "2026-09-30T10:00:00", // For countdown logic
  weddingDateFormatted: "September 30, 2026",
  weddingTimeFormatted: "10:00 AM",
  weddingDayFormatted: "Wednesday",
  openingThumbnailUrl: "https://i.ibb.co/QFc6pvCg/file-0000000069488211b334f24889ba09e4.png",
  openingVideoUrl: "https://www.image2url.com/r2/default/videos/1788010850590-27bb3d4c-eb70-4e57-8299-6bca19925158.mp4",
  heroVideoUrl: "https://cdn.pixabay.com/video/2021/08/18/85489-589366115_large.mp4",
  ogImageUrl: "https://i.ibb.co/whJhPT35/file-000000001e048211bb05770afd02bdae.png",
  heroMessage: "We are honored to welcome you to the\nWedding ceremony of",
  invitationMessage: "We are honored to welcome you to the\nWedding ceremony of Veer & Zara as they\nbegin their journey together in faith and\nlove,\nwe thank you for being part of this blessed\noccasion",
  events: [
    {
      id: "ev1",
      title: "MEHNDI",
      subtitle: "PLEASE JOIN US FOR AN EVENING OF",
      hashtag: "#VeerKiZara",
      date: "Jun 27, 2026",
      time: "9:30 PM",
      location: "At Bride's House",
      description: "Join us for an evening of music, dance, and henna.",
      decorativeStyle: "mehndi",
      backgroundUrl: "https://images.unsplash.com/photo-1605333553427-4a0b22a61dd0?q=80&w=1964&auto=format&fit=crop", // Greenish/floral vibe
    },
    {
      id: "ev2",
      title: "HALDI CEREMONY",
      subtitle: "PLEASE JOIN US FOR THE",
      hashtag: "#VeerKiZara",
      date: "Jun 28, 2026",
      time: "8:30 PM",
      location: "At Groom's House",
      description: "A morning of colors, blessings, and joy.",
      decorativeStyle: "haldi",
      backgroundUrl: "https://images.unsplash.com/photo-1579228811467-f4185764d9e0?q=80&w=1964&auto=format&fit=crop", // Yellow/warm vibe
    },
    {
      id: "ev3",
      title: "SANGEET",
      subtitle: "JOIN US FOR A NIGHT OF MUSIC AND DANCE",
      hashtag: "#VeerKiZara",
      date: "Jun 29, 2026",
      time: "9:00 PM",
      location: "At The Taj Mahal Palace",
      decorativeStyle: "sangeet",
      backgroundUrl: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=2070&auto=format&fit=crop", // Night/purple vibe
    },
    {
      id: "ev4",
      title: "WEDDING CEREMONY",
      subtitle: "PLEASE JOIN US AS WE TIE THE KNOT",
      hashtag: "#VeerKiZara",
      date: "Sep 30, 2026",
      time: "10:00 AM",
      location: "The Taj Mahal Palace",
      decorativeStyle: "wedding",
      backgroundUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop", // Romantic elegant
    }
  ],
  timeline: [
    {
      id: "tl1",
      title: "Guest Arrival",
      date: "Jun 30, 2026",
      time: "10:00 AM",
      description: "We Warmly welcome you..!"
    },
    {
      id: "tl2",
      title: "Wedding Ceremony",
      date: "Jun 30, 2026",
      time: "10:30 AM",
      description: "Your gracious presence is requested"
    },
    {
      id: "tl3",
      title: "Reception",
      date: "Jul 2, 2026",
      time: "7:30 PM",
      description: "Your gracious presence is requested at the Reception at 7:30 PM onwards."
    }
  ],
  venue: {
    name: "The Taj Mahal Palace",
    addressLine1: "Apollo Bandar, Colaba, Mumbai, Maharashtra",
    addressLine2: "400001",
    mapUrl: "https://maps.app.goo.gl/TajMahalPalace", // Placeholder link
  },
  transportation: "Transportation service will be available\nfrom the designated pickup center to the venue.\nPickup point: Central Station",
  dressCode: "Formal & Elegant",
  gallery: [
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop"
  ],
  musicUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=romantic-piano-112199.mp3", // Placeholder romantic royalty-free music
  closingMessage: "We can't wait to celebrate\nwith you!"
};
