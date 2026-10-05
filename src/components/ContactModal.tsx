import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setName('');
      setEmail('');
      setMessage('');
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#FAF7F0] border-2 border-[#1E293B] rounded-3xl brutal-shadow text-[#19232D] overflow-hidden">
        <div className="p-6 border-b-2 border-[#1E293B] bg-[#C5E4F8] flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#19232D]/75">
              Gửi tin nhắn trực tiếp
            </span>
            <h2 className="font-outfit font-black text-2xl uppercase tracking-tight text-[#19232D]">
              Bắt đầu dự án cùng tôi
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border-2 border-[#1E293B] bg-white hover:bg-[#FBE8A6] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FBE8A6] border-2 border-[#1E293B] flex items-center justify-center text-emerald-700">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-outfit font-black text-2xl uppercase tracking-wide text-[#19232D]">
              Cảm ơn bạn!
            </h3>
            <p className="text-xs text-[#5A6A7E] max-w-xs mx-auto leading-relaxed">
              Tin nhắn đã được ghi nhận. Tôi sẽ phản hồi lại bạn qua email sớm nhất có thể!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[#19232D]">
                Họ và tên *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border-2 border-[#1E293B] bg-white focus:outline-none focus:ring-2 focus:ring-[#82BFE7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[#19232D]">
                Email liên hệ *
              </label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border-2 border-[#1E293B] bg-white focus:outline-none focus:ring-2 focus:ring-[#82BFE7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[#19232D]">
                Mô tả ý tưởng / Dự án của bạn
              </label>
              <textarea
                rows={4}
                placeholder="Chia sẻ về thương hiệu, nền tảng (TikTok, Insta, Web), mục tiêu hoặc thời gian triển khai..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border-2 border-[#1E293B] bg-white focus:outline-none focus:ring-2 focus:ring-[#82BFE7] resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#5A6A7E] hover:text-[#19232D]"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 border-[#1E293B] bg-[#FBE8A6] hover:bg-[#F9DD7E] text-[#19232D] brutal-shadow-sm active:translate-y-0.5 cursor-pointer"
              >
                <Send size={13} />
                <span>Gửi thông tin</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
