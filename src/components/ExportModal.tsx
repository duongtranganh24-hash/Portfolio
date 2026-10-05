import React, { useState, useEffect, useMemo } from 'react';
import { X, Copy, Download, Check, FileCode, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { MediaItem, PortfolioContent, ProjectItem, CaseStudyItem, ExperienceItem } from '../types';
import { SKILLS_LIST, EXPERIENCE_LIST } from '../data/defaultData';
import { parseVideoUrl, getMediaBlob, blobToBase64 } from '../utils/mediaStorage';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaSlots: Record<string, MediaItem>;
  content: PortfolioContent;
  projects: ProjectItem[];
  caseStudies: CaseStudyItem[];
  experiences: ExperienceItem[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  mediaSlots,
  content,
  projects,
  caseStudies,
  experiences,
}) => {
  const [copied, setCopied] = useState(false);
  const [resolvedSlots, setResolvedSlots] = useState<Record<string, MediaItem>>(mediaSlots);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    async function convertBlobsToBase64() {
      const entries = Object.entries(mediaSlots);
      const blobEntries = entries.filter(([, item]) => item?.url?.startsWith('blob:'));

      if (blobEntries.length === 0) {
        setResolvedSlots(mediaSlots);
        setIsConverting(false);
        return;
      }

      setIsConverting(true);
      setConversionProgress({ current: 0, total: blobEntries.length });

      const updated: Record<string, MediaItem> = { ...mediaSlots };
      let count = 0;

      for (const [key, item] of entries) {
        if (isCancelled) return;
        if (item?.url && item.url.startsWith('blob:')) {
          try {
            let blob = await getMediaBlob(key);
            if (!blob) {
              const res = await fetch(item.url);
              blob = await res.blob();
            }
            if (blob) {
              const base64 = await blobToBase64(blob);
              updated[key] = {
                ...item,
                url: base64,
              };
            }
          } catch (err) {
            console.warn('Could not convert blob to base64 for slot', key, err);
          }
          count++;
          setConversionProgress({ current: count, total: blobEntries.length });
        }
      }

      if (!isCancelled) {
        setResolvedSlots(updated);
        setIsConverting(false);
      }
    }

    convertBlobsToBase64();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, mediaSlots]);

  // Generate locked, read-only standalone HTML
  const generateStandaloneHtml = (isPreview = false): string => {
    const renderMedia = (slotId: string, fallbackTitle: string, fallbackSub: string, icon = '✦') => {
      const slot = resolvedSlots[slotId] || mediaSlots[slotId];
      // If hidden by user, return empty string so it doesn't render in the layout!
      if (slot?.hidden) {
        return '';
      }
      if (slot?.url) {
        // If generating preview for the on-screen code box, abbreviate huge data: URLs
        // so React Virtual DOM diffing never encounters RangeError: Invalid string length!
        const effectiveUrl =
          isPreview && slot.url.startsWith('data:')
            ? (slot.type === 'video'
                ? 'data:video/mp4;base64,... [DỮ LIỆU VIDEO ĐÃ ĐƯỢC NHÚNG]'
                : 'data:image/...;base64,... [DỮ LIỆU ẢNH ĐÃ ĐƯỢC NHÚNG]')
            : slot.url;

        if (slot.type === 'video') {
          const parsed = parseVideoUrl(slot.url);
          const isVert =
            slot.aspectRatio === '9/16' ||
            slot.videoType === 'tiktok' ||
            parsed.videoType === 'tiktok' ||
            slot.url.includes('shorts') ||
            slot.url.includes('tiktok');

          if (
            slot.videoType === 'youtube' ||
            parsed.videoType === 'youtube' ||
            slot.videoType === 'gdrive' ||
            parsed.videoType === 'gdrive' ||
            slot.videoType === 'tiktok' ||
            parsed.videoType === 'tiktok'
          ) {
            if (isVert) {
              return `<div style="max-width:380px;width:100%;margin:0 auto;aspect-ratio:9/16;min-height:560px;border-radius:24px;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,0.18);">
                <iframe src="${parsed.embedUrl}" title="${slot.title}" style="width:100%;height:100%;min-height:560px;border:none;border-radius:24px;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </div>`;
            }
            return `<div style="width:100%;aspect-ratio:16/9;min-height:420px;border-radius:24px;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,0.18);">
              <iframe src="${parsed.embedUrl}" title="${slot.title}" style="width:100%;height:100%;min-height:420px;border:none;border-radius:24px;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>`;
          }

          if (isVert) {
            return `<div style="max-width:400px;width:100%;margin:0 auto;aspect-ratio:9/16;border-radius:24px;overflow:hidden;background:#000;box-shadow:0 16px 40px rgba(0,0,0,0.25);">
              <video controls playsinline preload="metadata" style="width:100%;height:100%;aspect-ratio:9/16;object-fit:contain;background:#000;border-radius:24px;display:block;">
                <source src="${effectiveUrl}" type="video/mp4">
                <source src="${effectiveUrl}" type="video/webm">
                <source src="${effectiveUrl}" type="video/quicktime">
                Trình duyệt không hỗ trợ thẻ video này.
              </video>
            </div>`;
          }

          return `<div style="width:100%;aspect-ratio:16/9;max-height:85vh;border-radius:24px;overflow:hidden;background:#000;box-shadow:0 16px 40px rgba(0,0,0,0.25);">
            <video controls playsinline preload="metadata" style="width:100%;height:100%;aspect-ratio:16/9;object-fit:contain;background:#000;border-radius:24px;display:block;">
              <source src="${effectiveUrl}" type="video/mp4">
              <source src="${effectiveUrl}" type="video/webm">
              <source src="${effectiveUrl}" type="video/quicktime">
              Trình duyệt không hỗ trợ thẻ video này.
            </video>
          </div>`;
        }
        return `<img src="${effectiveUrl}" alt="${slot.title}" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:24px;">`;
      }
      return `<div class="placeholder"><div class="icon">${icon}</div><strong>${fallbackTitle}</strong><small>${fallbackSub}</small></div>`;
    };

    return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${content.brandName} — Social Media Creative Portfolio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
<style>
:root{
  --ink:#19232D;
  --ink-soft:#5A6A7E;
  --blue:#C5E4F8;
  --blue-2:#E8F4FC;
  --yellow:#FBE8A6;
  --yellow-2:#FDF6DE;
  --cream:#FAF7F0;
  --white:#ffffff;
  --radius:28px;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  margin:0;
  background:linear-gradient(135deg, #EBF5FE 0%, #FFFDF7 50%, #E3F2FD 100%);
  background-attachment:fixed;
  color:var(--ink);
  font-family:"Be Vietnam Pro",sans-serif;
  overflow-x:hidden;
}
a{color:inherit;text-decoration:none}
img,video{max-width:100%;display:block}
.container{width:min(1240px,calc(100% - 44px));margin:auto}

/* GLOSSY GLASS PANELS */
.glass-panel{
  background:rgba(255,255,255,0.78);
  backdrop-filter:blur(24px) saturate(180%);
  -webkit-backdrop-filter:blur(24px) saturate(180%);
  border:1.5px solid rgba(255,255,255,0.95);
  box-shadow:0 18px 45px -12px rgba(120,175,220,0.18),0 0 0 1px rgba(255,255,255,0.7) inset;
  border-radius:var(--radius);
}
.glass-panel-yellow{
  background:rgba(253,246,222,0.8);
  backdrop-filter:blur(24px);
  -webkit-backdrop-filter:blur(24px);
  border:1.5px solid rgba(255,255,255,0.95);
  box-shadow:0 18px 45px -12px rgba(251,232,166,0.32);
  border-radius:var(--radius);
}
.glass-panel-blue{
  background:rgba(232,244,252,0.8);
  backdrop-filter:blur(24px);
  -webkit-backdrop-filter:blur(24px);
  border:1.5px solid rgba(255,255,255,0.95);
  box-shadow:0 18px 45px -12px rgba(197,228,248,0.35);
  border-radius:var(--radius);
}
.glass-panel-dark{
  background:rgba(25,35,45,0.92);
  backdrop-filter:blur(24px);
  -webkit-backdrop-filter:blur(24px);
  border:1.5px solid rgba(255,255,255,0.2);
  box-shadow:0 24px 50px -12px rgba(0,0,0,0.45);
  border-radius:32px;
  color:#ffffff;
}

/* NAV */
.nav{
  position:sticky;top:0;z-index:100;
  background:rgba(250,247,240,.85);
  backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(255,255,255,0.8);
}
.nav-inner{
  min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:25px;
}
.logo{font-weight:900;letter-spacing:.06em;font-size:18px}
.logo span{background:var(--yellow);padding:6px 12px;border-radius:999px;border:1px solid rgba(255,255,255,0.9);box-shadow:0 4px 12px rgba(0,0,0,0.05)}
.nav-links{display:flex;gap:32px;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.08em}
.nav-links a{position:relative}
.nav-links a:hover{color:#82BFE7}
.menu{display:none;border:none;background:var(--yellow);border-radius:999px;padding:9px 16px;font-weight:800}

/* COMMON */
section{padding:100px 0;position:relative}
.eyebrow{
  display:inline-block;font-size:11px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;
  padding:5px 14px;border-radius:999px;background:rgba(255,255,255,0.7);
  border:1px solid rgba(255,255,255,0.9);margin-bottom:16px;color:var(--ink-soft);
}
.section-title{
  font-weight:900;text-transform:uppercase;
  font-size:clamp(46px,7vw,92px);line-height:1.06;letter-spacing:-.02em;
  margin:0 0 20px;color:var(--ink);
}
.intro{max-width:650px;line-height:1.75;color:var(--ink-soft);font-size:16px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:32px}

/* HERO */
.hero{min-height:calc(100vh - 76px);padding:80px 0 100px;display:flex;align-items:center;position:relative;overflow:hidden}
.hero-grid{display:grid;grid-template-columns:1.1fr .9fr;align-items:center;gap:45px;position:relative;z-index:1}
.hero-title{
  margin:20px 0 24px;font-weight:900;
  font-size:clamp(56px,9vw,120px);line-height:1.04;letter-spacing:-.025em;text-transform:uppercase;
}
.hero-title .script{
  font-family:"Playfair Display",serif;font-style:italic;text-transform:none;
  font-size:.38em;display:block;line-height:1;margin-bottom:8px;
}
.hero-title .stroke{
  color:transparent;-webkit-text-stroke:2px var(--ink);
}
.hero-copy{max-width:570px;font-size:17px;line-height:1.75;color:var(--ink-soft)}
.hero-actions{display:flex;gap:14px;margin-top:32px;flex-wrap:wrap}
.btn{
  border:1.5px solid rgba(255,255,255,0.9);padding:14px 28px;border-radius:999px;
  font-weight:800;font-size:13px;background:var(--white);transition:.25s;
  box-shadow:0 8px 24px rgba(100,140,180,0.14);
}
.btn:hover{transform:translateY(-3px);box-shadow:0 12px 30px rgba(100,140,180,0.22)}
.btn.primary{background:linear-gradient(135deg, var(--yellow), #FDE68A)}
.hero-media{
  min-height:540px;border-radius:32px;background:rgba(255,255,255,0.6);
  border:2px solid rgba(255,255,255,0.9);box-shadow:0 20px 50px -15px rgba(120,175,220,0.25);
  display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;
}

/* MARQUEE */
.marquee{overflow:hidden;background:rgba(251,232,166,0.85);backdrop-filter:blur(10px);padding:14px 0}
.marquee-track{display:flex;width:max-content;animation:marquee 28s linear infinite}
.marquee span{font-weight:900;font-size:20px;letter-spacing:.06em;padding:0 25px;white-space:nowrap}
@keyframes marquee{to{transform:translateX(-50%)}}

/* PLACEHOLDER */
.placeholder{
  width:100%;height:100%;min-height:inherit;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center;padding:35px;color:var(--ink-soft);
  background:linear-gradient(145deg,rgba(253,246,222,0.8),rgba(232,244,252,0.8));border-radius:inherit;
}
.placeholder .icon{font-size:36px;margin-bottom:12px;background:#fff;border-radius:20px;padding:8px 16px;box-shadow:0 6px 16px rgba(0,0,0,0.06)}
.placeholder strong{color:var(--ink);font-size:16px;font-weight:800}
.placeholder small{max-width:320px;line-height:1.6;margin-top:8px}

/* STATS */
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:32px}
.stat{padding:24px;border-radius:22px;background:rgba(255,255,255,0.7);box-shadow:0 10px 25px rgba(0,0,0,0.04);border:1px solid rgba(255,255,255,0.9)}
.stat b{display:block;font-size:42px;font-weight:900;line-height:1;margin-bottom:6px}
.stat span{font-size:12px;font-weight:700;color:var(--ink-soft);text-transform:uppercase}

/* WORK */
.work-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:32px;margin-top:40px}
.work-card{overflow:hidden;border-radius:28px;transition:.3s}
.work-card:hover{transform:translateY(-5px)}
.work-info{padding:24px 28px}
.work-info h3{margin:0 0 8px;font-size:22px;font-weight:900}
.work-info p{margin:0;color:var(--ink-soft);line-height:1.6;font-size:14px}

/* VIDEO STACK */
.video-stack{display:grid;gap:36px;margin-top:45px}
.video-card{border-radius:30px;overflow:hidden}
.video-label{padding:18px 24px;background:#ffffff;color:var(--ink);font-weight:800;display:flex;justify-content:space-between}

/* PROCESS */
.process-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:45px}
.process-step{padding:28px;border-radius:24px;background:rgba(255,255,255,0.75);box-shadow:0 8px 20px rgba(0,0,0,0.04);border:1px solid rgba(255,255,255,0.9)}
.process-step b{font-size:48px;font-weight:900;line-height:1}
.process-step h3{margin:12px 0 8px;font-size:20px;font-weight:900}
.process-step p{font-size:13px;line-height:1.6;color:var(--ink-soft);margin:0}

/* CONTACT */
.contact-links{display:grid;gap:12px}
.contact-link{
  padding:18px 24px;background:rgba(255,255,255,0.85);border-radius:20px;
  font-weight:800;display:flex;justify-content:space-between;box-shadow:0 8px 20px rgba(0,0,0,0.04);
}
footer{padding:30px 0;background:rgba(251,232,166,0.6);text-align:center;font-weight:800;font-size:13px}

/* ANIMATED DRIFTING CLOUDS & SPARKLES */
@keyframes cloudDriftRight {
  0% { transform: translateX(-120%) translateY(0px) scale(0.95); }
  50% { transform: translateX(10%) translateY(-18px) scale(1.05); }
  100% { transform: translateX(140%) translateY(0px) scale(0.95); }
}
@keyframes cloudDriftLeft {
  0% { transform: translateX(130%) translateY(0px) scale(1.02); }
  50% { transform: translateX(-10%) translateY(16px) scale(0.96); }
  100% { transform: translateX(-130%) translateY(0px) scale(1.02); }
}
@keyframes cloudBob {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-14px); }
}
@keyframes sparkleTwinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.25); filter: drop-shadow(0 0 10px rgba(251,232,166,0.9)); }
}
.cloud-drift-1 { position:fixed; top:8%; left:0; width:100%; pointer-events:none; z-index:-1; animation:cloudDriftRight 42s linear infinite; }
.cloud-drift-2 { position:fixed; top:42%; right:0; width:100%; pointer-events:none; z-index:-1; animation:cloudDriftLeft 50s linear infinite; }
.cloud-drift-3 { position:fixed; top:75%; left:0; width:100%; pointer-events:none; z-index:-1; animation:cloudDriftRight 65s linear infinite; }
.cloud-body { position:relative; animation:cloudBob 8s ease-in-out infinite; }
.sparkle-star { position:fixed; pointer-events:none; z-index:-1; animation:sparkleTwinkle 3.5s ease-in-out infinite; }

