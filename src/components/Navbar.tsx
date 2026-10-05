import React, { useState } from 'react';
import { Menu, X, Code, Sparkles, RotateCcw, Edit3, Eye } from 'lucide-react';
import { EditableText } from './EditableText';

interface NavbarProps {
  brandName: string;
  onUpdateBrandName: (newName: string) => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenExport: () => void;
  onLoadAllDemo: () => void;
  onResetAll: () => void;
  filledCount: number;
  totalSlots: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  brandName,
  onUpdateBrandName,
  isEditMode,
  onToggleEditMode,
  onOpenExport,
  onLoadAllDemo,
  onResetAll,
  filledCount,
  totalSlots,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F0]/85 backdrop-blur-2xl border-b border-white/85 shadow-[0_4px_30px_rgba(130,191,231,0.14)] transition-all">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 min-h-[76px] flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark (Editable in edit mode) */}
        <div className="flex items-center gap-2 group">
          <a href="#home" className="flex items-center gap-2 text-inherit no-underline">
            <span className="font-vietnam font-black text-lg sm:text-xl tracking-wider text-[#19232D] uppercase flex items-center gap-2">
              <span className="bg-[#FBE8A6] border border-white/95 px-3 py-1 rounded-full text-xs font-black shadow-sm group-hover:bg-[#C5E4F8] transition-colors">
                PORTFOLIO
              </span>
            </span>
          </a>
          <div className="font-vietnam font-black text-sm sm:text-base tracking-wide text-[#19232D] uppercase">
            <EditableText
              value={brandName}
              onChange={onUpdateBrandName}
              isEditMode={isEditMode}
              placeholder="TÊN BẠN / BRAND"
              className="font-black tracking-wide"
            />
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean text with smooth hover indicators) */}
        <nav className="hidden lg:flex items-center gap-6 text-[13px] font-bold uppercase tracking-wider text-[#19232D]">
          <a
            href="#about"
            className="relative py-1 hover:text-[#82BFE7] transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#82BFE7] hover:after:w-full after:transition-all"
          >
            About
          </a>
          <a
            href="#qual"
            className="relative py-1 hover:text-[#82BFE7] transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#82BFE7] hover:after:w-full after:transition-all"
          >
            Kỹ năng
          </a>
          <a
            href="#experience"
            className="relative py-1 hover:text-[#82BFE7] transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#82BFE7] hover:after:w-full after:transition-all"
          >
            Kinh nghiệm
          </a>
          <a
            href="#work"
            className="relative py-1 hover:text-[#82BFE7] transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#82BFE7] hover:after:w-full after:transition-all"
          >
            Dự án
          </a>
          <a
            href="#case-study"
            className="relative py-1 hover:text-[#82BFE7] transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#82BFE7] hover:after:w-full after:transition-all"
          >
            Case Study
          </a>
          <a
            href="#video"
            className="relative py-1 hover:text-[#82BFE7] transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#82BFE7] hover:after:w-full after:transition-all"
          >
            Video
          </a>
          <a
            href="#contact"
            className="relative py-1 hover:text-[#82BFE7] transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#82BFE7] hover:after:w-full after:transition-all"
          >
            Liên hệ
          </a>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Edit Mode Quick Toggle */}
          <button
            type="button"
            onClick={onToggleEditMode}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer border ${
              isEditMode
                ? 'bg-[#FBE8A6] text-[#19232D] border-white shadow-md ring-2 ring-[#82BFE7]/40'
                : 'bg-white/90 text-slate-600 border-white/90 hover:bg-[#E8F4FC]'
            }`}
            title={isEditMode ? 'Bấm để chuyển sang chế độ Xem trước (Khóa)' : 'Bấm để bật chế độ chỉnh sửa chữ & ẩn ảnh'}
          >
            {isEditMode ? <Edit3 size={13} className="text-[#19232D]" /> : <Eye size={13} />}
            <span className="hidden sm:inline">{isEditMode ? 'Sửa chữ: Bật' : 'Sửa chữ: Tắt'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenExport}
            className="hidden sm:inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold rounded-full border border-white/95 bg-gradient-to-r from-[#FBE8A6] to-[#C5E4F8] hover:opacity-95 text-[#19232D] shadow-[0_4px_16px_rgba(130,191,231,0.25)] transition-all active:translate-y-0.5 whitespace-nowrap cursor-pointer"
            title="Xuất mã nguồn HTML độc lập có ảnh/video và chữ của bạn (đã khóa cứng)"
          >
            <Code size={14} />
            <span>Xuất HTML (Đã khóa)</span>
          </button>

          <a
            href="#contact"
            className="hidden md:inline-flex items-center px-4 py-2 text-xs font-bold rounded-full border border-white/90 bg-white/90 hover:bg-[#E8F4FC] text-[#19232D] shadow-sm transition-all active:translate-y-0.5 whitespace-nowrap"
          >
            Liên hệ ↗
          </a>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-2xl border border-white/90 bg-white/80 text-[#19232D] shadow-sm"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F0]/95 backdrop-blur-2xl border-b border-white/80 px-6 py-6 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-3.5 text-sm font-bold uppercase tracking-wider text-[#19232D] mb-6">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-black/5 hover:text-[#82BFE7]"
            >
              01 / Giới thiệu (About)
            </a>
            <a
              href="#qual"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-black/5 hover:text-[#82BFE7]"
            >
              02 / Kỹ năng (Skills)
            </a>
            <a
              href="#experience"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-black/5 hover:text-[#82BFE7]"
            >
              03 / Kinh nghiệm thực chiến
            </a>
            <a
              href="#work"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-black/5 hover:text-[#82BFE7]"
            >
              04 / Dự án nổi bật (Work)
            </a>
            <a
              href="#case-study"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-black/5 hover:text-[#82BFE7]"
            >
              05 / Case Study
            </a>
            <a
              href="#video"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-black/5 hover:text-[#82BFE7]"
            >
              06 / Videography
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#82BFE7]"
            >
              07 / Liên hệ hợp tác
            </a>
          </nav>

          <div className="flex flex-col gap-2.5 pt-3 border-t border-black/5">
            <button
              type="button"
              onClick={() => {
                onToggleEditMode();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl border border-white/90 bg-white text-[#19232D] shadow-sm cursor-pointer"
            >
              {isEditMode ? <Edit3 size={15} /> : <Eye size={15} />}
              <span>{isEditMode ? 'Chế độ sửa chữ: Đang Bật' : 'Chế độ sửa chữ: Đang Tắt'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenExport();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl border border-white bg-gradient-to-r from-[#FBE8A6] to-[#C5E4F8] text-[#19232D] shadow-md cursor-pointer"
            >
              <Code size={15} />
              <span>Xuất mã HTML hoàn chỉnh (Đã khóa)</span>
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLoadAllDemo();
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-2xl border border-white/90 bg-white text-[#19232D] cursor-pointer shadow-sm"
              >
                <Sparkles size={13} className="text-amber-500" />
                <span>Nạp mẫu ({totalSlots})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onResetAll();
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-2xl border border-white/90 bg-white text-[#19232D] cursor-pointer shadow-sm"
              >
                <RotateCcw size={13} />
                <span>Xóa trắng</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

