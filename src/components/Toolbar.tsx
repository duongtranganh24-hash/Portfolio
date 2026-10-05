import React from 'react';
import {
  Sparkles,
  RotateCcw,
  Code,
  Image as ImageIcon,
  Edit3,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ToolbarProps {
  filledCount: number;
  totalSlots: number;
  hiddenCount: number;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onRestoreAllHidden: () => void;
  onLoadAllDemo: () => void;
  onResetAll: () => void;
  onOpenExport: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  filledCount,
  totalSlots,
  hiddenCount,
  isEditMode,
  onToggleEditMode,
  onRestoreAllHidden,
  onLoadAllDemo,
  onResetAll,
  onOpenExport,
}) => {
  return (
    <aside
      aria-label="Portfolio Media & Text Customizer"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] w-auto glass-panel p-2 sm:p-2.5 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-bold text-[#19232D] shadow-[0_20px_50px_rgba(100,150,200,0.25)] border border-white/95"
    >
      {/* Edit Mode Toggle Switch */}
      <button
        type="button"
        onClick={onToggleEditMode}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap ${
          isEditMode
            ? 'bg-[#FBE8A6] text-[#19232D] ring-2 ring-[#82BFE7]'
            : 'bg-white/90 text-slate-700 hover:bg-[#E8F4FC]'
        }`}
        title={isEditMode ? 'Đang mở chế độ sửa chữ & bỏ ảnh. Bấm để khóa xem trước' : 'Bật để sửa trực tiếp văn bản & ẩn ảnh'}
      >
        {isEditMode ? <Edit3 size={14} className="text-[#19232D]" /> : <Eye size={14} className="text-[#5A6A7E]" />}
        <span>{isEditMode ? 'Chế độ sửa: Đang Bật' : 'Chế độ sửa: Đang Tắt'}</span>
      </button>

      {/* Progress badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-white/80 whitespace-nowrap shadow-sm">
        <ImageIcon size={13} className="text-[#82BFE7]" />
        <span className="text-[11px] text-slate-500">Ảnh:</span>
        <span className="font-bold text-[#19232D]">
          {filledCount}/{totalSlots - hiddenCount}
        </span>
      </div>

      {/* Hidden slots restore badge */}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={onRestoreAllHidden}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer shadow-sm"
          title="Hiện lại tất cả các khung ảnh bạn đã bấm ẩn"
        >
          <EyeOff size={13} />
          <span>Hiện lại {hiddenCount} ảnh đã ẩn</span>
        </button>
      )}

      <div className="h-5 w-[1px] bg-slate-200 hidden md:block" />

      {/* Button: Demo fill */}
      <button
        type="button"
        onClick={onLoadAllDemo}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-[#FBE8A6] border border-white/90 transition-all whitespace-nowrap text-[#19232D] cursor-pointer shadow-sm"
        title="Nạp nhanh các hình ảnh mẫu đẹp để xem thử giao diện"
      >
        <Sparkles size={13} className="text-amber-500" />
        <span className="hidden sm:inline">Nạp ảnh mẫu</span>
        <span className="sm:hidden">Mẫu</span>
      </button>

      {/* Button: Clear all to blank */}
      <button
        type="button"
        onClick={onResetAll}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-rose-50 border border-white/90 text-slate-600 hover:text-rose-700 transition-all whitespace-nowrap cursor-pointer shadow-sm"
        title="Đặt lại toàn bộ về khung trống nguyên bản để tự tải ảnh & clip"
      >
        <RotateCcw size={13} />
        <span className="hidden sm:inline">Về khung trống</span>
        <span className="sm:hidden">Trống</span>
      </button>

      {/* Button: Export HTML */}
      <button
        type="button"
        onClick={onOpenExport}
        className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full border border-white bg-gradient-to-r from-[#FBE8A6] to-[#C5E4F8] hover:opacity-95 text-[#19232D] shadow-md whitespace-nowrap transition-transform active:translate-y-0.5 cursor-pointer font-bold"
        title="Xuất file HTML hoàn chỉnh - đã khóa chữ và ảnh, chạy độc lập không thể sửa"
      >
        <Code size={13} />
        <span>Xuất HTML (Đã khóa)</span>
      </button>
    </aside>
  );
};