@media(max-width:900px){
  .hero-grid,.grid-2,.work-grid,.process-grid{grid-template-columns:1fr}
  .stats{grid-template-columns:1fr}
  .nav-links{display:none}
  .menu{display:block}
}
</style>
</head>
<body>

<!-- Lively Drifting Clouds Background -->
<div aria-hidden="true" style="position:fixed;inset:0;pointer-events:none;z-index:-2;overflow:hidden;">
  <!-- Glowing Sky Gradients -->
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 80% at 50% -20%,rgba(254,243,199,0.7),rgba(255,255,255,0));"></div>
  <div style="position:absolute;top:-80px;left:20%;width:650px;height:650px;border-radius:50%;background:rgba(254,240,138,0.4);filter:blur(130px);"></div>
  <div style="position:absolute;top:35%;right:-60px;width:680px;height:680px;border-radius:50%;background:rgba(186,230,253,0.4);filter:blur(140px);"></div>
  <div style="position:absolute;bottom:-100px;left:15%;width:620px;height:620px;border-radius:50%;background:rgba(253,230,138,0.35);filter:blur(130px);"></div>

  <!-- Drifting Cloud 1 -->
  <div class="cloud-drift-1">
    <div class="cloud-body" style="width:360px;height:110px;filter:drop-shadow(0 14px 28px rgba(160,205,245,0.25));">
      <div style="position:absolute;bottom:0;left:0;width:330px;height:70px;border-radius:999px;background:#ffffff;"></div>
      <div style="position:absolute;bottom:15px;left:40px;width:110px;height:110px;border-radius:50%;background:#ffffff;"></div>
      <div style="position:absolute;bottom:25px;left:130px;width:130px;height:130px;border-radius:50%;background:linear-gradient(to bottom, #ffffff, #FEFCE8);"></div>
      <div style="position:absolute;bottom:10px;left:230px;width:95px;height:95px;border-radius:50%;background:#ffffff;"></div>
    </div>
  </div>

  <!-- Drifting Cloud 2 -->
  <div class="cloud-drift-2">
    <div class="cloud-body" style="width:420px;height:125px;filter:drop-shadow(0 16px 32px rgba(253,230,138,0.25));animation-delay:2.5s;">
      <div style="position:absolute;bottom:0;left:0;width:390px;height:75px;border-radius:999px;background:#ffffff;"></div>
      <div style="position:absolute;bottom:20px;left:50px;width:125px;height:125px;border-radius:50%;background:#ffffff;"></div>
      <div style="position:absolute;bottom:30px;left:160px;width:145px;height:145px;border-radius:50%;background:linear-gradient(to bottom, #ffffff, #FEF9C3);"></div>
      <div style="position:absolute;bottom:15px;left:280px;width:105px;height:105px;border-radius:50%;background:#ffffff;"></div>
    </div>
  </div>

  <!-- Drifting Cloud 3 -->
  <div class="cloud-drift-3">
    <div class="cloud-body" style="width:470px;height:135px;filter:drop-shadow(0 18px 36px rgba(186,230,253,0.25));animation-delay:5s;">
      <div style="position:absolute;bottom:0;left:0;width:440px;height:80px;border-radius:999px;background:#ffffff;"></div>
      <div style="position:absolute;bottom:20px;left:60px;width:135px;height:135px;border-radius:50%;background:#ffffff;"></div>
      <div style="position:absolute;bottom:35px;left:180px;width:160px;height:160px;border-radius:50%;background:#ffffff;"></div>
      <div style="position:absolute;bottom:15px;left:320px;width:115px;height:115px;border-radius:50%;background:#ffffff;"></div>
    </div>
  </div>

  <!-- Twinkling Sparkles -->
  <div class="sparkle-star" style="top:12%;right:15%;color:#f59e0b;font-size:26px;">✦</div>
  <div class="sparkle-star" style="top:25%;left:18%;color:#38bdf8;font-size:22px;animation-delay:1.2s;">✧</div>
  <div class="sparkle-star" style="top:45%;right:22%;color:#fbbf24;font-size:28px;animation-delay:2.4s;">✦</div>
  <div class="sparkle-star" style="top:65%;left:12%;color:#0284c7;font-size:24px;animation-delay:0.8s;">★</div>
  <div class="sparkle-star" style="top:80%;right:18%;color:#f59e0b;font-size:26px;animation-delay:3.2s;">✦</div>
