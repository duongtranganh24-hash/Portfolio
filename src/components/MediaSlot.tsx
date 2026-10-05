import React, { useState, useRef, useMemo } from 'react';
import { MediaItem } from '../types';
import {
  Upload,
  Link as LinkIcon,
  Sparkles,
  RotateCcw,
  Maximize2,
  X,
  Film,
  Image as ImageIcon,
  EyeOff,
  Eye,
  Trash2,
  AlertCircle,
  Loader2,
  Play,
  FileVideo,
} from 'lucide-react';
import { DEMO_PRESETS } from '../data/defaultData';
import { parseVideoUrl, saveMediaBlob, deleteMediaBlob } from '../utils/mediaStorage';

interface MediaSlotProps {
  item: MediaItem;
  onUpdate: (id: string, updates: Partial<MediaItem>) => void;
  onToggleHide?: (id: string) => void;
  isEditMode?: boolean;
  className?: string;
  minHeight?: string;
  dark?: boolean;
  theme?: 'white' | 'yellow' | 'blue' | 'dark';
}

export const MediaSlot: React.FC<MediaSlotProps> = ({
  item,
  onUpdate,
  onToggleHide,
  isEditMode = false,
  className = '',
  minHeight = '320px',
  dark = false,
  theme = 'white',
}) => {
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect whether the video is vertical (TikTok / YouTube Shorts / Reels 9:16)
  const isShortsOrTikTok = Boolean(
    item.url?.includes('shorts') ||
    item.url?.includes('tiktok') ||
    item.videoType === 'tiktok'
  );

  const isVertical = Boolean(
    (videoDimensions && videoDimensions.height > videoDimensions.width) ||
    isShortsOrTikTok ||
    (item.type === 'video' && item.aspectRatio === '9/16')
  );

  // Exact aspect ratio matching the uploaded video's intrinsic dimensions
  const computedAspectRatio = useMemo(() => {
    if (item.type !== 'video' || !item.url) return undefined;
    if (videoDimensions && videoDimensions.width && videoDimensions.height) {
      return `${videoDimensions.width} / ${videoDimensions.height}`;
    }
    if (isShortsOrTikTok || item.aspectRatio === '9/16') {
      return '9 / 16';
    }
    if (item.videoType === 'youtube' || item.videoType === 'gdrive' || item.aspectRatio === '16/9') {
      return '16 / 9';
    }
    return undefined;
  }, [item.type, item.url, item.aspectRatio, item.videoType, videoDimensions, isShortsOrTikTok]);

  // Clean className so that preset aspect classes like aspect-video or aspect-[4/5] don't conflict with intrinsic media ratio
  const cleanedClassName = useMemo(() => {
    if (!item.url || !computedAspectRatio) return className;
    return className
      .replace(/\baspect-(?:square|video|\[[^\]]+\])\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, [className, item.url, computedAspectRatio]);

  // If item is hidden:
  if (item.hidden) {
    if (!isEditMode) {
      return null; // completely omitted in preview / export
    }
    // In edit mode, show a small graceful bar to allow unhiding
    return (
      <div className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-white/40 backdrop-blur-md flex items-center justify-between text-xs text-slate-500 my-2 animate-in fade-in">
        <div className="flex items-center gap-2">
          <EyeOff size={16} className="text-slate-400" />
          <span>
            Khung ảnh <strong className="text-slate-700 font-semibold">{item.title}</strong> đang được ẩn.
          </span>
        </div>
        <button
          type="button"
          onClick={() => onToggleHide?.(item.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-[#C5E4F8] text-[#19232D] font-bold text-xs shadow-sm transition-colors cursor-pointer"
        >
          <Eye size={13} />
          <span>Hiện lại khung này</span>
        </button>
      </div>
    );
  }

  // File upload handler using instant Blob URLs + IndexedDB persistence (No Base64 freezing, No 5MB localStorage quota limit!)
  const processUploadedFile = async (file: File) => {
    setVideoError(null);
    setIsUploading(true);

    try {
      const isVideoFile =
        file.type.startsWith('video/') ||
        /\.(mp4|mov|webm|m4v|mkv|avi|3gp)$/i.test(file.name);
      const isImageFile =
        file.type.startsWith('image/') ||
        /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(file.name);

      const finalType = isVideoFile ? 'video' : isImageFile ? 'image' : (item.type || 'image');

      // Instant hardware-accelerated playback
      const blobUrl = URL.createObjectURL(file);

      // Persist in IndexedDB for reliable offline & reload persistence
      await saveMediaBlob(item.id, file);

      // If video, read intrinsic width & height to immediately adapt frame!
      if (finalType === 'video') {
        const tempVid = document.createElement('video');
        tempVid.preload = 'metadata';
        tempVid.src = blobUrl;
        tempVid.onloadedmetadata = () => {
          if (tempVid.videoWidth && tempVid.videoHeight) {
            setVideoDimensions({
              width: tempVid.videoWidth,
              height: tempVid.videoHeight,
            });
            const isVert = tempVid.videoHeight > tempVid.videoWidth;
            onUpdate(item.id, {
              url: blobUrl,
              type: 'video',
              videoType: 'local',
              aspectRatio: isVert ? '9/16' : '16/9',
              isLocalBlob: true,
            });
          }
        };
      }

      onUpdate(item.id, {
        url: blobUrl,
        type: finalType,
        videoType: finalType === 'video' ? 'local' : undefined,
        isLocalBlob: true,
      });
    } catch (err) {
      console.error('Lỗi khi tải tệp media:', err);
      setVideoError('Có lỗi khi đọc file media. Vui lòng thử lại với file MP4 chuẩn.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedFile(file);
    e.target.value = '';
  };

  // Drag and drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processUploadedFile(file);
  };

  // URL save handler supporting YouTube, YouTube Shorts, Google Drive, TikTok, and direct MP4/WebM
  const handleSaveUrl = () => {
    if (!urlInput.trim()) return;
    setVideoError(null);
    const parsed = parseVideoUrl(urlInput.trim());

    const isVideoSlot = parsed.type === 'video' || (item.type === 'video' && parsed.type !== 'image');
    const finalType = isVideoSlot ? 'video' : 'image';
    const finalVideoType = isVideoSlot ? (parsed.videoType || 'url') : undefined;

    const isVert = parsed.videoType === 'tiktok' || urlInput.includes('shorts') || urlInput.includes('tiktok');

    onUpdate(item.id, {
      url: parsed.directUrl,
      type: finalType,
      videoType: finalVideoType,
      aspectRatio: isVert ? '9/16' : isVideoSlot ? '16/9' : item.aspectRatio,
      isLocalBlob: false,
    });
    setUrlInput('');
    setIsUrlModalOpen(false);
  };

  // Load preset demo
  const handleLoadDemo = () => {
    setVideoError(null);
    const preset = DEMO_PRESETS[item.id];
    if (preset) {
      onUpdate(item.id, {
        url: preset.url,
        videoType: preset.videoType,
        isLocalBlob: false,
      });
    }
  };

  // Clear slot back to blank placeholder and cleanup IndexedDB
  const handleReset = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setVideoError(null);
    setVideoDimensions(null);
    await deleteMediaBlob(item.id);
    onUpdate(item.id, {
      url: undefined,
      videoType: undefined,
      isLocalBlob: false,
    });
  };

  return (
    <>
      <div
        className={`relative group w-full overflow-hidden rounded-3xl transition-all duration-300 glass-sheen ${
          isVertical ? 'max-w-[420px] mx-auto' : ''
        } ${cleanedClassName}`}
        style={{
          minHeight: !item.url ? minHeight : undefined,
          aspectRatio: item.url && computedAspectRatio ? computedAspectRatio : undefined,
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={item.type === 'video' ? 'video/*,image/*' : 'image/*,video/*'}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* CASE 1: EMPTY / BLANK PLACEHOLDER */}
        {!item.url ? (
          <div
            className={`w-full h-full min-h-[inherit] flex flex-col items-center justify-center text-center p-6 sm:p-9 transition-all duration-300 border-2 rounded-3xl ${
              isDragOver
                ? 'border-[#82BFE7] bg-[#E8F4FC]/80 scale-[0.99] shadow-xl'
                : dark
                ? 'glass-panel-dark text-slate-200'
                : theme === 'yellow'
                ? 'glass-panel-yellow text-[#19232D]'
                : theme === 'blue'
                ? 'glass-panel-blue text-[#19232D]'
                : 'glass-panel text-[#19232D]'
            }`}
          >
            {/* Top quick actions (Hide/Omit slot if user desires) */}
            {onToggleHide && (
              <button
                type="button"
                onClick={() => onToggleHide(item.id)}
                className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/70 hover:bg-rose-100 text-slate-500 hover:text-rose-700 text-[11px] font-semibold transition-all border border-slate-200/80 shadow-sm cursor-pointer"
                title="Bỏ / Ẩn khung hình ảnh này khỏi portfolio"
              >
                <EyeOff size={12} />
                <span>Bỏ khung này</span>
              </button>
            )}

            {/* Visual Icon with glossy glass orb */}
            <div
              className={`w-15 h-15 rounded-2xl flex items-center justify-center text-2xl font-serif mb-3.5 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-[0_8px_20px_rgba(130,191,231,0.25)] ${
                dark
                  ? 'border border-white/25 bg-white/10 text-white'
                  : 'border border-white/90 bg-gradient-to-br from-[#FDF6DE] to-[#C5E4F8] text-[#19232D]'
              }`}
            >
              {item.icon}
            </div>

            {/* Label with clean line height */}
            <strong className={`text-base font-vietnam font-bold tracking-wide mb-1.5 uppercase ${dark ? 'text-white' : 'text-[#19232D]'}`}>
              {item.title}
            </strong>

            {/* Subtitle / User Guide */}
            <p className="text-xs max-w-md mx-auto leading-relaxed mb-5 text-[#5A6A7E]">
              {item.subtitle}
            </p>

            {/* Action buttons to easily put image/clip */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-0.5 z-10">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full border border-white/90 bg-white/90 hover:bg-[#FBE8A6] text-[#19232D] shadow-[0_4px_16px_rgba(30,41,59,0.06)] hover:shadow-md transition-all active:translate-y-0.5 cursor-pointer"
                title="Tải ảnh hoặc video từ máy tính"
              >
                <Upload size={13} />
                <span>Tải tệp lên</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUrlModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full border border-white/90 bg-white/90 hover:bg-[#C5E4F8] text-[#19232D] shadow-[0_4px_16px_rgba(30,41,59,0.06)] hover:shadow-md transition-all active:translate-y-0.5 cursor-pointer"
                title="Dán link ảnh hoặc link video YouTube/MP4"
              >
                <LinkIcon size={13} />
                <span>Dán URL</span>
              </button>

              {DEMO_PRESETS[item.id] && (
                <button
                  type="button"
                  onClick={handleLoadDemo}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full border border-white/80 bg-white/50 text-[#19232D] hover:bg-white transition-all cursor-pointer shadow-sm"
                  title="Thử với hình ảnh/video mẫu"
                >
                  <Sparkles size={12} className="text-amber-500" />
                  <span>Ảnh mẫu</span>
                </button>
              )}
            </div>

            {/* Loading Indicator while processing file */}
            {isUploading && (
              <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5">
                <Loader2 size={28} className="animate-spin text-[#0284C7]" />
                <span className="text-xs font-bold text-[#19232D]">Đang xử lý tệp media...</span>
              </div>
            )}

            <span className="text-[10px] tracking-widest uppercase mt-4 font-semibold text-slate-400">
              Kéo &amp; thả file trực tiếp vào khung
            </span>
          </div>
        ) : (
          /* CASE 2: POPULATED MEDIA CONTENT */
          <div className="relative w-full h-full min-h-[inherit] bg-black/90 flex items-center justify-center overflow-hidden rounded-3xl border border-white/70 shadow-lg">
            {item.type === 'video' ? (
              videoError ? (
                /* VIDEO ERROR RECOVERY CARD */
                <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center bg-slate-900/95 text-white rounded-3xl z-10">
                  <div className="w-13 h-13 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                    <AlertCircle size={26} />
                  </div>
                  <h4 className="font-vietnam font-bold text-sm sm:text-base mb-1.5 text-amber-200">
                    Không thể phát trực tiếp video này
                  </h4>
                  <p className="text-xs text-slate-300 max-w-md leading-relaxed mb-4">
                    {videoError}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#19232D] text-xs font-bold hover:bg-[#FBE8A6] transition-all cursor-pointer shadow-sm"
                    >
                      <Upload size={12} />
                      <span>Chọn file MP4 khác</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUrlModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#82BFE7] text-[#19232D] text-xs font-bold hover:bg-[#C5E4F8] transition-all cursor-pointer shadow-sm"
                    >
                      <LinkIcon size={12} />
                      <span>Dán link YouTube / Drive / TikTok</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Hủy</span>
                    </button>
                  </div>
                </div>
              ) : item.videoType === 'youtube' ? (
                <iframe
                  src={parseVideoUrl(item.url).embedUrl}
                  title={item.title}
                  className="w-full h-full aspect-video border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : item.videoType === 'gdrive' ? (
                <iframe
                  src={parseVideoUrl(item.url).embedUrl}
                  title={item.title}
                  className="w-full h-full aspect-video border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : item.videoType === 'tiktok' ? (
                <iframe
                  src={parseVideoUrl(item.url).embedUrl}
                  title={item.title}
                  className="w-full h-full aspect-[9/16] max-w-[360px] mx-auto border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={item.url}
                  controls
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    setVideoError(null);
                    const vid = e.currentTarget;
                    if (vid.videoWidth && vid.videoHeight) {
                      setVideoDimensions({
                        width: vid.videoWidth,
                        height: vid.videoHeight,
                      });
                      const isVert = vid.videoHeight > vid.videoWidth;
                      onUpdate(item.id, {
                        aspectRatio: isVert ? '9/16' : '16/9',
                      });
                    }
                  }}
                  onCanPlay={() => {
                    setVideoError(null);
                  }}
                  className="w-full h-full object-contain block mx-auto rounded-3xl bg-black"
                  onError={(e) => {
                    const err = e.currentTarget.error;
                    if (err && err.code === 4) {
                      setVideoError(
                        'Video này dùng codec/định dạng (như Apple MOV/HEVC) mà trình duyệt hiện tại không hỗ trợ phát trực tiếp. Bạn nên dùng file MP4 chuẩn (H.264), hoặc tải lên YouTube/Drive rồi dán link vào nhé!'
                      );
                    }
                  }}
                >
                  <source src={item.url} type="video/mp4" />
                  <source src={item.url} type="video/webm" />
                  <source src={item.url} type="video/quicktime" />
                  Trình duyệt không hỗ trợ thẻ video này.
                </video>
              )
            ) : (
              <img
                src={item.url}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}

            {/* Hover overlay with glossy glass controls */}
            <div className="absolute inset-0 bg-[#19232D]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3 p-4 pointer-events-none group-hover:pointer-events-auto backdrop-blur-sm">
              <span className="text-white text-xs font-bold tracking-wider uppercase bg-[#19232D]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-md flex items-center gap-1.5">
                <span>{item.type === 'video' ? '🎬 Video Clip' : '🖼️ Hình Ảnh'} • {item.title}</span>
                {videoDimensions && (
                  <span className="text-amber-300 text-[11px] font-semibold">
                    ({videoDimensions.width}×{videoDimensions.height} · {isVertical ? '9:16 dọc' : 'ngang'})
                  </span>
                )}
              </span>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full bg-white text-[#19232D] hover:bg-[#FBE8A6] transition-all shadow-md cursor-pointer"
                >
                  <Upload size={13} />
                  <span>Đổi tệp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full bg-white text-[#19232D] hover:bg-[#C5E4F8] transition-all shadow-md cursor-pointer"
                >
                  <LinkIcon size={13} />
                  <span>Đổi Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full bg-[#19232D] text-white border border-white/30 hover:bg-black transition-all cursor-pointer"
                  title="Xem toàn màn hình"
                >
                  <Maximize2 size={13} />
                  <span>Xem lớn</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-md cursor-pointer"
                  title="Xóa và trở về khung trống"
                >
                  <RotateCcw size={13} />
                  <span>Xóa ảnh</span>
                </button>

                {onToggleHide && (
                  <button
                    type="button"
                    onClick={() => onToggleHide(item.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-md cursor-pointer"
                    title="Bỏ khung này hoàn toàn"
                  >
                    <EyeOff size={13} />
                    <span>Bỏ khung này</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: INPUT URL */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel p-7 text-[#19232D] relative shadow-2xl">
            <button
              onClick={() => setIsUrlModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full border border-slate-300 bg-white/80 hover:bg-[#FBE8A6] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="p-2.5 rounded-2xl bg-[#E8F4FC] border border-[#C5E4F8]">
                {item.type === 'video' ? <Film size={18} /> : <ImageIcon size={18} />}
              </span>
              <div>
                <h3 className="font-vietnam font-bold text-lg uppercase tracking-wide">
                  Chèn URL {item.type === 'video' ? 'Video' : 'Hình Ảnh'}
                </h3>
                <p className="text-xs text-[#5A6A7E]">{item.title}</p>
              </div>
            </div>

            <p className="text-xs text-[#5A6A7E] mb-3.5 leading-relaxed">
              {item.type === 'video'
                ? 'Hỗ trợ link YouTube (cả video ngang & YouTube Shorts), link Google Drive, TikTok video hoặc link trực tiếp file .mp4.'
                : 'Dán đường dẫn trực tiếp đến hình ảnh (PNG, JPG, WebP, GIF, SVG).'
              }
            </p>

            <input
              type="url"
              placeholder={item.type === 'video' ? 'YouTube / Shorts / Drive / TikTok hoặc file.mp4' : 'https://example.com/image.jpg'}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-300/80 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#82BFE7] mb-4 shadow-inner"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveUrl();
              }}
            />

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-full text-[#5A6A7E] hover:bg-black/5 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveUrl}
                disabled={!urlInput.trim()}
                className="px-5 py-2.5 text-xs font-bold rounded-full border border-[#FBE8A6] bg-[#FBE8A6] hover:bg-[#F9DD7E] disabled:opacity-50 shadow-md cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isFullscreen && item.url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white text-black border border-black hover:bg-[#FBE8A6] transition-transform hover:scale-110 z-10 cursor-pointer shadow-lg"
          >
            <X size={20} />
          </button>

          <div
            className="max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {item.type === 'video' ? (
              item.videoType === 'youtube' || item.videoType === 'gdrive' || item.videoType === 'tiktok' ? (
                <iframe
                  src={parseVideoUrl(item.url).embedUrl}
                  title={item.title}
                  className="w-full aspect-video border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={item.url} controls autoPlay className="max-h-[80vh] w-auto max-w-full" />
              )
            ) : (
              <img
                src={item.url}
                alt={item.title}
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl"
              />
            )}
            <div className="w-full bg-[#19232D] text-white p-3.5 px-6 flex items-center justify-between">
              <span className="font-vietnam font-bold text-sm uppercase">{item.title}</span>
              <span className="text-xs text-slate-300">{item.subtitle}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
