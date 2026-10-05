import React, { useState, useEffect } from 'react';
import {
  INITIAL_MEDIA_SLOTS,
  DEMO_PRESETS,
  DEFAULT_CONTENT,
  PROJECTS,
  CASE_STUDIES,
  VIDEO_SHOWCASE,
  PROCESS_STEPS,
  SKILLS_LIST,
  EXPERIENCE_LIST,
} from './data/defaultData';
import { MediaItem, ProjectItem, CaseStudyItem, PortfolioContent, SocialLinkItem, ExperienceItem } from './types';
import { MediaSlot } from './components/MediaSlot';
import { EditableText } from './components/EditableText';
import { SocialLinksEditor } from './components/SocialLinksEditor';
import { DreamySkyBackground } from './components/DreamySkyBackground';
import { getMediaBlob, clearAllMediaBlobs } from './utils/mediaStorage';
import { Navbar } from './components/Navbar';
import { Toolbar } from './components/Toolbar';
import { ExportModal } from './components/ExportModal';
import { ProjectModal } from './components/ProjectModal';
import { ContactModal } from './components/ContactModal';
import {
  ArrowDown,
  ArrowUpRight,
  Sparkles,
  Mail,
  Instagram,
  Video as VideoIcon,
  Facebook,
  CheckCircle,
  ExternalLink,
  Edit3,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function App() {
  // State for all editable texts, with localStorage persistence
  const [content, setContent] = useState<PortfolioContent>(() => {
    try {
      const saved = localStorage.getItem('pastel_portfolio_content');
      if (saved) {
        return { ...DEFAULT_CONTENT, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_CONTENT;
  });

  // State for all media slots, with localStorage persistence
  const [mediaSlots, setMediaSlots] = useState<Record<string, MediaItem>>(() => {
    try {
      const saved = localStorage.getItem('pastel_portfolio_slots');
      if (saved) {
        return { ...INITIAL_MEDIA_SLOTS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return INITIAL_MEDIA_SLOTS;
  });

  // Projects state (allow title/desc edit)
  const [projects, setProjects] = useState<ProjectItem[]>(PROJECTS);
  const [caseStudies, setCaseStudies] = useState<CaseStudyItem[]>(CASE_STUDIES);

  // Experiences state (9 notable experiences & projects requested by user)
  const [experiences, setExperiences] = useState<ExperienceItem[]>(() => {
    try {
      const saved = localStorage.getItem('pastel_portfolio_exp_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= EXPERIENCE_LIST.length) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return EXPERIENCE_LIST;
  });

  // Edit Mode state (true = inline text editable & hide buttons shown; false = locked preview)
  const [isEditMode, setIsEditMode] = useState<boolean>(true);

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Active filter for Selected Work
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Save content to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pastel_portfolio_content', JSON.stringify(content));
    } catch {
      // ignore
    }
  }, [content]);

  // Save experiences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pastel_portfolio_exp_v2', JSON.stringify(experiences));
    } catch {
      // ignore
    }
  }, [experiences]);

  // Restore media Blobs from IndexedDB on initial load
  useEffect(() => {
    let isMounted = true;
    async function restoreBlobs() {
      try {
        const slotKeys = Object.keys(INITIAL_MEDIA_SLOTS);
        const updates: Record<string, Partial<MediaItem>> = {};
        for (const key of slotKeys) {
          const blob = await getMediaBlob(key);
          if (blob && isMounted) {
            updates[key] = {
              url: URL.createObjectURL(blob),
              isLocalBlob: true,
            };
          }
        }
        if (Object.keys(updates).length > 0 && isMounted) {
          setMediaSlots((prev) => {
            const next = { ...prev };
            Object.entries(updates).forEach(([k, v]) => {
              if (next[k]) {
                next[k] = { ...next[k], ...v };
              }
            });
            return next;
          });
        }
      } catch (e) {
        console.warn('Error restoring media from IndexedDB:', e);
      }
    }
    restoreBlobs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save mediaSlots to localStorage (safely strip blob: URLs and huge data URLs to avoid QuotaExceededError!)
  useEffect(() => {
    try {
      const safeSlots: Record<string, any> = {};
      Object.entries(mediaSlots).forEach(([key, val]) => {
        const isBlob = typeof val.url === 'string' && val.url.startsWith('blob:');
        const isHugeData = typeof val.url === 'string' && val.url.startsWith('data:') && val.url.length > 500000;
        safeSlots[key] = {
          ...val,
          url: isBlob || isHugeData ? undefined : val.url,
          isLocalBlob: isBlob || val.isLocalBlob,
        };
      });
      localStorage.setItem('pastel_portfolio_slots', JSON.stringify(safeSlots));
    } catch (err) {
      console.warn('LocalStorage save quota exceeded, skipping huge media persistence:', err);
    }
  }, [mediaSlots]);

  // Update a single text field in content
  const handleUpdateContent = (key: keyof PortfolioContent, value: string) => {
    setContent((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Update social links
  const handleUpdateSocialLinks = (newLinks: SocialLinkItem[]) => {
    setContent((prev) => ({
      ...prev,
      socialLinks: newLinks,
    }));
  };

  // Update a single slot
  const handleUpdateSlot = (id: string, updates: Partial<MediaItem>) => {
    setMediaSlots((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...updates,
      },
    }));
  };

  // Toggle hide/show on a slot
  const handleToggleHideSlot = (id: string) => {
    setMediaSlots((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        hidden: !prev[id].hidden,
      },
    }));
  };

  // Restore all hidden slots
  const handleRestoreAllHidden = () => {
    setMediaSlots((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = {
          ...next[key],
          hidden: false,
        };
      });
      return next;
    });
  };

  // Populate all with sample demo media
  const handleLoadAllDemo = () => {
    setMediaSlots((prev) => {
      const next = { ...prev };
      Object.keys(DEMO_PRESETS).forEach((key) => {
        if (next[key]) {
          next[key] = {
            ...next[key],
            url: DEMO_PRESETS[key].url,
            videoType: DEMO_PRESETS[key].videoType,
            hidden: false,
          };
        }
      });
      return next;
    });
  };

  // Reset all back to blank placeholders
  const handleResetAll = async () => {
    await clearAllMediaBlobs();
    setMediaSlots((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = {
          ...next[key],
          url: undefined,
          videoType: undefined,
          hidden: false,
          isLocalBlob: false,
        };
      });
      return next;
    });
  };

  // Count slots
  const allSlotValues = Object.values(mediaSlots);
  const totalSlots = allSlotValues.length;
  const hiddenCount = allSlotValues.filter((s) => s.hidden).length;
  const filledCount = allSlotValues.filter((s) => !s.hidden && !!s.url).length;

  // Filter projects
  const filteredProjects =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen text-[#19232D] font-vietnam selection:bg-[#FBE8A6] relative overflow-x-hidden">
      {/* Saturated Dreamy Pastel Sky Background with Lively Moving Clouds & Sparkles */}
      <DreamySkyBackground />

      {/* 1. NAVIGATION */}
      <Navbar
        brandName={content.brandName}
        onUpdateBrandName={(val) => handleUpdateContent('brandName', val)}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode((prev) => !prev)}
        onOpenExport={() => setIsExportOpen(true)}
        onLoadAllDemo={handleLoadAllDemo}
        onResetAll={handleResetAll}
        filledCount={filledCount}
        totalSlots={totalSlots}
      />

      <main id="home">
        {/* 2. HERO SECTION */}
        <section className="relative min-h-[calc(100vh-76px)] py-16 sm:py-24 lg:py-28 flex items-center overflow-hidden">
          {/* Floating Sticker 1: Top Right */}
          <div className="hidden xl:flex absolute top-12 right-[42%] z-20 items-center gap-2 px-4 py-2 rounded-full glass-panel-yellow text-[#19232D] text-xs font-bold tracking-wide animate-float-slow select-none pointer-events-none shadow-md">
            <span>✨</span>
            <span>VIRAL HOOKS &amp; STRATEGY</span>
          </div>

          {/* Floating Sticker 2: Mid Left */}
          <div className="hidden xl:flex absolute bottom-20 left-12 z-20 items-center gap-2 px-4 py-2 rounded-full glass-panel-blue text-[#19232D] text-xs font-bold tracking-wide animate-float-reverse select-none pointer-events-none shadow-md">
            <span>⚡</span>
            <span>100% ORGANIC RETENTION</span>
          </div>

          <div className="max-w-[1280px] mx-auto px-5 sm:px-8 w-full relative z-10">
            <div className={`grid grid-cols-1 ${!mediaSlots.hero?.hidden || isEditMode ? 'lg:grid-cols-[1.15fr_0.85fr]' : 'max-w-3xl mx-auto'} items-center gap-12 lg:gap-16`}>
              {/* Left Column: Typography & Story */}
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel-yellow text-xs font-bold tracking-wider text-[#19232D] shadow-sm mb-6">
                  <span>✦</span>
                  <EditableText
                    value={content.heroKicker}
                    onChange={(val) => handleUpdateContent('heroKicker', val)}
                    isEditMode={isEditMode}
                    className="font-bold uppercase tracking-wider text-xs"
                  />
                </div>

                <div className="space-y-2 mb-6">
                  <span className="font-playfair italic font-medium text-[clamp(28px,4.5vw,52px)] text-[#19232D] block transform -rotate-2 origin-left">
                    <EditableText
                      value={content.heroScript}
                      onChange={(val) => handleUpdateContent('heroScript', val)}
                      isEditMode={isEditMode}
                      className="font-playfair italic"
                    />
                  </span>
                  <h1 className="font-vietnam font-black text-[clamp(52px,9vw,120px)] leading-[1.08] tracking-tight uppercase text-[#19232D]">
                    <EditableText
                      value={content.heroTitleMain}
                      onChange={(val) => handleUpdateContent('heroTitleMain', val)}
                      isEditMode={isEditMode}
                    />
                    <br />
                    <span className="text-transparent" style={{ WebkitTextStroke: '2px #19232D' }}>
                      <EditableText
                        value={content.heroTitleOutline}
                        onChange={(val) => handleUpdateContent('heroTitleOutline', val)}
                        isEditMode={isEditMode}
                      />
                    </span>
                  </h1>
                </div>

                <div className="max-w-xl text-base sm:text-lg text-[#5A6A7E] leading-relaxed mb-8">
                  <EditableText
                    value={content.heroDescription}
                    onChange={(val) => handleUpdateContent('heroDescription', val)}
                    isEditMode={isEditMode}
                    multiline={true}
                    rows={3}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href="#work"
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#FBE8A6] to-[#FDF6DE] hover:opacity-95 text-xs font-bold uppercase tracking-wider text-[#19232D] shadow-[0_8px_25px_rgba(251,232,166,0.5)] border border-white hover:-translate-y-1 transition-transform"
                  >
                    <span>XEM CÁC DỰ ÁN</span>
                    <ArrowDown size={14} />
                  </a>

                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-white/90 hover:bg-[#E8F4FC] text-xs font-bold uppercase tracking-wider text-[#19232D] shadow-md border border-white hover:-translate-y-1 transition-transform"
                  >
                    <span>HỢP TÁC NGAY</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>

              {/* Right Column: Hero Media Slot */}
              {(!mediaSlots.hero?.hidden || isEditMode) && (
                <div className="relative w-full">
                  {!mediaSlots.hero?.hidden && (
                    <>
                      {/* Floating Badges Over Media */}
                      <div className="absolute -top-3 -left-3 z-20 hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-panel text-[#19232D] text-[11px] font-bold tracking-wider uppercase shadow-md animate-float-slow">
                        <span>★</span>
                        <span>CREATIVE DIRECTION</span>
                      </div>

                      <div className="absolute -bottom-3 -right-3 z-20 hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-panel-yellow text-[#19232D] text-[11px] font-bold tracking-wider uppercase shadow-md animate-float-reverse">
                        <span>🎬</span>
                        <span>REELS &amp; SHORTS EXPERT</span>
                      </div>
                    </>
                  )}

                  <div className={!mediaSlots.hero?.hidden ? "rounded-3xl p-2 glass-panel shadow-[0_20px_50px_-10px_rgba(130,191,231,0.3)]" : ""}>
                    <MediaSlot
                      item={mediaSlots.hero}
                      onUpdate={handleUpdateSlot}
                      onToggleHide={handleToggleHideSlot}
                      isEditMode={isEditMode}
                      minHeight="520px"
                      theme="yellow"
                      className="aspect-square lg:aspect-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3. DUAL-ROW CONTINUOUS MARQUEE */}
        <div className="overflow-hidden glass-panel-yellow py-3 border-y border-white/60">
          <div className="animate-marquee-left font-vietnam font-black text-xl sm:text-2xl tracking-wider uppercase text-[#19232D] select-none">
            <span className="px-6 whitespace-nowrap">STORYTELLING ✦ SOCIAL MEDIA ✦ CONTENT CREATION ✦ BRANDING ✦</span>
            <span className="px-6 whitespace-nowrap">SHORT-FORM VIDEO ✦ VIRAL HOOKS ✦ CREATIVE DIRECTION ✦</span>
            <span className="px-6 whitespace-nowrap">STORYTELLING ✦ SOCIAL MEDIA ✦ CONTENT CREATION ✦ BRANDING ✦</span>
            <span className="px-6 whitespace-nowrap">SHORT-FORM VIDEO ✦ VIRAL HOOKS ✦ CREATIVE DIRECTION ✦</span>
          </div>
        </div>

        <div className="overflow-hidden glass-panel-blue py-2.5 border-b border-white/60">
          <div className="animate-marquee-right font-vietnam font-bold text-xs sm:text-sm tracking-widest uppercase text-[#19232D] select-none">
            <span className="px-6 whitespace-nowrap">✦ DATA-DRIVEN INSIGHTS · EDITORIAL AESTHETIC · AUDIENCE ENGAGEMENT · BRAND RECOGNITION ✦</span>
            <span className="px-6 whitespace-nowrap">✦ DATA-DRIVEN INSIGHTS · EDITORIAL AESTHETIC · AUDIENCE ENGAGEMENT · BRAND RECOGNITION ✦</span>
            <span className="px-6 whitespace-nowrap">✦ DATA-DRIVEN INSIGHTS · EDITORIAL AESTHETIC · AUDIENCE ENGAGEMENT · BRAND RECOGNITION ✦</span>
          </div>
        </div>

        {/* 4. 01 / WHO I AM (ABOUT ME) */}
        <section id="about" className="py-24 sm:py-32 relative">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
            <div className={`grid grid-cols-1 ${!mediaSlots.about?.hidden || isEditMode ? 'lg:grid-cols-[0.88fr_1.12fr]' : 'max-w-3xl mx-auto'} gap-12 lg:gap-18 items-start`}>
              {/* Photo Slot */}
              {(!mediaSlots.about?.hidden || isEditMode) && (
                <div className="w-full relative">
                  <div className={!mediaSlots.about?.hidden ? "p-2 rounded-3xl glass-panel-yellow shadow-lg" : ""}>
                    <MediaSlot
                      item={mediaSlots.about}
                      onUpdate={handleUpdateSlot}
                      onToggleHide={handleToggleHideSlot}
                      isEditMode={isEditMode}
                      minHeight="490px"
                      theme="yellow"
                      className="aspect-[4/5] lg:aspect-auto"
                    />
                  </div>
                </div>
              )}

              {/* Text & Stats */}
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#5A6A7E] mb-3 px-3 py-1 rounded-full glass-panel shadow-sm">
                  <span>✦</span>
                  <EditableText
                    value={content.aboutEyebrow}
                    onChange={(val) => handleUpdateContent('aboutEyebrow', val)}
                    isEditMode={isEditMode}
                  />
                </div>

                <h2 className="font-vietnam font-black text-[clamp(44px,6.5vw,90px)] leading-[1.06] uppercase tracking-tight text-[#19232D] mb-6">
                  <EditableText
                    value={content.aboutTitle}
                    onChange={(val) => handleUpdateContent('aboutTitle', val)}
                    isEditMode={isEditMode}
                  />
                  <br />
                  <span className="text-transparent" style={{ WebkitTextStroke: '2px #19232D' }}>
                    <EditableText
                      value={content.aboutTitleStroke}
                      onChange={(val) => handleUpdateContent('aboutTitleStroke', val)}
                      isEditMode={isEditMode}
                    />
                  </span>
                </h2>

                <div className="text-base sm:text-lg text-[#19232D] leading-relaxed mb-8 font-normal">
                  <EditableText
                    value={content.aboutText}
                    onChange={(val) => handleUpdateContent('aboutText', val)}
                    isEditMode={isEditMode}
                    multiline={true}
                    rows={4}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-6 rounded-3xl glass-panel hover:-translate-y-1 transition-transform">
                    <b className="font-vietnam font-black text-4xl block text-[#19232D] tabular-nums mb-1">
                      <EditableText
                        value={content.stat1Number}
                        onChange={(val) => handleUpdateContent('stat1Number', val)}
                        isEditMode={isEditMode}
                      />
                    </b>
                    <span className="text-xs font-bold text-[#5A6A7E] uppercase tracking-wider block">
                      <EditableText
                        value={content.stat1Label}
                        onChange={(val) => handleUpdateContent('stat1Label', val)}
                        isEditMode={isEditMode}
                      />
                    </span>
                  </div>

                  <div className="p-6 rounded-3xl glass-panel hover:-translate-y-1 transition-transform">
                    <b className="font-vietnam font-black text-4xl block text-[#19232D] tabular-nums mb-1">
                      <EditableText
                        value={content.stat2Number}
                        onChange={(val) => handleUpdateContent('stat2Number', val)}
                        isEditMode={isEditMode}
                      />
                    </b>
                    <span className="text-xs font-bold text-[#5A6A7E] uppercase tracking-wider block">
                      <EditableText
                        value={content.stat2Label}
                        onChange={(val) => handleUpdateContent('stat2Label', val)}
                        isEditMode={isEditMode}
                      />
                    </span>
                  </div>

                  <div className="p-6 rounded-3xl glass-panel hover:-translate-y-1 transition-transform">
                    <b className="font-vietnam font-black text-4xl block text-[#19232D] tabular-nums mb-1">
                      <EditableText
                        value={content.stat3Number}
                        onChange={(val) => handleUpdateContent('stat3Number', val)}
                        isEditMode={isEditMode}
                      />
                    </b>
                    <span className="text-xs font-bold text-[#5A6A7E] uppercase tracking-wider block">
                      <EditableText
                        value={content.stat3Label}
                        onChange={(val) => handleUpdateContent('stat3Label', val)}
                        isEditMode={isEditMode}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. 02 / QUALIFICATIONS (SKILLS & TOOLS) */}
        <section id="qual" className="py-24 sm:py-32 relative">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#5A6A7E] mb-3 px-3 py-1 rounded-full glass-panel shadow-sm">
              <span>✦</span>
              <EditableText
                value={content.qualEyebrow}
                onChange={(val) => handleUpdateContent('qualEyebrow', val)}
                isEditMode={isEditMode}
              />
            </div>

            <h2 className="font-vietnam font-black text-[clamp(44px,6.5vw,90px)] leading-[1.06] uppercase tracking-tight text-[#19232D] mb-12">
              <EditableText
                value={content.qualTitle}
                onChange={(val) => handleUpdateContent('qualTitle', val)}
                isEditMode={isEditMode}
              />
            </h2>

            {/* Certificate Slot */}
            {(!mediaSlots.certificate?.hidden || isEditMode) && (
              <div className="mb-10 max-w-4xl mx-auto">
                <div className={!mediaSlots.certificate?.hidden ? "rounded-3xl p-2 glass-panel-blue shadow-lg" : ""}>
                  {!mediaSlots.certificate?.hidden && (
                    <div className="p-4 px-6 border-b border-white/60 flex items-center justify-between">
                      <span className="text-xs font-vietnam font-bold tracking-wider uppercase text-[#19232D]">
                        CHỨNG CHỈ &amp; GIẢI THƯỞNG
                      </span>
                      <span className="text-[11px] font-semibold text-[#5A6A7E]">CERTIFIED PROFICIENCY</span>
                    </div>
                  )}
                  <MediaSlot
                    item={mediaSlots.certificate}
                    onUpdate={handleUpdateSlot}
                    onToggleHide={handleToggleHideSlot}
                    isEditMode={isEditMode}
                    minHeight="320px"
                    theme="blue"
                    className="aspect-[16/9]"
                  />
                </div>
              </div>
            )}

            {/* 10 Key Skills & Competencies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {SKILLS_LIST.map((skill, index) => (
                <div
                  key={index}
                  className="p-5 sm:p-6 rounded-3xl glass-panel hover:-translate-y-1 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-vietnam font-black text-xs text-[#19232D] opacity-40 tabular-nums">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FBE8A6] text-[#19232D] shadow-xs">
                          {skill.tag}
                        </span>
                      </div>
                      <span className="text-xs text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity">✦</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-vietnam font-bold text-[#19232D] leading-snug mb-2">
                      {skill.name}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5A6A7E] leading-relaxed">
                    {skill.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. 03 / EXPERIENCE (KINH NGHIỆM & DỰ ÁN NỔI BẬT) */}
        <section id="experience" className="py-24 sm:py-32 relative">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#5A6A7E] mb-3 px-3.5 py-1.5 rounded-full glass-panel shadow-sm">
                  <span>✦</span>
                  <span>03 / EXPERIENCE · KINH NGHIỆM &amp; DỰ ÁN NỔI BẬT</span>
                </div>
                <h2 className="font-vietnam font-black text-[clamp(40px,6vw,84px)] leading-[1.08] uppercase tracking-tight text-[#19232D]">
                  KINH NGHIỆM THỰC CHIẾN
                </h2>
              </div>
              <p className="max-w-md text-sm sm:text-base text-[#5A6A7E] leading-relaxed font-normal">
                Hành trình thực tế với các vị trí VJ, TikTok Video Editor, Scriptwriter và sáng tạo nội dung — trực tiếp sản xuất, lên kịch bản, quay hình và hậu kỳ cho các network và nhãn hàng.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
              {experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="p-6 sm:p-7 rounded-[30px] glass-panel hover:-translate-y-1.5 transition-all flex flex-col justify-between group shadow-md hover:shadow-xl relative overflow-hidden"
                >
                  <div>
                    {/* Header: Company, Tag & Timeline */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-[#FBE8A6] text-[#19232D] shadow-xs">
                        <EditableText
                          value={exp.tag}
                          onChange={(val) => {
                            const updated = [...experiences];
                            updated[idx].tag = val;
                            setExperiences(updated);
                          }}
                          isEditMode={isEditMode}
                        />
                      </span>
                      <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-white/90 text-[#5A6A7E] border border-white/90 shadow-xs">
                        <EditableText
                          value={exp.period}
                          onChange={(val) => {
                            const updated = [...experiences];
                            updated[idx].period = val;
                            setExperiences(updated);
                          }}
                          isEditMode={isEditMode}
                        />
                      </span>
                    </div>

                    <h3 className="font-vietnam font-black text-xl sm:text-2xl text-[#19232D] tracking-tight mb-2">
                      <EditableText
                        value={exp.company}
                        onChange={(val) => {
                          const updated = [...experiences];
                          updated[idx].company = val;
                          setExperiences(updated);
                        }}
                        isEditMode={isEditMode}
                      />
                    </h3>

                    <div className="inline-block text-xs font-bold uppercase tracking-wide text-[#0284C7] bg-[#E0F2FE] px-3 py-1 rounded-xl mb-5">
                      <EditableText
                        value={exp.role}
                        onChange={(val) => {
                          const updated = [...experiences];
                          updated[idx].role = val;
                          setExperiences(updated);
                        }}
                        isEditMode={isEditMode}
                      />
                    </div>

                    {/* Bullet Highlights - CLEAN NO ASTERISKS */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-200/60">
                      {exp.highlights.map((item, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#19232D] leading-relaxed">
                          <span className="text-amber-500 font-bold mt-0.5 shrink-0 text-xs">✦</span>
                          <span className="text-slate-700 flex-1">
                            <EditableText
                              value={item}
                              onChange={(val) => {
                                const updated = [...experiences];
                                updated[idx].highlights[hIdx] = val;
                                setExperiences(updated);
                              }}
                              isEditMode={isEditMode}
                            />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. 04 / MY WORK (SELECTED WORK) */}
        <section id="work" className="py-24 sm:py-32 relative">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#5A6A7E] mb-3 px-3 py-1 rounded-full glass-panel shadow-sm">
                  <span>✦</span>
                  <EditableText
                    value={content.workEyebrow}
                    onChange={(val) => handleUpdateContent('workEyebrow', val)}
                    isEditMode={isEditMode}
                  />
                </div>
                <h2 className="font-vietnam font-black text-[clamp(44px,6.5vw,90px)] leading-[1.06] uppercase tracking-tight text-[#19232D]">
                  <EditableText
                    value={content.workTitle}
                    onChange={(val) => handleUpdateContent('workTitle', val)}
                    isEditMode={isEditMode}
                  />
                </h2>
              </div>
              <div className="max-w-md text-sm sm:text-base text-[#5A6A7E] leading-relaxed font-normal">
                <EditableText
                  value={content.workIntro}
                  onChange={(val) => handleUpdateContent('workIntro', val)}
                  isEditMode={isEditMode}
                  multiline={true}
                  rows={2}
                />
              </div>
            </div>

            {/* Category Filter Bar */}
            <div className="flex items-center gap-2 p-1.5 glass-panel rounded-full mb-12 overflow-x-auto w-fit max-w-full shadow-sm">
              {['All', 'Branding', 'Social Media', 'SEO & Copy', 'Campaign'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 sm:px-5 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#FBE8A6] text-[#19232D] shadow-sm font-black'
                      : 'text-[#5A6A7E] hover:text-[#19232D]'
                  }`}
                >
                  {cat === 'All' ? 'Tất cả tác phẩm' : cat}
                </button>
              ))}
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {filteredProjects.map((project, idx) => (
                <article
                  key={project.id}
                  className="rounded-3xl glass-panel p-2 overflow-hidden shadow-lg hover:-translate-y-1.5 transition-transform flex flex-col group"
                >
                  {/* Media Slot container */}
                  {(!mediaSlots[project.mediaSlotId]?.hidden || isEditMode) && (
                    <MediaSlot
                      item={mediaSlots[project.mediaSlotId]}
                      onUpdate={handleUpdateSlot}
                      onToggleHide={handleToggleHideSlot}
                      isEditMode={isEditMode}
                      minHeight="280px"
                      theme="yellow"
                      className="aspect-[16/10]"
                    />
                  )}

                  {/* Info */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <h3 className="font-vietnam font-black text-xl sm:text-2xl uppercase tracking-wide text-[#19232D]">
                          <EditableText
                            value={project.title}
                            onChange={(val) => {
                              const updated = [...projects];
                              updated[idx].title = val;
                              setProjects(updated);
                            }}
                            isEditMode={isEditMode}
                          />
                        </h3>
                        <button
                          type="button"
                          onClick={() => setSelectedProject(project)}
                          className="p-2 rounded-full glass-panel hover:bg-[#FBE8A6] transition-colors cursor-pointer shadow-sm"
                          title="Xem chi tiết"
                        >
                          <ExternalLink size={15} />
                        </button>
                      </div>
                      <div className="text-xs sm:text-sm text-[#5A6A7E] leading-relaxed mb-4">
                        <EditableText
                          value={project.description}
                          onChange={(val) => {
                            const updated = [...projects];
                            updated[idx].description = val;
                            setProjects(updated);
                          }}
                          isEditMode={isEditMode}
                          multiline={true}
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                      <div className="flex items-center gap-2 text-xs text-[#19232D] font-bold">
                        {project.tags.map((tag, tIdx) => (
                          <React.Fragment key={tIdx}>
                            <span>{tag}</span>
                            {tIdx < project.tags.length - 1 && (
                              <span aria-hidden="true" className="text-slate-300">·</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedProject(project)}
                        className="text-xs font-bold uppercase text-[#19232D] hover:text-[#82BFE7] underline underline-offset-4 cursor-pointer"
                      >
                        Khám phá →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 7. FULL-WIDTH VISUAL BREAK (Can be hidden if user wishes) */}
        {!mediaSlots.visualBreak?.hidden && (
          <section className="py-16 sm:py-20 relative">
            <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="text-xs font-bold tracking-widest uppercase text-[#5A6A7E]">
                  FULL-WIDTH VISUAL BANNER
                </span>
                <span className="text-xs font-medium text-[#5A6A7E]">
                  COLLAGE · HERO BANNER · KEY VISUAL CAMPAIGN
                </span>
              </div>

              <div className="rounded-3xl p-2 glass-panel-yellow shadow-xl">
                <MediaSlot
                  item={mediaSlots.visualBreak}
                  onUpdate={handleUpdateSlot}
                  onToggleHide={handleToggleHideSlot}
                  isEditMode={isEditMode}
                  minHeight="500px"
                  theme="yellow"
                  className="aspect-[16/9] lg:aspect-[21/9]"
                />
              </div>
            </div>
          </section>
        )}

        {/* 8. 04 / CASE STUDIES */}
        <section id="case-study" className="py-24 sm:py-32 relative">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#5A6A7E] mb-3 px-3 py-1 rounded-full glass-panel shadow-sm">
              <span>✦</span>
              <span>04 / CASE STUDIES · BÀI HỌC CHIẾN DỊCH</span>
            </div>

            <h2 className="font-vietnam font-black text-[clamp(44px,6.5vw,90px)] leading-[1.06] uppercase tracking-tight text-[#19232D] mb-14">
              CASE STUDIES
            </h2>

            <div className="space-y-12">
              {caseStudies.map((study, sIdx) => (
                <article
                  key={study.number}
                  className="p-8 sm:p-10 rounded-3xl glass-panel grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] gap-8 lg:gap-14 items-start shadow-lg"
                >
                  {/* Left Column: Number, hook, subheadings */}
                  <div>
                    <span className="font-vietnam font-black text-6xl sm:text-7xl leading-none text-[#19232D] block mb-3 tabular-nums opacity-90">
                      {study.number}
                    </span>
                    <span className="text-xs font-bold tracking-widest uppercase text-[#5A6A7E] block mb-2">
                      {study.tag}
                    </span>
                    <h3 className="font-vietnam font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#19232D] leading-tight mb-4">
                      <EditableText
                        value={study.hook}
                        onChange={(val) => {
                          const updated = [...caseStudies];
                          updated[sIdx].hook = val;
                          setCaseStudies(updated);
                        }}
                        isEditMode={isEditMode}
                      />
                    </h3>
                  </div>

                  {/* Right Column: Copy & visual */}
                  <div>
                    <h4 className="font-vietnam font-bold text-lg sm:text-xl uppercase tracking-wide text-[#19232D] mb-3">
                      <EditableText
                        value={study.title}
                        onChange={(val) => {
                          const updated = [...caseStudies];
                          updated[sIdx].title = val;
                          setCaseStudies(updated);
                        }}
                        isEditMode={isEditMode}
                      />
                    </h4>
                    <div className="text-sm sm:text-base text-[#5A6A7E] leading-relaxed mb-6">
                      <EditableText
                        value={study.description}
                        onChange={(val) => {
                          const updated = [...caseStudies];
                          updated[sIdx].description = val;
                          setCaseStudies(updated);
                        }}
                        isEditMode={isEditMode}
                        multiline={true}
                        rows={3}
                      />
                    </div>

                    {/* Highlights */}
                    <div className="space-y-2.5 mb-7">
                      {study.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#19232D] font-medium">
                          <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* Dedicated visual slot */}
                    {(!mediaSlots[study.mediaSlotId]?.hidden || isEditMode) && (
                      <div className={!mediaSlots[study.mediaSlotId]?.hidden ? "rounded-2xl p-1.5 glass-panel-blue" : ""}>
                        <MediaSlot
                          item={mediaSlots[study.mediaSlotId]}
                          onUpdate={handleUpdateSlot}
                          onToggleHide={handleToggleHideSlot}
                          isEditMode={isEditMode}
                          minHeight="320px"
                          theme="blue"
                          className="aspect-[16/10]"
                        />
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 9. 05 / VIDEOGRAPHY (GLOSSY DARK GLASS) */}
        <section id="video" className="py-24 sm:py-32 relative">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
            <div className="glass-panel-dark p-8 sm:p-14">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-slate-300 mb-3 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                <span>✦</span>
                <span>05 / VIDEOGRAPHY · TÁC PHẨM VIDEO</span>
              </div>

              <h2 className="font-vietnam font-black text-[clamp(44px,6.5vw,90px)] leading-[1.06] uppercase tracking-tight text-white mb-6">
                VIDEO WORK
              </h2>

              <p className="max-w-xl text-sm sm:text-base text-slate-300 leading-relaxed mb-12 font-normal">
                Các khu vực video được thiết kế dạng khung bóng nổi trong suốt, tối ưu hoàn hảo cho cả clip ngang thương mại và video định dạng dọc chuẩn TikTok / Reels.
              </p>

              {/* Video Stack */}
              <div className="space-y-12">
                {VIDEO_SHOWCASE.filter((v) => !mediaSlots[v.mediaSlotId]?.hidden || isEditMode).map((v) => {
                  const currentSlot = mediaSlots[v.mediaSlotId];
                  const isVerticalShowcase =
                    currentSlot?.aspectRatio === '9/16' ||
                    currentSlot?.videoType === 'tiktok' ||
                    currentSlot?.url?.includes('shorts') ||
                    currentSlot?.url?.includes('tiktok') ||
                    (!currentSlot?.url && v.aspectRatio === '9/16');

                  return (
                    <div
                      key={v.id}
                      className={`rounded-3xl glass-panel p-2 bg-white/10 border border-white/20 overflow-hidden shadow-2xl transition-all duration-300 ${
                        isVerticalShowcase ? 'max-w-md mx-auto w-full' : 'w-full'
                      }`}
                    >
                      <MediaSlot
                        item={currentSlot}
                        onUpdate={handleUpdateSlot}
                        onToggleHide={handleToggleHideSlot}
                        isEditMode={isEditMode}
                        minHeight={isVerticalShowcase ? '540px' : '450px'}
                        dark={true}
                        className={isVerticalShowcase ? 'max-w-md mx-auto aspect-[9/16]' : 'aspect-video'}
                      />
                      <div className="p-4 px-6 bg-white/95 text-[#19232D] rounded-2xl mt-2 flex flex-wrap items-center justify-between gap-3 font-bold text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-vietnam font-black text-base uppercase text-[#19232D]">{v.label}</span>
                          <span className="text-slate-400">/</span>
                          <span className="text-xs uppercase text-[#5A6A7E]">{v.category}</span>
                        </div>
                        <span className="font-vietnam font-black text-lg tabular-nums text-[#19232D]">{v.number}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 10. 06 / PROCESS (HOW I WORK) */}
        <section id="process" className="py-24 sm:py-32 relative">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#5A6A7E] mb-3 px-3 py-1 rounded-full glass-panel shadow-sm">
              <span>✦</span>
              <span>06 / WORK PROCESS · QUY TRÌNH 4 BƯỚC</span>
            </div>

            <h2 className="font-vietnam font-black text-[clamp(44px,6.5vw,90px)] leading-[1.06] uppercase tracking-tight text-[#19232D] mb-12">
              HOW I WORK
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PROCESS_STEPS.map((step) => (
                <div
                  key={step.number}
                  className="p-7 rounded-3xl glass-panel-yellow hover:-translate-y-1 transition-transform flex flex-col justify-between shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="font-vietnam font-black text-5xl text-[#19232D] tabular-nums">
                        {step.number}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/80 text-[#19232D] shadow-sm">
                        {step.tag}
                      </span>
                    </div>
                    <h3 className="font-vietnam font-bold text-xl uppercase tracking-wide text-[#19232D] mb-2.5">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A6A7E] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 11. 07 / TESTIMONIAL */}
        <section className="py-24 sm:py-32 relative">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
            <div className="p-10 sm:p-16 rounded-3xl glass-panel text-center max-w-4xl mx-auto shadow-xl">
              <blockquote className="font-playfair italic font-medium text-[clamp(24px,3.8vw,42px)] leading-relaxed text-[#19232D] mb-6">
                <EditableText
                  value={content.testimonialQuote}
                  onChange={(val) => handleUpdateContent('testimonialQuote', val)}
                  isEditMode={isEditMode}
                  multiline={true}
                  rows={2}
                  className="font-playfair italic"
                />
              </blockquote>
              <div className="font-vietnam font-bold text-sm uppercase tracking-wider text-[#5A6A7E]">
                <EditableText
                  value={content.testimonialAuthor}
                  onChange={(val) => handleUpdateContent('testimonialAuthor', val)}
                  isEditMode={isEditMode}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 12. 08 / CONTACT */}
        <section id="contact" className="py-24 sm:py-32 relative">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-18 items-end">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#5A6A7E] mb-3 px-3 py-1 rounded-full glass-panel shadow-sm">
                  <span>✦</span>
                  <EditableText
                    value={content.contactEyebrow}
                    onChange={(val) => handleUpdateContent('contactEyebrow', val)}
                    isEditMode={isEditMode}
                  />
                </div>

                <h2 className="font-vietnam font-black text-[clamp(56px,8.5vw,115px)] leading-[1.02] uppercase tracking-tight text-[#19232D] mb-6">
                  <EditableText
                    value={content.contactTitle}
                    onChange={(val) => handleUpdateContent('contactTitle', val)}
                    isEditMode={isEditMode}
                  />
                </h2>

                <div className="max-w-lg text-base sm:text-lg text-[#19232D] leading-relaxed mb-8">
                  <EditableText
                    value={content.contactDescription}
                    onChange={(val) => handleUpdateContent('contactDescription', val)}
                    isEditMode={isEditMode}
                    multiline={true}
                    rows={3}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsContactOpen(true)}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-[#FBE8A6] to-[#C5E4F8] hover:opacity-95 text-xs font-bold uppercase tracking-wider text-[#19232D] shadow-lg border border-white cursor-pointer hover:-translate-y-1 transition-transform"
                >
                  <span>Gửi tin nhắn trực tiếp</span>
                  <ArrowUpRight size={15} />
                </button>
              </div>

              {/* Direct Social / Personal Links Editor */}
              <div className="w-full">
                <div className="mb-2 text-xs font-bold text-[#5A6A7E] uppercase tracking-wider flex items-center justify-between">
                  <span>Mạng xã hội &amp; Trang cá nhân</span>
                  {isEditMode && (
                    <span className="text-[11px] text-amber-700 bg-[#FBE8A6] px-2 py-0.5 rounded-full font-bold">
                      Đang bật sửa link
                    </span>
                  )}
                </div>
                <SocialLinksEditor
                  links={content.socialLinks || []}
                  onChange={handleUpdateSocialLinks}
                  isEditMode={isEditMode}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 13. FOOTER */}
      <footer className="py-8 glass-panel border-x-0 border-b-0 rounded-none text-center">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider text-[#19232D]">
          <span>
            <EditableText
              value={content.footerCopy}
              onChange={(val) => handleUpdateContent('footerCopy', val)}
              isEditMode={isEditMode}
            />
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span>MADE WITH PASSION &amp; IDEAS</span>
            <Sparkles size={14} className="text-amber-500" />
          </span>
        </div>
      </footer>

      {/* Floating Toolbar with Edit Mode Toggle & Hidden Slot Restore */}
      <Toolbar
        filledCount={filledCount}
        totalSlots={totalSlots}
        hiddenCount={hiddenCount}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onRestoreAllHidden={handleRestoreAllHidden}
        onLoadAllDemo={handleLoadAllDemo}
        onResetAll={handleResetAll}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        mediaSlots={mediaSlots}
        content={content}
        projects={projects}
        caseStudies={caseStudies}
        experiences={experiences}
      />

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        mediaItem={selectedProject ? mediaSlots[selectedProject.mediaSlotId] : undefined}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
