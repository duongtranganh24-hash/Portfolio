import React from 'react';

export const DreamySkyBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
    >
      {/* 1. Luminous, Bright, Fresh Pastel Sky Canvas (Tươi sáng, tinh khôi) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#EBF5FE] via-[#FFFDF7] to-[#E3F2FD]" />

      {/* Gentle Shimmering Color Waves (High-key, never dark) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(254,243,199,0.7),rgba(255,255,255,0))] animate-shimmer-bg opacity-80" />

      {/* 2. Soft Glowing Sunbeams & Luminous Ambient Orbs */}
      <div className="absolute -top-20 left-[20%] w-[680px] h-[680px] rounded-full bg-[#FEF08A]/45 blur-[130px] animate-pulse-glow" />
      <div className="absolute top-[30%] -right-16 w-[700px] h-[700px] rounded-full bg-[#BAE6FD]/45 blur-[140px] animate-float-slow" />
      <div className="absolute top-[60%] -left-16 w-[620px] h-[620px] rounded-full bg-[#FDE68A]/40 blur-[130px] animate-float-reverse" />
      <div className="absolute -bottom-24 right-[15%] w-[650px] h-[650px] rounded-full bg-[#93C5FD]/35 blur-[140px] animate-pulse-glow" />
      <div className="absolute top-1/2 left-1/3 w-[450px] h-[450px] rounded-full bg-white/75 blur-[100px] pointer-events-none" />

      {/* 3. LIVELY DRIFTING CLOUDS (Áng mây trắng bồng bềnh tươi sáng bay qua lại) */}

      {/* Cloud 1: High Atmosphere, Soft Pure White Cloud Drifting Right */}
      <div className="absolute top-[7%] left-0 w-full animate-cloud-drift-right">
        <div className="relative w-[360px] h-[115px] filter drop-shadow-[0_14px_30px_rgba(160,205,245,0.22)] animate-cloud-bob">
          {/* Cloud Base & Puffs */}
          <div className="absolute bottom-0 left-0 w-[330px] h-[72px] rounded-full bg-gradient-to-r from-white via-white/95 to-[#F0F9FF] border-t-2 border-white/90" />
          <div className="absolute bottom-5 left-10 w-[115px] h-[115px] rounded-full bg-white border-t border-white" />
          <div className="absolute bottom-8 left-34 w-[135px] h-[135px] rounded-full bg-gradient-to-b from-white via-white to-[#FEFCE8]/80 border-t border-white" />
          <div className="absolute bottom-3 left-58 w-[95px] h-[95px] rounded-full bg-white" />
          {/* Golden Sunlit Sheen */}
          <div className="absolute top-2 left-40 w-16 h-8 rounded-full bg-[#FEF08A]/35 blur-sm" />
        </div>
      </div>

      {/* Cloud 2: Mid Sky, Fluffy Butter-tinted Cloud Drifting Left */}
      <div className="absolute top-[36%] right-0 w-full animate-cloud-drift-left">
        <div
          className="relative w-[440px] h-[130px] filter drop-shadow-[0_16px_35px_rgba(253,230,138,0.25)] animate-cloud-bob"
          style={{ animationDelay: '2.5s' }}
        >
          {/* Cloud Base & Puffs */}
          <div className="absolute bottom-0 left-0 w-[400px] h-[80px] rounded-full bg-gradient-to-r from-[#FFFEFA] via-white to-[#F0F9FF] border-t-2 border-white/90" />
          <div className="absolute bottom-6 left-14 w-[130px] h-[130px] rounded-full bg-white" />
          <div className="absolute bottom-9 left-42 w-[150px] h-[150px] rounded-full bg-gradient-to-b from-white to-[#FEF9C3]/75 border-t border-white" />
          <div className="absolute bottom-5 left-72 w-[110px] h-[110px] rounded-full bg-white" />
          {/* Warm Sunbeam Accent */}
          <div className="absolute top-3 left-48 w-20 h-10 rounded-full bg-[#FDE047]/30 blur-sm" />
        </div>
      </div>

      {/* Cloud 3: Lower Sky, Majestic Airy Cloud Drifting Right */}
      <div className="absolute top-[68%] left-0 w-full animate-cloud-drift-slow">
        <div
          className="relative w-[490px] h-[140px] filter drop-shadow-[0_18px_40px_rgba(186,230,253,0.25)] animate-cloud-bob"
          style={{ animationDelay: '4.8s' }}
        >
          {/* Cloud Base & Puffs */}
          <div className="absolute bottom-0 left-0 w-[450px] h-[85px] rounded-full bg-gradient-to-r from-white via-white/95 to-[#E0F2FE]/90 border-t-2 border-white/90" />
          <div className="absolute bottom-7 left-18 w-[140px] h-[140px] rounded-full bg-white" />
          <div className="absolute bottom-11 left-48 w-[165px] h-[165px] rounded-full bg-gradient-to-b from-white via-white to-[#FEFCE8]/80 border-t border-white" />
          <div className="absolute bottom-5 left-82 w-[120px] h-[120px] rounded-full bg-white" />
        </div>
      </div>

      {/* 4. Translucent Liquid Bubble Spheres (Khung bóng bóng trong suốt lấp lánh) */}
      <div className="absolute top-[18%] left-[12%] w-36 h-36 rounded-full border-2 border-white/90 bg-gradient-to-br from-white/80 via-white/20 to-[#BAE6FD]/30 backdrop-blur-md shadow-[0_12px_32px_rgba(186,230,253,0.35)] animate-float-slow" />
      <div className="absolute top-[48%] right-[9%] w-44 h-44 rounded-full border-2 border-white/95 bg-gradient-to-br from-white/85 via-white/20 to-[#FEF08A]/35 backdrop-blur-md shadow-[0_14px_36px_rgba(254,240,138,0.35)] animate-float-reverse" />
      <div className="absolute bottom-[18%] left-[16%] w-28 h-28 rounded-full border border-white/80 bg-gradient-to-br from-white/70 to-transparent backdrop-blur-sm animate-float-h" />

      {/* 5. Glistening Diamond & Golden Sparkles (Lấp lánh xinh đẹp tinh tế) */}
      <div className="absolute top-[11%] right-[16%] text-amber-400 text-3xl filter drop-shadow-[0_0_10px_rgba(250,204,21,0.85)] animate-sparkle">
        ✦
      </div>
      <div className="absolute top-[22%] left-[24%] text-[#38BDF8] text-2xl filter drop-shadow-[0_0_10px_rgba(56,189,248,0.85)] animate-sparkle" style={{ animationDelay: '1.2s' }}>
        ✧
      </div>
      <div className="absolute top-[42%] right-[25%] text-amber-300 text-3xl filter drop-shadow-[0_0_12px_rgba(253,224,71,0.9)] animate-sparkle" style={{ animationDelay: '2.4s' }}>
        ✦
      </div>
      <div className="absolute top-[58%] left-[7%] text-[#0EA5E9] text-2xl filter drop-shadow-[0_0_10px_rgba(14,165,233,0.8)] animate-sparkle" style={{ animationDelay: '0.6s' }}>
        ⋆
      </div>
      <div className="absolute top-[75%] right-[12%] text-amber-400 text-3xl filter drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-sparkle" style={{ animationDelay: '3.2s' }}>
        ✦
      </div>
      <div className="absolute bottom-[12%] left-[28%] text-amber-300 text-2xl filter drop-shadow-[0_0_10px_rgba(253,224,71,0.85)] animate-sparkle" style={{ animationDelay: '1.8s' }}>
        ✧
      </div>
      <div className="absolute bottom-[25%] right-[38%] text-[#38BDF8] text-2xl filter drop-shadow-[0_0_10px_rgba(56,189,248,0.85)] animate-sparkle" style={{ animationDelay: '4.0s' }}>
        ★
      </div>
    </div>
  );
};