</div>

<header class="nav">
  <div class="container nav-inner">
    <a class="logo" href="#home"><span>${content.brandName.split(' ')[0] || 'MY'}</span> ${content.brandName.split(' ').slice(1).join(' ') || 'PORTFOLIO'}</a>
    <nav class="nav-links">
      <a href="#about">About</a>
      <a href="#work">My Work</a>
      <a href="#case-study">Case Study</a>
      <a href="#video">Videography</a>
      <a href="#contact">Contact</a>
    </nav>
    <button class="menu" onclick="document.querySelector('.nav-links').style.display='flex'">MENU</button>
  </div>
</header>

<main id="home">

<section class="hero">
  <div class="container hero-grid">
    <div>
      <span class="eyebrow">${content.heroKicker}</span>
      <h1 class="hero-title">
        <span class="script">${content.heroScript}</span>
        ${content.heroTitleMain}<br>
        <span class="stroke">${content.heroTitleOutline}</span>
      </h1>
      <p class="hero-copy">${content.heroDescription}</p>
      <div class="hero-actions">
        <a class="btn primary" href="#work">XEM TÁC PHẨM ↓</a>
        <a class="btn" href="#contact">LIÊN HỆ →</a>
      </div>
    </div>

    ${mediaSlots.hero?.hidden ? '' : `
    <div class="hero-media glass-panel">
      ${renderMedia('hero', 'HÌNH ẢNH HERO', 'Để trống khu vực này để đưa ảnh chân dung / concept vào.')}
    </div>`}
  </div>
