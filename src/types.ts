export type MediaType = 'image' | 'video';

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  subtitle: string;
  icon: string;
  aspectRatio?: '16/9' | '16/10' | '9/16' | '4/3' | '1/1' | 'auto';
  url?: string; // base64, blob or URL
  videoType?: 'url' | 'youtube' | 'local' | 'tiktok' | 'gdrive';
  hidden?: boolean; // User can hide/remove any image frame
  isLocalBlob?: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  description: string;
  fullContent?: string;
  client?: string;
  year?: string;
  mediaSlotId: string;
}

export interface CaseStudyItem {
  number: string;
  tag: string;
  hook: string;
  title: string;
  description: string;
  highlights: string[];
  mediaSlotId: string;
  mediaType: MediaType;
}

export interface VideoItem {
  id: string;
  number: string;
  label: string;
  category: string;
  description: string;
  mediaSlotId: string;
  aspectRatio: '16/9' | '9/16';
}

export interface SocialLinkItem {
  id: string;
  platform: 'email' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin' | 'behance' | 'youtube' | 'custom';
  label: string;
  url: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  period: string;
  role: string;
  tag: string;
  highlights: string[];
}

export interface PortfolioContent {
  brandName: string;
  heroKicker: string;
  heroScript: string;
  heroTitleMain: string;
  heroTitleOutline: string;
  heroDescription: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutTitleStroke: string;
  aboutText: string;
  stat1Number: string;
  stat1Label: string;
  stat2Number: string;
  stat2Label: string;
  stat3Number: string;
  stat3Label: string;
  qualEyebrow: string;
  qualTitle: string;
  workEyebrow: string;
  workTitle: string;
  workIntro: string;
  testimonialQuote: string;
  testimonialAuthor: string;
  contactEyebrow: string;
  contactTitle: string;
  contactDescription: string;
  contactEmail: string;
  socialLinks: SocialLinkItem[];
  footerCopy: string;
}
