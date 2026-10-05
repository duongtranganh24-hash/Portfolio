import React from 'react';
import { Pencil } from 'lucide-react';

interface EditableTextProps {
  value: string;
  onChange: (newValue: string) => void;
  isEditMode: boolean;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'blockquote' | 'b' | 'strong' | 'div';
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  isEditMode,
  className = '',
  placeholder = 'Nhập nội dung...',
  multiline = false,
  rows = 3,
  as: Component = 'span',
}) => {
  // Read-only / Locked / Export mode: pristine clean HTML element with zero editing chrome
  if (!isEditMode) {
    return <Component className={`font-vietnam ${className}`}>{value || placeholder}</Component>;
  }

  // Edit Mode: multiline textarea with frosted glass bubble styling
  if (multiline) {
    return (
      <div className="relative group/edit my-1.5 w-full">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`w-full bg-white/85 backdrop-blur-xl rounded-2xl border-2 border-[#82BFE7] p-3 text-inherit focus:outline-none focus:ring-4 focus:ring-[#82BFE7]/25 shadow-[0_4px_16px_rgba(130,191,231,0.2)] transition-all resize-y font-vietnam leading-relaxed text-[#19232D] ${className}`}
        />
        <span className="absolute top-3 right-3 p-1.5 rounded-full bg-[#FBE8A6] text-[#19232D] shadow-sm pointer-events-none opacity-80 group-hover/edit:opacity-100 transition-opacity">
          <Pencil size={12} />
        </span>
      </div>
    );
  }

  // Edit Mode: single-line input with frosted glass bubble styling
  return (
    <span className="relative inline-flex items-center group/edit max-w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`bg-white/85 backdrop-blur-xl rounded-xl border-2 border-[#82BFE7] px-3 py-1 text-inherit font-inherit focus:outline-none focus:ring-4 focus:ring-[#82BFE7]/25 shadow-[0_2px_12px_rgba(130,191,231,0.18)] transition-all font-vietnam max-w-full ${className}`}
        style={{ width: `${Math.max((value || placeholder).length * 0.95, 6)}ch` }}
      />
      <span className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-[#FBE8A6] text-[#19232D] shadow-sm pointer-events-none opacity-80 group-hover/edit:opacity-100 transition-opacity">
        <Pencil size={10} />
      </span>
    </span>
  );
};

