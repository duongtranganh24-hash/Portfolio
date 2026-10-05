import React, { useState } from 'react';
import { SocialLinkItem } from '../types';
import {
  Mail,
  Instagram,
  Video as VideoIcon,
  Facebook,
  Linkedin,
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Edit2,
  Check,
} from 'lucide-react';

interface SocialLinksEditorProps {
  links: SocialLinkItem[];
  onChange: (links: SocialLinkItem[]) => void;
  isEditMode: boolean;
}

export const SocialLinksEditor: React.FC<SocialLinksEditorProps> = ({
  links,
  onChange,
  isEditMode,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'email':
        return <Mail size={18} className="text-[#82BFE7]" />;
      case 'instagram':
        return <Instagram size={18} className="text-pink-500" />;
      case 'tiktok':
        return <VideoIcon size={18} className="text-[#19232D]" />;
      case 'facebook':
        return <Facebook size={18} className="text-blue-600" />;
      case 'linkedin':
        return <Linkedin size={18} className="text-sky-600" />;
      case 'zalo':
        return <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center">Z</span>;
      default:
        return <Globe size={18} className="text-emerald-600" />;
    }
  };

  const handleUpdateLink = (id: string, updates: Partial<SocialLinkItem>) => {
    onChange(
      links.map((link) => (link.id === id ? { ...link, ...updates } : link))
    );
  };

  const handleDeleteLink = (id: string) => {
    onChange(links.filter((link) => link.id !== id));
  };

  const handleAddLink = () => {
    const newId = `social_${Date.now()}`;
    const newLink: SocialLinkItem = {
      id: newId,
      platform: 'custom',
      label: 'TRANG CÁ NHÂN MỚI',
      url: 'https://',
    };
    onChange([...links, newLink]);
    setEditingId(newId);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {links.map((link) => {
        const isEditingThis = isEditMode && editingId === link.id;

        if (isEditingThis) {
          return (
            <div
              key={link.id}
              className="p-4 rounded-3xl glass-panel bg-white/95 border-2 border-[#82BFE7] shadow-md flex flex-col gap-3 animate-in fade-in"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#19232D] uppercase">
                  Chỉnh sửa liên kết
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-1.5 rounded-full hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    title="Xóa liên kết này"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FBE8A6] text-[#19232D] text-xs font-bold shadow-sm hover:bg-[#F9DD7E] cursor-pointer"
                  >
                    <Check size={13} />
                    <span>Xong</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A6A7E] mb-1">
                    Nền tảng / Icon
                  </label>
                  <select
                    value={link.platform}
                    onChange={(e) =>
                      handleUpdateLink(link.id, {
                        platform: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="email">Email</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="zalo">Zalo</option>
                    <option value="threads">Threads</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="behance">Behance</option>
                    <option value="youtube">YouTube</option>
                    <option value="custom">Tùy chỉnh khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5A6A7E] mb-1">
                    Tên hiển thị
                  </label>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) =>
                      handleUpdateLink(link.id, { label: e.target.value })
                    }
                    placeholder="VD: INSTAGRAM / BEHANCE"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5A6A7E] mb-1">
                  Đường dẫn (URL) trang cá nhân của bạn
                </label>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) =>
                    handleUpdateLink(link.id, { url: e.target.value })
                  }
                  placeholder="https://instagram.com/ten_cua_ban hoặc mailto:you@email.com"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-mono"
                />
              </div>
            </div>
          );
        }

        return (
          <div
            key={link.id}
            className="group/link relative flex items-center justify-between p-4 sm:p-5 rounded-3xl glass-panel text-[#19232D] font-bold text-sm uppercase tracking-wider shadow-md hover:translate-x-1.5 transition-transform"
          >
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-between gap-3 text-inherit no-underline"
            >
              <span className="flex items-center gap-3">
                {getPlatformIcon(link.platform)}
                <span>{link.label}</span>
              </span>
              <span className="opacity-70 group-hover/link:opacity-100 transition-opacity">
                ↗
              </span>
            </a>

            {/* Quick edit button shown in Edit Mode */}
            {isEditMode && (
              <button
                type="button"
                onClick={() => setEditingId(link.id)}
                className="ml-3 p-1.5 rounded-full bg-white/80 hover:bg-[#FBE8A6] text-[#19232D] shadow-sm border border-slate-200 transition-colors cursor-pointer"
                title="Sửa đường link hoặc tên nền tảng"
              >
                <Edit2 size={13} />
              </button>
            )}
          </div>
        );
      })}

      {/* Add Link Button in Edit Mode */}
      {isEditMode && (
        <button
          type="button"
          onClick={handleAddLink}
          className="w-full py-3 rounded-3xl border-2 border-dashed border-[#82BFE7] bg-white/60 hover:bg-[#E8F4FC] text-[#19232D] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <Plus size={15} />
          <span>Thêm trang cá nhân / mạng xã hội khác</span>
        </button>
      )}
    </div>
  );
};