</section>

<div class="marquee">
  <div class="marquee-track">
    <span>STORYTELLING ✦ SOCIAL MEDIA ✦ CONTENT CREATION ✦ BRANDING ✦ SHORT-FORM VIDEO ✦ VIRAL HOOKS ✦</span>
    <span>STORYTELLING ✦ SOCIAL MEDIA ✦ CONTENT CREATION ✦ BRANDING ✦ SHORT-FORM VIDEO ✦ VIRAL HOOKS ✦</span>
  </div>
</div>

<section id="about">
  <div class="container grid-2">
    ${mediaSlots.about?.hidden ? '' : `
    <div class="glass-panel" style="min-height:500px;overflow:hidden;">
      ${renderMedia('about', 'ẢNH CÁ NHÂN', 'Ảnh portrait / lifestyle của bạn.')}
    </div>`}
    <div>
      <div class="eyebrow">${content.aboutEyebrow}</div>
      <h2 class="section-title">${content.aboutTitle}<br><span style="color:transparent;-webkit-text-stroke:2px var(--ink)">${content.aboutTitleStroke}</span></h2>
      <p class="intro" style="font-size:17px;">${content.aboutText}</p>
      <div class="stats">
        <div class="stat"><b>${content.stat1Number}</b><span>${content.stat1Label}</span></div>
        <div class="stat"><b>${content.stat2Number}</b><span>${content.stat2Label}</span></div>
        <div class="stat"><b>${content.stat3Number}</b><span>${content.stat3Label}</span></div>
      </div>
    </div>
  </div>
