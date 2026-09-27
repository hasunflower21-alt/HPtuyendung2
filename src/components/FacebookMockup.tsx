import React, { useState } from 'react';
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Globe,
  MoreHorizontal,
  CheckCircle2,
  Eye,
  EyeOff,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  ZoomIn,
} from 'lucide-react';

interface FacebookMockupProps {
  userName: string;
  userAvatar: string;
  groupName?: string;
  timeText?: string;
  content: string;
  images?: string[];
  imageUrl?: string; // backwards compatibility
  imageLayout?: 'top_large' | 'left_large' | 'equal';
  imageFit?: 'cover' | 'contain';
  defaultOverviewMode?: boolean;
}

export const FacebookMockup: React.FC<FacebookMockupProps> = ({
  userName,
  userAvatar,
  groupName,
  timeText = 'Vừa xong',
  content,
  images,
  imageUrl,
  imageLayout = 'top_large',
  imageFit = 'cover',
  defaultOverviewMode = true,
}) => {
  const [overviewMode, setOverviewMode] = useState<boolean>(defaultOverviewMode);
  const [activeLayout, setActiveLayout] = useState<'top_large' | 'left_large' | 'equal'>(imageLayout);
  const [activeFit, setActiveFit] = useState<'cover' | 'contain'>(imageFit);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(38);
  const [activeSpintaxSeed, setActiveSpintaxSeed] = useState<number>(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  React.useEffect(() => {
    setActiveLayout(imageLayout);
  }, [imageLayout]);

  React.useEffect(() => {
    setActiveFit(imageFit);
  }, [imageFit]);

  // Normalize images list (max 3 images)
  const imageList: string[] = (images && images.length > 0)
    ? images.filter(Boolean).slice(0, 3)
    : (imageUrl ? [imageUrl] : []);

  // Spintax resolver for preview: if content has {A|B}, resolve consistently
  const resolveSpintaxText = (raw: string) => {
    if (!raw) return '';
    return raw.replace(/\{([^{}]+)\}/g, (_, choices) => {
      const parts = choices.split('|');
      // Use activeSpintaxSeed to rotate through options
      const idx = activeSpintaxSeed % parts.length;
      return (parts[idx] || parts[0]).trim();
    });
  };

  const hasSpintax = /\{([^{}]+)\}/.test(content);
  const displayContent = resolveSpintaxText(content);
  const lineCount = (displayContent.match(/\n/g) || []).length + 1;
  const isLong = displayContent.length > 280 || lineCount > 6;

  // If in overview mode, we always show the full content so users can review the entire layout
  const shouldTruncate = isLong && !expanded && !overviewMode;
  const renderedText = shouldTruncate ? displayContent.slice(0, 240) + '...' : displayContent;

  const toggleLike = () => {
    if (liked) {
      setLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextLightboxImage = () => {
    if (lightboxIndex !== null && imageList.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % imageList.length);
    }
  };

  const prevLightboxImage = () => {
    if (lightboxIndex !== null && imageList.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + imageList.length) % imageList.length);
    }
  };

  return (
    <div className="space-y-2">
      {/* Overview & Layout Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setOverviewMode(!overviewMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              overviewMode
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
            title="Xem toàn cảnh bố cục bài viết không bị nút 'Xem thêm' che khuất"
          >
            {overviewMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>{overviewMode ? 'Chế độ xem bao quát 100%' : 'Chế độ mô phỏng Facebook'}</span>
          </button>

          {imageList.length === 3 && (
            <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setActiveLayout('top_large')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeLayout === 'top_large' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Bố cục 1 to trên + 2 nhỏ dưới"
              >
                1 To Trên
              </button>
              <button
                type="button"
                onClick={() => setActiveLayout('left_large')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeLayout === 'left_large' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Bố cục 1 to trái + 2 nhỏ phải"
              >
                1 To Trái
              </button>
              <button
                type="button"
                onClick={() => setActiveLayout('equal')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeLayout === 'equal' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Bố cục 3 cột đều nhau"
              >
                3 Cột Đều
              </button>
            </div>
          )}

          {hasSpintax && (
            <button
              type="button"
              onClick={() => setActiveSpintaxSeed((s) => s + 1)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Đổi sang biến thể Spintax khác để xem các câu từ xoay tua"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Đổi Spintax</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>{displayContent.length} ký tự</span>
          <span>•</span>
          <span>{lineCount} dòng</span>
          <span>•</span>
          <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {imageList.length}/3 ảnh tương tác
          </span>
        </div>
      </div>

      {/* Main Facebook Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden font-sans max-w-xl mx-auto text-slate-900 transition-all hover:shadow-md">
        {/* Post Header */}
        <div className="p-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5">
                <CheckCircle2 className="w-3 h-3" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm text-slate-900 hover:underline cursor-pointer">
                  {userName || 'Nguyễn Văn Hoàn'}
                </span>
                {groupName && (
                  <>
                    <span className="text-slate-400 text-xs">▶</span>
                    <span className="font-semibold text-xs text-blue-700 hover:underline cursor-pointer truncate max-w-[200px]">
                      {groupName}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <span>{timeText}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-slate-400" title="Công khai">
                  <Globe className="w-3 h-3" />
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-1.5 py-0.2 rounded border border-emerald-200">
                  Chuẩn bố cục soạn
                </span>
              </div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Post Content with Strict Formatting Fidelity */}
        <div className="px-4 pb-3">
          <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans break-words selection:bg-blue-100">
            {renderedText}
          </div>
          {shouldTruncate && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs font-bold text-blue-600 hover:underline mt-1.5 focus:outline-none"
            >
              ... Xem thêm
            </button>
          )}
          {!overviewMode && expanded && (
            <button
              onClick={() => setExpanded(false)}
              className="text-xs font-semibold text-slate-500 hover:underline mt-1.5 focus:outline-none block"
            >
              Thu gọn
            </button>
          )}
        </div>

        {/* Post Images Layout (Up to 3 images with real Facebook Layout) */}
        {imageList.length > 0 && (
          <div className="relative bg-slate-950 overflow-hidden border-t border-b border-slate-100">
            {/* 1 IMAGE: Full Width */}
            {imageList.length === 1 && (
              <div
                onClick={() => openLightbox(0)}
                className="relative max-h-[420px] flex items-center justify-center cursor-pointer group bg-slate-950 overflow-hidden"
              >
                <img
                  src={imageList[0]}
                  alt="Ảnh tuyển dụng tương tác"
                  className={`w-full max-h-[420px] transition-transform duration-300 group-hover:scale-[1.01] ${
                    imageFit === 'contain' ? 'object-contain' : 'object-cover'
                  }`}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs">
                    <Maximize2 className="w-3 h-3" />
                    <span>Xem ảnh đầy đủ</span>
                  </span>
                </div>
              </div>
            )}

            {/* 2 IMAGES: Side-by-side 2 columns */}
            {imageList.length === 2 && (
              <div className="grid grid-cols-2 gap-1 bg-slate-200">
                {imageList.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => openLightbox(idx)}
                    className="relative h-64 bg-slate-900 overflow-hidden cursor-pointer group flex items-center justify-center"
                  >
                    <img
                      src={img}
                      alt={`Ảnh tương tác ${idx + 1}`}
                      className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${
                        imageFit === 'contain' ? 'object-contain' : 'object-cover'
                      }`}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Maximize2 className="w-3 h-3" />
                        <span>Ảnh {idx + 1}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3 IMAGES: Tailored Facebook 3-photo Grid */}
            {imageList.length === 3 && (
              <>
                {/* Style A: top_large (1 big top, 2 small bottom) */}
                {activeLayout === 'top_large' && (
                  <div className="flex flex-col gap-1 bg-slate-200">
                    {/* Top large image */}
                    <div
                      onClick={() => openLightbox(0)}
                      className="relative h-60 sm:h-72 bg-slate-900 overflow-hidden cursor-pointer group flex items-center justify-center"
                    >
                      <img
                        src={imageList[0]}
                        alt="Ảnh chính bài viết"
                        className={`w-full h-full transition-transform duration-300 group-hover:scale-102 ${
                          activeFit === 'contain' ? 'object-contain' : 'object-cover'
                        }`}
                      />
                      <div className="absolute top-2 left-2 bg-slate-950/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                        Ảnh chính (1/3)
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Maximize2 className="w-3 h-3" />
                          <span>Xem phóng to</span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom 2 images */}
                    <div className="grid grid-cols-2 gap-1">
                      {imageList.slice(1).map((img, idx) => (
                        <div
                          key={idx + 1}
                          onClick={() => openLightbox(idx + 1)}
                          className="relative h-40 bg-slate-900 overflow-hidden cursor-pointer group flex items-center justify-center"
                        >
                          <img
                            src={img}
                            alt={`Ảnh phụ ${idx + 2}`}
                            className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${
                              activeFit === 'contain' ? 'object-contain' : 'object-cover'
                            }`}
                          />
                          <div className="absolute top-2 left-2 bg-slate-950/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                            Ảnh {idx + 2}/3
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Style B: left_large (1 big left, 2 stacked right) */}
                {activeLayout === 'left_large' && (
                  <div className="grid grid-cols-2 gap-1 bg-slate-200 h-80 sm:h-96">
                    {/* Left big image */}
                    <div
                      onClick={() => openLightbox(0)}
                      className="relative h-full bg-slate-900 overflow-hidden cursor-pointer group flex items-center justify-center"
                    >
                      <img
                        src={imageList[0]}
                        alt="Ảnh chính"
                        className={`w-full h-full transition-transform duration-300 group-hover:scale-102 ${
                          activeFit === 'contain' ? 'object-contain' : 'object-cover'
                        }`}
                      />
                      <div className="absolute top-2 left-2 bg-slate-950/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                        Ảnh chính (1/3)
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                    </div>

                    {/* Right 2 stacked images */}
                    <div className="flex flex-col gap-1 h-full">
                      {imageList.slice(1).map((img, idx) => (
                        <div
                          key={idx + 1}
                          onClick={() => openLightbox(idx + 1)}
                          className="relative h-1/2 bg-slate-900 overflow-hidden cursor-pointer group flex items-center justify-center"
                        >
                          <img
                            src={img}
                            alt={`Ảnh phụ ${idx + 2}`}
                            className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${
                              activeFit === 'contain' ? 'object-contain' : 'object-cover'
                            }`}
                          />
                          <div className="absolute top-2 left-2 bg-slate-950/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                            Ảnh {idx + 2}/3
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Style C: equal (3 equal columns) */}
                {activeLayout === 'equal' && (
                  <div className="grid grid-cols-3 gap-1 bg-slate-200">
                    {imageList.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => openLightbox(idx)}
                        className="relative h-48 sm:h-56 bg-slate-900 overflow-hidden cursor-pointer group flex items-center justify-center"
                      >
                        <img
                          src={img}
                          alt={`Ảnh tương tác ${idx + 1}`}
                          className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${
                            activeFit === 'contain' ? 'object-contain' : 'object-cover'
                          }`}
                        />
                        <div className="absolute top-1.5 left-1.5 bg-slate-950/70 text-white text-[9px] font-medium px-1.5 py-0.5 rounded backdrop-blur-xs">
                          {idx + 1}/3
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Interaction Stats */}
        <div className="px-4 py-2.5 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] shadow-xs">
                👍
              </span>
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                ❤️
              </span>
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                🔥
              </span>
            </div>
            <span>{likesCount} người thích & thả tim</span>
          </div>
          <div className="flex items-center gap-3">
            <span>12 bình luận quan tâm</span>
            <span>6 lượt chia sẻ</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-2 py-1 flex items-center justify-between text-slate-600 text-xs font-semibold">
          <button
            onClick={toggleLike}
            className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-xl hover:bg-slate-100 transition-colors ${
              liked ? 'text-blue-600 font-bold' : ''
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-blue-600' : ''}`} />
            <span>Thích</span>
          </button>
          <button className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>Bình luận</span>
          </button>
          <button className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* Lightbox Modal when clicking image */}
      {lightboxIndex !== null && imageList[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
            title="Đóng (ESC)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image index indicator */}
          <div className="absolute top-4 left-4 text-xs font-semibold text-white/90 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
            Ảnh {lightboxIndex + 1} / {imageList.length} (Ảnh tương tác tuyển dụng)
          </div>

          {/* Prev button */}
          {imageList.length > 1 && (
            <button
              onClick={prevLightboxImage}
              className="absolute left-4 p-3 text-white/90 hover:text-white bg-white/10 hover:bg-white/25 rounded-full transition-all z-40"
              title="Ảnh trước"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next button */}
          {imageList.length > 1 && (
            <button
              onClick={nextLightboxImage}
              className="absolute right-4 p-3 text-white/90 hover:text-white bg-white/10 hover:bg-white/25 rounded-full transition-all z-40"
              title="Ảnh kế tiếp"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Main expanded image */}
          <div className="max-w-4xl max-h-[85vh] flex items-center justify-center overflow-hidden">
            <img
              src={imageList[lightboxIndex]}
              alt={`Xem ảnh ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Bottom Thumbnails */}
          {imageList.length > 1 && (
            <div className="absolute bottom-4 flex items-center gap-2 bg-black/60 p-2 rounded-xl backdrop-blur-xs">
              {imageList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === lightboxIndex ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
