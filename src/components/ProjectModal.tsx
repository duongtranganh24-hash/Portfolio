import React from 'react';
import { X, Calendar, User, ExternalLink, Sparkles } from 'lucide-react';
import { ProjectItem, MediaItem } from '../types';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  mediaItem?: MediaItem;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  mediaItem,
}) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] bg-[#FAF7F0] border-2 border-[#1E293B] rounded-3xl brutal-shadow flex flex-col text-[#19232D] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b-2 border-[#1E293B] flex items-center justify-between bg-[#FBE8A6]">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#5A6A7E] mb-1">
              <span>{project.category}</span>
              <span>•</span>
              <span>{project.year || '2025'}</span>
            </div>
            <h2 className="font-outfit font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#19232D]">
              {project.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border-2 border-[#1E293B] bg-white hover:bg-[#C5E4F8] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Media preview */}
          {mediaItem?.url ? (
            <div className="w-full rounded-2xl overflow-hidden border-2 border-[#1E293B] max-h-[360px] bg-black">
              {mediaItem.type === 'video' ? (
                <video src={mediaItem.url} controls className="w-full h-full object-cover" />
              ) : (
                <img src={mediaItem.url} alt={project.title} className="w-full h-full object-cover" />
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl border-2 border-dashed border-[#1E293B]/25 bg-gradient-to-r from-[#FBE8A6]/30 to-[#C5E4F8]/40 text-center text-xs text-[#5A6A7E]">
              <Sparkles size={20} className="mx-auto mb-2 text-amber-500" />
              Chưa tải ảnh dự án này. Bạn có thể tải ảnh lên ở khung ngoài trang chính!
            </div>
          )}

          {/* Details */}
          <div>
            <h3 className="font-outfit font-extrabold text-lg uppercase tracking-wide mb-2">Tổng quan &amp; Mục tiêu</h3>
            <p className="text-sm text-[#5A6A7E] leading-relaxed">
              {project.fullContent || project.description}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl border-2 border-[#1E293B] bg-[#E8F4FC]">
              <span className="block text-[11px] font-bold text-[#5A6A7E] uppercase">Khách hàng</span>
              <strong className="text-sm text-[#19232D] font-bold">{project.client || 'Dự án độc lập'}</strong>
            </div>
            <div className="p-4 rounded-xl border-2 border-[#1E293B] bg-[#FDF6DE]">
              <span className="block text-[11px] font-bold text-[#5A6A7E] uppercase">Thời gian</span>
              <strong className="text-sm text-[#19232D] font-bold">{project.year || '2025'}</strong>
            </div>
            <div className="p-4 rounded-xl border-2 border-[#1E293B] bg-white col-span-2 sm:col-span-1">
              <span className="block text-[11px] font-bold text-[#5A6A7E] uppercase">Phạm vi</span>
              <strong className="text-sm text-[#19232D] font-bold">Content &amp; Strategy</strong>
            </div>
          </div>

          <div>
            <h3 className="font-outfit font-extrabold text-base uppercase tracking-wide mb-2.5">Thẻ chuyên môn</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1.5 rounded-full border border-[#1E293B] bg-[#FBE8A6] text-xs font-black uppercase text-[#19232D]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t-2 border-[#1E293B] bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold rounded-xl border-2 border-[#1E293B] bg-[#FBE8A6] text-[#19232D] brutal-shadow-sm hover:bg-[#F9DD7E] cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