</section>

<section id="qual">
  <div class="container">
    <div class="eyebrow">${content.qualEyebrow}</div>
    <h2 class="section-title">${content.qualTitle}</h2>
    ${mediaSlots.certificate?.hidden ? '' : `
    <div class="glass-panel" style="min-height:340px;overflow:hidden;margin:30px 0 40px;">
      ${renderMedia('certificate', 'CHỨNG CHỈ / BẰNG CẤP', 'Ảnh certificate, bằng khen hoặc giải thưởng.')}
    </div>`}
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:16px;margin-top:28px;">
      ${SKILLS_LIST.map((s, idx) => `
      <div class="glass-panel" style="padding:22px 24px;display:flex;flex-direction:column;justify-content:space-between;gap:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:900;opacity:0.4;font-size:12px;">${String(idx + 1).padStart(2, '0')}</span>
          <span style="background:var(--yellow);padding:4px 10px;border-radius:99px;font-size:10px;font-weight:800;letter-spacing:.05em;">${s.tag}</span>
        </div>
        <strong style="font-size:16px;line-height:1.4;">${s.name}</strong>
        <p style="margin:0;font-size:12px;color:var(--ink-soft);line-height:1.6;">${s.desc}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<section id="experience">
  <div class="container">
    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:35px;">
      <div class="eyebrow">03 / EXPERIENCE · KINH NGHIỆM &amp; DỰ ÁN NỔI BẬT</div>
      <h2 class="section-title">KINH NGHIỆM THỰC CHIẾN</h2>
      <p class="intro">Hành trình thực tế với các vị trí VJ, TikTok Video Editor, Scriptwriter và sáng tạo nội dung — trực tiếp sản xuất, lên kịch bản, quay hình và hậu kỳ cho các network và nhãn hàng.</p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(350px, 1fr));gap:24px;">
      ${(experiences && experiences.length > 0 ? experiences : EXPERIENCE_LIST).map((exp) => `
        <div class="glass-panel" style="padding:32px 36px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
              <span style="background:var(--yellow);padding:5px 12px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.05em;">${exp.tag}</span>
              <span style="background:rgba(255,255,255,0.85);padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;color:var(--ink-soft);border:1px solid rgba(255,255,255,0.9);">${exp.period}</span>
            </div>
            <h3 style="font-size:26px;font-weight:900;margin:0 0 8px;letter-spacing:-.02em;">${exp.company}</h3>
            <div style="display:inline-block;font-size:12px;font-weight:800;text-transform:uppercase;color:#0284C7;background:#E0F2FE;padding:4px 12px;border-radius:8px;margin-bottom:20px;">
              ${exp.role}
            </div>
            <div style="border-top:1px solid rgba(0,0,0,0.06);padding-top:16px;display:flex;flex-direction:column;gap:10px;">
              ${exp.highlights.map((h: string) => `
                <div style="display:flex;align-items:flex-start;gap:10px;font-size:13px;line-height:1.65;color:#334155;">
                  <span style="color:#f59e0b;font-weight:900;font-size:14px;line-height:1;">✦</span>
                  <span>${h}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</section>

<section id="work">
  <div class="container">
    <div class="eyebrow">${content.workEyebrow}</div>
    <h2 class="section-title">${content.workTitle}</h2>
    <p class="intro">${content.workIntro}</p>

    <div class="work-grid">
      ${projects.map((p) => `
        <article class="glass-panel work-card">
          ${mediaSlots[p.mediaSlotId]?.hidden ? '' : `
          <div style="aspect-ratio:16/10;overflow:hidden;border-bottom:1px solid rgba(255,255,255,0.7);">
            ${renderMedia(p.mediaSlotId, p.title, p.description)}
          </div>`}
          <div class="work-info">
            <h3>${p.title}</h3>
            <p>${p.description}</p>
            <div style="display:flex;gap:8px;margin-top:14px;">
              ${p.tags.map((t) => `<span style="font-size:11px;font-weight:800;background:var(--yellow);padding:4px 10px;border-radius:999px;">${t}</span>`).join('')}
            </div>
          </div>
        </article>
      `).join('')}
    </div>
  </div>
</section>

${mediaSlots.visualBreak?.hidden ? '' : `
<section style="padding:50px 0;">
  <div class="container">
    <div class="glass-panel" style="min-height:500px;overflow:hidden;">
      ${renderMedia('visualBreak', 'FULL-WIDTH VISUAL', 'Collage hoặc visual lớn của bạn.')}
    </div>
  </div>
</section>`}

<section id="case-study">
  <div class="container">
    <div class="eyebrow">04 / CASE STUDIES · BÀI HỌC CHIẾN DỊCH</div>
    <h2 class="section-title">CASE STUDIES</h2>

    <div style="display:grid;gap:40px;margin-top:35px;">
      ${caseStudies.map((c) => `
        <article class="glass-panel" style="padding:36px;display:grid;grid-template-columns:0.8fr 1.2fr;gap:35px;align-items:start;">
          <div>
            <span style="font-size:60px;font-weight:900;line-height:1;display:block;">${c.number}</span>
            <span class="eyebrow" style="margin-top:10px;">${c.tag}</span>
            <h3 style="font-size:26px;font-weight:900;margin:10px 0;">${c.hook}</h3>
          </div>
          <div>
            <h4 style="font-size:20px;font-weight:800;margin:0 0 10px;">${c.title}</h4>
            <p style="color:var(--ink-soft);line-height:1.7;">${c.description}</p>
            ${mediaSlots[c.mediaSlotId]?.hidden ? '' : `
            <div style="margin-top:20px;border-radius:20px;overflow:hidden;">
              ${renderMedia(c.mediaSlotId, c.title, 'Visual bài học chiến dịch')}
            </div>`}
          </div>
        </article>
      `).join('')}
    </div>
  </div>
</section>

<section id="video">
  <div class="container">
    <div class="glass-panel-dark" style="padding:50px 40px;">
      <div class="eyebrow" style="background:rgba(255,255,255,0.15);color:#fff;">05 / VIDEOGRAPHY · TÁC PHẨM VIDEO</div>
      <h2 class="section-title" style="color:#ffffff;">VIDEO WORK</h2>
      <p style="color:#d7e3ec;max-width:600px;line-height:1.7;">Các khu vực video clip được thiết kế dạng khung nổi trong suốt hỗ trợ clip dọc TikTok / Reels và video ngang thương mại.</p>

      <div class="video-stack">
        ${[
          { slotId: 'video1', title: 'VIDEO 01 (PROJECT REEL)', sub: 'COMMERCIAL / PROJECT REEL', num: '01', defaultRatio: '16/9' },
          { slotId: 'video2', title: 'VIDEO 02 (SHORT-FORM 9:16)', sub: 'SHORT-FORM 9:16', num: '02', defaultRatio: '9/16' },
          { slotId: 'video3', title: 'VIDEO 03 (BEHIND THE SCENES)', sub: 'BEHIND THE SCENES', num: '03', defaultRatio: '16/9' }
        ].filter(v => !(resolvedSlots[v.slotId]?.hidden ?? mediaSlots[v.slotId]?.hidden)).map(v => {
          const s = resolvedSlots[v.slotId] || mediaSlots[v.slotId];
          const isVert = s?.aspectRatio === '9/16' || s?.videoType === 'tiktok' || s?.url?.includes('shorts') || s?.url?.includes('tiktok') || (!s?.url && v.defaultRatio === '9/16');
          return `
        <div class="video-card glass-panel" style="background:rgba(255,255,255,0.1);${isVert ? 'max-width:440px;margin:0 auto;' : 'width:100%;'}">
          ${renderMedia(v.slotId, v.title, v.sub)}
          <div class="video-label"><span>${v.sub}</span><span>${v.num}</span></div>
        </div>`;
        }).join('')}
      </div>
    </div>
  </div>
</section>

<section id="testimonial">
  <div class="container">
    <div class="glass-panel" style="padding:60px 45px;text-align:center;">
      <blockquote style="font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(24px,3.5vw,40px);margin:0 0 20px;line-height:1.35;">
        ${content.testimonialQuote}
      </blockquote>
      <div style="font-weight:800;color:var(--ink-soft);font-size:13px;letter-spacing:.08em;">
        ${content.testimonialAuthor}
      </div>
    </div>
  </div>
</section>

<section id="contact">
  <div class="container grid-2" style="align-items:end;">
    <div>
      <div class="eyebrow">${content.contactEyebrow}</div>
      <h2 class="section-title">${content.contactTitle}</h2>
      <p class="intro">${content.contactDescription}</p>
    </div>
    <div class="contact-links">
      ${(content.socialLinks && content.socialLinks.length > 0
        ? content.socialLinks
        : [
            { id: '1', label: 'EMAIL (GMAIL)', url: `mailto:${content.contactEmail}` },
            { id: '2', label: 'INSTAGRAM', url: 'https://instagram.com' },
            { id: '3', label: 'TIKTOK', url: 'https://tiktok.com' },
            { id: '4', label: 'FACEBOOK', url: 'https://facebook.com' },
          ]
      )
        .map(
          (link) => `
      <a class="contact-link" href="${link.url}" target="_blank" rel="noreferrer">
        <span>${link.label}</span>
        <span>↗</span>
      </a>`
        )
        .join('')}
    </div>
  </div>
</section>

</main>

<footer>
  <div class="container">
    <span>${content.footerCopy}</span>
  </div>
</footer>

</body>
</html>`;
  };

  // Generate lightweight HTML for the on-screen code preview (truncates huge data URLs to keep DOM fast)
  const previewHtml = useMemo(() => {
    if (!isOpen) return '';
    try {
      return generateStandaloneHtml(true);
    } catch (err) {
      console.warn('Preview generation fallback:', err);
      return '<!-- Đã chuẩn bị toàn bộ dữ liệu file HTML. Vui lòng bấm nút Tải file .html về máy để lưu đầy đủ. -->';
    }
  }, [isOpen, resolvedSlots, content, projects, caseStudies, experiences]);

  // Safely estimate file size without allocating massive contiguous strings on every render
  const [fileSizeText, setFileSizeText] = useState<string>('Sẵn sàng');

  useEffect(() => {
    if (!isOpen) return;
    try {
      let totalBytes = 35000; // estimated HTML structure size
      Object.values(resolvedSlots).forEach((s) => {
        if (s?.url) {
          totalBytes += s.url.length;
        }
      });
      if (totalBytes > 1024 * 1024) {
        setFileSizeText(`${(totalBytes / (1024 * 1024)).toFixed(1)} MB`);
      } else {
        setFileSizeText(`${(totalBytes / 1024).toFixed(1)} KB`);
      }
    } catch {
      setFileSizeText('Sẵn sàng');
    }
  }, [isOpen, resolvedSlots]);

  const handleDownload = () => {
    try {
      const fullHtml = generateStandaloneHtml(false);
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${content.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'portfolio'}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleCopy = async () => {
    try {
      const fullHtml = generateStandaloneHtml(false);
      if (fullHtml.length > 2 * 1024 * 1024) {
        // Over 2MB: Clipboard API can fail or freeze on huge strings, trigger download instead
        handleDownload();
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      }
      await navigator.clipboard.writeText(fullHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      handleDownload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] glass-panel bg-white/95 rounded-3xl flex flex-col text-[#19232D] overflow-hidden shadow-2xl border border-white">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex items-center justify-between bg-gradient-to-r from-[#FBE8A6]/60 via-white to-[#C5E4F8]/60">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-white shadow-sm border border-slate-200">
              <Lock size={20} className="text-emerald-700" />
            </span>
            <div>
              <h2 className="font-vietnam font-bold text-xl uppercase tracking-wide">
                Xuất file HTML hoàn chỉnh (Đã khóa)
              </h2>
              <p className="text-xs text-[#5A6A7E]">
                Mã nguồn độc lập đã được khóa cứng, giữ nguyên toàn bộ chữ và ảnh bạn vừa chỉnh sửa, không ai chỉnh sửa được nữa khi mở file!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content & Code preview */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {isConverting ? (
            <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/80 text-xs leading-relaxed text-blue-950 flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-blue-600 shrink-0" />
              <div>
                <strong className="block mb-0.5 font-bold">
                  Đang tích hợp video &amp; ảnh vào file HTML ({conversionProgress.current}/{conversionProgress.total})...
                </strong>
                Hệ thống đang chuyển đổi các file media bạn vừa tải lên thành mã độc lập để khi tải file về máy, mọi người đều xem và phát trực tiếp được bình thường.
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 text-xs leading-relaxed text-emerald-950 flex items-start gap-3">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <strong className="block mb-0.5 font-bold">
                  ✓ Toàn bộ ảnh &amp; video bạn đã thêm vào đều được giữ nguyên 100%:
                </strong>
                Mã nguồn độc lập đã nhúng trực tiếp dữ liệu media và khớp chuẩn tỉ lệ khung hình. Khi tải file HTML này về máy hoặc gửi cho bất kỳ ai, mọi video và hình ảnh đều hiển thị và phát được ngay lập tức mà không bị lỗi.
              </div>
            </div>
          )}

          <div className="relative">
            <pre className="p-4 rounded-2xl bg-[#19232D] text-[#E8F4FC] font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed border border-slate-700">
              <code>{previewHtml}</code>
            </pre>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white/90 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#5A6A7E] font-medium">
            Kích thước file: {fileSizeText}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-full border border-slate-300 bg-white hover:bg-[#E8F4FC] text-[#19232D] transition-all shadow-sm active:translate-y-0.5 cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép mã'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-full border border-[#FBE8A6] bg-[#FBE8A6] hover:bg-[#F9DD7E] text-[#19232D] transition-all shadow-md active:translate-y-0.5 cursor-pointer"
            >
              <Download size={14} />
              <span>Tải file .html về máy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
