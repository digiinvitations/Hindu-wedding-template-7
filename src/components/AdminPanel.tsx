import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { getWeddingData, saveWeddingData } from "../services/db";
import { WeddingData } from "../types";
import { Save, Image as ImageIcon, ArrowLeft } from "lucide-react";

export function AdminPanel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTemplateId = searchParams.get("template") || "main";
  
  const [data, setData] = useState<WeddingData | null>(null);
  const [saving, setSaving] = useState(false);
  const [templateId, setTemplateId] = useState(currentTemplateId);

  useEffect(() => {
    async function loadData() {
      const dbData = await getWeddingData(currentTemplateId);
      setData(dbData);
      setTemplateId(currentTemplateId);
    }
    loadData();
  }, [currentTemplateId]);

  if (!data) return <div className="p-8 font-serif">Loading Admin Panel...</div>;

  const handleChange = (path: string, value: any) => {
    setData((prev: any) => {
      // Use structuredClone to safely deep copy the state so we don't mutate prev
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setData((prev: any) => {
        const newGallery = [...prev.gallery];
        newGallery[index] = base64String;
        return { ...prev, gallery: newGallery };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSingleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      handleChange(field, base64String);
    };
    reader.readAsDataURL(file);
  };

  const addImage = () => {
    setData((prev: any) => ({
      ...prev,
      gallery: [...prev.gallery, ""]
    }));
  };

  const removeImage = (index: number) => {
    setData((prev: any) => {
      const newGallery = [...prev.gallery];
      newGallery.splice(index, 1);
      return { ...prev, gallery: newGallery };
    });
  };

  const handleSave = async () => {
    if (!templateId.trim()) {
      alert("Please provide a valid template name");
      return;
    }
    setSaving(true);
    try {
      await saveWeddingData(templateId.trim(), data);
      alert("Settings saved successfully!");
      if (templateId.trim() !== currentTemplateId) {
        navigate(`/admin?template=${encodeURIComponent(templateId.trim())}`);
      }
    } catch (error: any) {
      console.error(error);
      alert(`Failed to save: ${error.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-blush-main p-4 md:p-8 font-serif text-text-body">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 md:p-10 border border-pink-border">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-pink-border pb-4 gap-4">
          <div className="flex items-center gap-4">
            <Link to={`/?template=${encodeURIComponent(currentTemplateId)}`} className="flex items-center gap-2 text-wine-dark hover:text-burgundy bg-blush-light px-3 py-1.5 rounded-full border border-pink-border/50 transition-colors text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Link>
            <h1 className="text-3xl font-script text-wine-dark">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-end">
            <div className="flex flex-col items-start">
              <label className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">Save as Template Name</label>
              <input 
                type="text" 
                value={templateId} 
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="e.g., new remix template 001"
                className="bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent w-64"
              />
            </div>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-burgundy text-white px-6 py-2 h-[38px] mt-[20px] rounded-md hover:bg-wine-dark transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Couple Details */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Couple Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
                <h3 className="font-bold">Groom</h3>
                <Input label="Name" value={data.groom.name} onChange={(v) => handleChange("groom.name", v)} />
                <Input label="Parents" value={data.groom.parents} onChange={(v) => handleChange("groom.parents", v)} />
                <Input label="Education" value={data.groom.education} onChange={(v) => handleChange("groom.education", v)} />
                <Input label="Profession" value={data.groom.profession} onChange={(v) => handleChange("groom.profession", v)} />
              </div>
              <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
                <h3 className="font-bold">Bride</h3>
                <Input label="Name" value={data.bride.name} onChange={(v) => handleChange("bride.name", v)} />
                <Input label="Parents" value={data.bride.parents} onChange={(v) => handleChange("bride.parents", v)} />
                <Input label="Education" value={data.bride.education} onChange={(v) => handleChange("bride.education", v)} />
                <Input label="Profession" value={data.bride.profession} onChange={(v) => handleChange("bride.profession", v)} />
              </div>
            </div>
          </section>

          {/* Event Details */}
          <section>
             <h2 className="text-xl font-bold text-wine-dark mb-4">Event Date & Time</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Target Date (Countdown ISO)" value={data.weddingDate} onChange={(v) => handleChange("weddingDate", v)} type="datetime-local" />
                <Input label="Formatted Date" value={data.weddingDateFormatted} onChange={(v) => handleChange("weddingDateFormatted", v)} />
                <Input label="Formatted Time" value={data.weddingTimeFormatted} onChange={(v) => handleChange("weddingTimeFormatted", v)} />
                <Input label="Day of Week" value={data.weddingDayFormatted} onChange={(v) => handleChange("weddingDayFormatted", v)} />
             </div>
          </section>

          {/* Messages */}
          <section>
             <h2 className="text-xl font-bold text-wine-dark mb-4">Messages & Text</h2>
             <div className="space-y-4">
               <TextArea label="Hero Message" value={data.heroMessage} onChange={(v) => handleChange("heroMessage", v)} />
               <TextArea label="Invitation Message" value={data.invitationMessage} onChange={(v) => handleChange("invitationMessage", v)} />
               <TextArea label="Transportation Details" value={data.transportation} onChange={(v) => handleChange("transportation", v)} />
               <Input label="Dress Code" value={data.dressCode} onChange={(v) => handleChange("dressCode", v)} />
               <TextArea label="Closing Message" value={data.closingMessage} onChange={(v) => handleChange("closingMessage", v)} />
             </div>
          </section>

          {/* Media Settings */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Events</h2>
            <div className="space-y-4">
              {data.events.map((event, idx) => (
                <div key={event.id || idx} className="bg-blush-light p-4 rounded-lg border border-pink-border/50 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-wine-dark">Event {idx + 1}</h3>
                    <button onClick={() => {
                      const newEvents = [...data.events];
                      newEvents.splice(idx, 1);
                      handleChange("events", newEvents);
                    }} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-sm">Remove</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Event Title" value={event.title} onChange={(v) => handleChange(`events.${idx}.title`, v)} />
                    <Input label="Subtitle" value={event.subtitle || ""} onChange={(v) => handleChange(`events.${idx}.subtitle`, v)} placeholder="e.g. PLEASE JOIN US FOR..." />
                    <Input label="Hashtag" value={event.hashtag || ""} onChange={(v) => handleChange(`events.${idx}.hashtag`, v)} placeholder="e.g. #SunMeetsSky" />
                    <Input label="Date" value={event.date} type="date" onChange={(v) => handleChange(`events.${idx}.date`, v)} />
                    <Input label="Time (e.g., 7:00 PM)" value={event.time} onChange={(v) => handleChange(`events.${idx}.time`, v)} />
                    <Input label="Location Name" value={event.location} onChange={(v) => handleChange(`events.${idx}.location`, v)} />
                    <TextArea label="Description" value={event.description || ""} onChange={(v) => handleChange(`events.${idx}.description`, v)} />
                    <Input label="Map Link (URL)" value={event.mapUrl || ""} onChange={(v) => handleChange(`events.${idx}.mapUrl`, v)} />
                    
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-pink-border/50 pt-4 mt-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-widest opacity-70">Background Image URL</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleSingleImageUpload(e, `events.${idx}.backgroundUrl`)}
                          className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer mb-2"
                        />
                        <input type="text" value={event.backgroundUrl || ""} onChange={(e) => handleChange(`events.${idx}.backgroundUrl`, e.target.value)} placeholder="Or paste URL" className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent" />
                        {event.backgroundUrl && <img src={event.backgroundUrl} className="w-16 h-24 object-cover rounded-md mt-1" />}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-widest opacity-70">Logo URL</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleSingleImageUpload(e, `events.${idx}.logoUrl`)}
                          className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer mb-2"
                        />
                        <input type="text" value={event.logoUrl || ""} onChange={(e) => handleChange(`events.${idx}.logoUrl`, e.target.value)} placeholder="Or paste URL" className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent" />
                        {event.logoUrl && <img src={event.logoUrl} className="w-12 h-12 object-contain rounded-md mt-1" />}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-widest opacity-70">Caricature URL</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleSingleImageUpload(e, `events.${idx}.caricatureUrl`)}
                          className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer mb-2"
                        />
                        <input type="text" value={event.caricatureUrl || ""} onChange={(e) => handleChange(`events.${idx}.caricatureUrl`, e.target.value)} placeholder="Or paste URL" className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent" />
                        {event.caricatureUrl && <img src={event.caricatureUrl} className="w-16 h-16 object-contain rounded-md mt-1" />}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-widest opacity-70">Timeline Circular Image</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleSingleImageUpload(e, `events.${idx}.circularImageUrl`)}
                          className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer mb-2"
                        />
                        <input type="text" value={event.circularImageUrl || ""} onChange={(e) => handleChange(`events.${idx}.circularImageUrl`, e.target.value)} placeholder="Or paste URL" className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent" />
                        {event.circularImageUrl && <img src={event.circularImageUrl} className="w-16 h-16 object-cover rounded-full mt-1 border border-pink-border" />}
                      </div>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-pink-border/50 pt-4 mt-2">
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showTitle !== false} onChange={(e) => handleChange(`events.${idx}.showTitle`, e.target.checked)} /> Show Title</label>
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showSubtitle !== false} onChange={(e) => handleChange(`events.${idx}.showSubtitle`, e.target.checked)} /> Show Subtitle</label>
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showHashtag !== false} onChange={(e) => handleChange(`events.${idx}.showHashtag`, e.target.checked)} /> Show Hashtag</label>
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showDate !== false} onChange={(e) => handleChange(`events.${idx}.showDate`, e.target.checked)} /> Show Date</label>
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showTime !== false} onChange={(e) => handleChange(`events.${idx}.showTime`, e.target.checked)} /> Show Time</label>
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showLocation !== false} onChange={(e) => handleChange(`events.${idx}.showLocation`, e.target.checked)} /> Show Location</label>
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showDescription !== false} onChange={(e) => handleChange(`events.${idx}.showDescription`, e.target.checked)} /> Show Description</label>
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showLogo !== false} onChange={(e) => handleChange(`events.${idx}.showLogo`, e.target.checked)} /> Show Logo</label>
                       <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={event.showCaricature !== false} onChange={(e) => handleChange(`events.${idx}.showCaricature`, e.target.checked)} /> Show Caricature</label>
                    </div>

                    <div className="md:col-span-2">
                       <label className="text-xs font-semibold uppercase tracking-widest opacity-70">Decorative Style (Particles/Colors)</label>
                       <select value={event.decorativeStyle || "none"} onChange={(e) => handleChange(`events.${idx}.decorativeStyle`, e.target.value)} className="w-full mt-1 bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent">
                         <option value="none">None (Clean overlay)</option>
                         <option value="haldi">Haldi (Yellow / Gold / Floral)</option>
                         <option value="mehndi">Mehndi (Green / Emerald)</option>
                         <option value="sangeet">Sangeet (Purple / Indigo)</option>
                         <option value="wedding">Wedding (Burgundy / Royal)</option>
                       </select>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => {
                const newEvent = {
                  id: Date.now().toString(),
                  title: "New Event",
                  date: "",
                  time: "",
                  location: "",
                  videoUrl: "",
                  mapUrl: ""
                };
                handleChange("events", [...data.events, newEvent]);
              }} className="text-wine-dark hover:bg-blush-light px-4 py-2 rounded-md border border-pink-border w-full text-center">
                + Add Event
              </button>
            </div>
          </section>

          {/* Media Settings */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Media Settings</h2>
            <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
              
              <div className="flex flex-col gap-2">
                <h3 className="font-bold">Opening Thumbnail (Click to Enter)</h3>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleSingleImageUpload(e, 'openingThumbnailUrl')}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer"
                />
                <Input label="Or Thumbnail URL" value={data.openingThumbnailUrl || ""} onChange={(v) => handleChange("openingThumbnailUrl", v)} />
                {data.openingThumbnailUrl && <img src={data.openingThumbnailUrl} className="w-24 h-24 object-cover rounded-md mt-2" />}
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Opening Video</h3>
                <p className="text-xs opacity-70">Plays immediately after clicking the thumbnail. Must be a direct URL (e.g., .mp4).</p>
                <Input label="Video URL" value={data.openingVideoUrl || ""} onChange={(v) => handleChange("openingVideoUrl", v)} />
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">OG Image URL (Social Sharing Preview)</h3>
                <p className="text-xs opacity-70">Image shown when sharing the link on WhatsApp, Facebook, etc. Direct URL.</p>
                <Input label="OG Image URL" value={data.ogImageUrl || ""} onChange={(v) => handleChange("ogImageUrl", v)} />
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Hero Section Video</h3>
                <p className="text-xs opacity-70">Background video for the first section. Must be a direct URL (e.g., .mp4).</p>
                <Input label="Hero Video URL" value={data.heroVideoUrl || ""} onChange={(v) => handleChange("heroVideoUrl", v)} />
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Background Music</h3>
                <p className="text-xs opacity-70">Direct link to an audio file (e.g., .mp3) to play in the background.</p>
                <Input label="Music URL" value={data.musicUrl || ""} onChange={(v) => handleChange("musicUrl", v)} />
              </div>
            </div>
          </section>

          {/* Venue Settings */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Venue Details</h2>
            <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
              <Input label="Venue Name" value={data.venue.name} onChange={(v) => handleChange("venue.name", v)} />
              <Input label="Address Line 1" value={data.venue.addressLine1} onChange={(v) => handleChange("venue.addressLine1", v)} />
              <Input label="Address Line 2" value={data.venue.addressLine2} onChange={(v) => handleChange("venue.addressLine2", v)} />
              <Input label="Google Maps URL" value={data.venue.mapUrl} onChange={(v) => handleChange("venue.mapUrl", v)} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: { label: string, value: string, onChange: (v: string) => void, type?: string, placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</label>
      <textarea 
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent resize-y"
      />
    </div>
  );
}
