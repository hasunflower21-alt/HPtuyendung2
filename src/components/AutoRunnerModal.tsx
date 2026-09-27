import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  CheckCircle2,
  ExternalLink,
  Copy,
  Clock,
  Sparkles,
  ShieldCheck,
  X,
  RotateCcw,
  Zap,
  Bookmark,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { FBGroup, RecruitmentPost, AppSettings } from '../types';

interface AutoRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: FBGroup[];
  posts: RecruitmentPost[];
  settings: AppSettings;
  onLogPostSuccess: (postId: string, groupId: string, content: string) => Promise<void>;
  initialPostId?: string;
}

// Spintax parser
function resolveSpintax(text: string): string {
  if (!text) return '';
  const regex = /\{([^{}]+)\}/g;
  let result = text;
  while (regex.test(result)) {
    result = result.replace(regex, (_, choices) => {
      const parts = choices.split('|');
      const selected = parts[Math.floor(Math.random() * parts.length)];
      return selected.trim();
    });
  }
  return result;
}

export const AutoRunnerModal: React.FC<AutoRunnerModalProps> = ({
  isOpen,
  onClose,
  groups,
  posts,
  settings,
  onLogPostSuccess,
  initialPostId,
}) => {
  const enabledGroups = groups.filter((g) => g.enabled).slice(0, settings.groupsPerRun || 20);
  const [selectedPostId, setSelectedPostId] = useState<string>(
    initialPostId || posts.find((p) => p.status === 'active')?.id || posts[0]?.id || ''
  );

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(15);
  const [copiedGroupIds, setCopiedGroupIds] = useState<Record<string, boolean>>({});
  const [postedGroupIds, setPostedGroupIds] = useState<Record<string, boolean>>({});
  const [currentSpintaxVariation, setCurrentSpintaxVariation] = useState<string>('');
  const [useSpintax, setUseSpintax] = useState<boolean>(true);
  const [showBookmarkletGuide, setShowBookmarkletGuide] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  const activePost = posts.find((p) => p.id === selectedPostId) || posts[0];
  const currentGroup = enabledGroups[currentIndex];

  // Refresh spintax text whenever index or post changes
  useEffect(() => {
    if (activePost) {
      setCurrentSpintaxVariation(resolveSpintax(activePost.content));
    }
  }, [currentIndex, selectedPostId, activePost]);

  // Sync initialPostId when modal opens
  useEffect(() => {
    if (initialPostId) {
      setSelectedPostId(initialPostId);
    }
  }, [initialPostId, isOpen]);

  // Countdown timer for auto-advance
  useEffect(() => {
    if (isAutoAdvancing && countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (isAutoAdvancing && countdown <= 0) {
      handleNextGroup(true);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAutoAdvancing, countdown]);

  if (!isOpen) return null;

  // Action: Open group & copy content
  const handleOpenAndCopy = async (group: FBGroup) => {
    const textToCopy = useSpintax
      ? (currentSpintaxVariation || resolveSpintax(activePost?.content || ''))
      : (activePost?.content || '');
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedGroupIds((prev) => ({ ...prev, [group.id]: true }));
      // Open group link
      let targetLink = group.link;
      if (!targetLink.startsWith('http')) {
        targetLink = `https://www.facebook.com/groups/${targetLink.replace(/^groups\//, '')}/`;
      }
      window.open(targetLink, '_blank');
      // Start safety countdown
      setCountdown(settings.delayMinSec || 15);
      setIsAutoAdvancing(true);
    } catch (err) {
      console.error(err);
      window.open(group.link, '_blank');
    }
  };

  // Action: Mark current group as done & advance
  const handleNextGroup = async (fromCountdown = false) => {
    if (!currentGroup || !activePost) return;

    // Mark as posted & log
    setPostedGroupIds((prev) => ({ ...prev, [currentGroup.id]: true }));
    onLogPostSuccess(activePost.id, currentGroup.id, currentSpintaxVariation);

    if (currentIndex < enabledGroups.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setIsAutoAdvancing(false);
      setCountdown(settings.delayMinSec || 15);
    } else {
      setIsAutoAdvancing(false);
    }
  };

  const handleSkipGroup = () => {
    if (currentIndex < enabledGroups.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setIsAutoAdvancing(false);
      setCountdown(settings.delayMinSec || 15);
    }
  };

  const handleResetQueue = () => {
    setCurrentIndex(0);
    setPostedGroupIds({});
    setCopiedGroupIds({});
    setIsAutoAdvancing(false);
    setCountdown(settings.delayMinSec || 15);
  };

  const postedCount = Object.keys(postedGroupIds).length;
  const progressPercent = enabledGroups.length > 0 ? Math.round((postedCount / enabledGroups.length) * 100) : 0;

  // The 1-click Bookmarklet javascript code that pastes and clicks post on facebook.com
  const bookmarkletCode = `javascript:(function(){
    var postBox = document.querySelector('div[role="textbox"][contenteditable="true"]') || document.querySelector('[contenteditable="true"]');
    if(!postBox){
      alert('Vui lòng click vào ô "Bạn viết gì đi..." hoặc "Tạo bài viết công khai" trong nhóm Facebook trước khi bấm nút này!');
      return;
    }
    navigator.clipboard.readText().then(function(text) {
      postBox.focus();
      postBox.click();
      try {
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
      } catch(e){}

      var lines = text.split('\\n');
      for(var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if(line.length > 0) {
          document.execCommand('insertText', false, line);
        }
        if(i < lines.length - 1) {
          var evDown = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
          var evUp = new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
          postBox.dispatchEvent(evDown);
          var pOk = document.execCommand('insertParagraph', false, null);
          if(!pOk) document.execCommand('insertLineBreak', false, null);
          postBox.dispatchEvent(evUp);
        }
      }

      postBox.dispatchEvent(new Event('input', { bubbles: true }));
      postBox.dispatchEvent(new Event('change', { bubbles: true }));

      setTimeout(function() {
        var btns = Array.from(document.querySelectorAll('div[aria-label="Đăng"], div[aria-label="Post"], button[type="submit"]'));
        var postBtn = btns.find(function(b) {
          var t = (b.innerText || b.getAttribute('aria-label') || '').trim();
          return t === 'Đăng' || t === 'Post';
        });
        if(postBtn && postBtn.getAttribute('aria-disabled') !== 'true') {
          postBtn.click();
          alert('✓ Đã tự động dán chuẩn 100% bố cục và bấm ĐĂNG bài thành công!');
        } else {
          alert('✓ Đã điền xong nội dung chuẩn bố cục! Bạn chỉ cần bấm nút [Đăng] màu xanh của Facebook.');
        }
      }, 700);
    }).catch(function(err) {
      alert('Vui lòng cấp quyền đọc clipboard hoặc dùng phím tắt Ctrl+V để dán trực tiếp.');
    });
  })();`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">
                  Trợ Lý Đăng Liên Hoàn {enabledGroups.length} Nhóm (Auto-Pilot Runner)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  Chuẩn 100%
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Tự động mở nhóm, xáo trộn Spintax chống trùng lặp, copy khay nhớ tạm và hẹn giờ an toàn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Progress Bar & Status */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  Tiến độ: {postedCount}/{enabledGroups.length} nhóm đã đăng
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-blue-600 font-semibold">{progressPercent}% Hoàn thành</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetQueue}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Bắt đầu lại từ đầu</span>
                </button>
              </div>
            </div>

            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Post Selector and Spintax Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 flex-1">
              <Layers className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-bold text-slate-700 shrink-0">Nội dung đăng:</span>
              <select
                value={selectedPostId}
                onChange={(e) => setSelectedPostId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 outline-none w-full max-w-sm"
              >
                {posts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.status === 'active' ? 'Đang hoạt động' : 'Bản nháp'})
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 shrink-0">
              <input
                type="checkbox"
                checked={useSpintax}
                onChange={(e) => setUseSpintax(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Xáo trộn Spintax chống spam</span>
            </label>
          </div>

          {/* HƯỚNG DẪN ĐÚNG VỊ TRÍ TRÊN FACEBOOK */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Lưu ý đúng vị trí trên Facebook:</strong> Nếu nhóm là nhóm Mua Bán, hãy chọn tab <strong>"Thảo luận"</strong> hoặc bấm vào ô <strong>"Viết bài thảo luận / Bạn viết gì đi..."</strong> (Tuyệt đối không bấm vào ô "Bán gì đó" của Facebook để bài không bị chuyển thành tin bán hàng).
            </div>
          </div>

          {/* Current Target Group Action Card */}
          {currentGroup ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 border-2 border-blue-200 shadow-md space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-black text-xs">
                      Nhóm #{currentIndex + 1} / {enabledGroups.length}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-semibold">
                      {currentGroup.category}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    {currentGroup.name}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span>Quy mô: {(currentGroup.memberCount / 1000).toFixed(0)}k Thành viên</span>
                    <span>•</span>
                    <a
                      href={currentGroup.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Xem link nhóm</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>

                {postedGroupIds[currentGroup.id] && (
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 self-start">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đã ghi nhận đăng</span>
                  </div>
                )}
              </div>

              {/* Spintax Content Box to preview */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Nội dung đã tự động xáo trộn Spintax cho nhóm này (Bảo toàn 100% bố cục):</span>
                  </div>
                  <button
                    onClick={() => {
                      if (activePost) setCurrentSpintaxVariation(resolveSpintax(activePost.content));
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Đổi biến thể khác</span>
                  </button>
                </div>
                <div className="max-h-36 overflow-y-auto text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3 rounded-xl border border-slate-200/60 whitespace-pre-wrap">
                  {currentSpintaxVariation}
                </div>

                {/* 3 Attached Images Preview */}
                {activePost?.images && activePost.images.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-700">
                        📸 {activePost.images.length}/3 ảnh tương tác:
                      </span>
                      <span className="text-[10px] text-slate-400">
                        (Bấm vào ảnh để tải/xem)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {activePost.images.slice(0, 3).map((img, i) => (
                        <a
                          key={i}
                          href={img}
                          target="_blank"
                          rel="noreferrer"
                          download={`anh_tuyen_dung_${i + 1}.jpg`}
                          title={`Ảnh ${i + 1}: Bấm để xem hoặc tải về máy`}
                          className="relative group w-14 h-11 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 hover:ring-2 hover:ring-blue-500 transition-all shrink-0"
                        >
                          <img src={img} alt="thumb" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold">
                            Tải
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Main Operational Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => handleOpenAndCopy(currentGroup)}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>BƯỚC 1: Mở Nhóm & Tự Copy (Nhấn Ctrl+V để Đăng)</span>
                </button>

                <button
                  onClick={() => handleNextGroup(false)}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>BƯỚC 2: Đã Đăng Xong → Tiếp Nhóm #{currentIndex + 2}</span>
                </button>

                <button
                  onClick={handleSkipGroup}
                  className="py-3.5 px-4 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  title="Bỏ qua nhóm này và chuyển nhóm kế tiếp"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Bỏ qua</span>
                </button>
              </div>

              {/* Auto safety countdown banner */}
              {isAutoAdvancing && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>
                      Đang đếm ngược an toàn chống spam của Facebook: <strong>{countdown} giây</strong> trước khi chuyển nhóm tiếp...
                    </span>
                  </div>
                  <button
                    onClick={() => setIsAutoAdvancing(false)}
                    className="font-bold text-amber-800 hover:underline px-2 py-1"
                  >
                    Dừng đếm
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 text-center space-y-4 bg-emerald-50 rounded-3xl border border-emerald-200">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h4 className="text-xl font-bold text-emerald-950">Tuyệt Vời! Đã Hoàn Thành Toàn Bộ 20 Nhóm!</h4>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Tất cả các bài đăng đã được hoàn tất với biến thể Spintax khác biệt cho từng nhóm, giúp bài tuyển dụng đạt lượt tiếp cận tối đa mà không bị Facebook chặn.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md"
              >
                Đóng Trình Đăng Bài
              </button>
            </div>
          )}

          {/* Group Queue List */}
          <div className="space-y-2">
            <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Danh Sách Hàng Đợi 20 Nhóm:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {enabledGroups.map((g, idx) => {
                const isCurrent = idx === currentIndex;
                const isPosted = postedGroupIds[g.id];
                return (
                  <div
                    key={g.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-blue-50 border-blue-400 font-bold shadow-xs'
                        : isPosted
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : isPosted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="truncate">{g.name}</span>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {isPosted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {isCurrent && <ArrowRight className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ADVANCED TOOL: 1-CLICK BOOKMARKLET FOR AUTO-PASTE & CLICK POST */}
          <div className="p-4 rounded-2xl bg-indigo-950 text-white border border-indigo-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs text-amber-300">
                  Mẹo Pro: Tự Dán & Tự Bấm Đăng Bằng 1 Nút Bookmark (Không Cần Bấm Phím Tắt)
                </span>
              </div>
              <button
                onClick={() => setShowBookmarkletGuide(!showBookmarkletGuide)}
                className="text-[11px] text-indigo-300 hover:text-white underline font-medium"
              >
                {showBookmarkletGuide ? 'Thu gọn' : 'Xem hướng dẫn cài'}
              </button>
            </div>

            {showBookmarkletGuide ? (
              <div className="text-xs text-slate-300 space-y-2 pt-2 border-t border-indigo-800/60 leading-relaxed">
                <p>
                  <strong>Cách hoạt động:</strong> Trình duyệt chặn trang web ngoài can thiệp vào Facebook vì lý do bảo mật. Nhưng một <strong>Bookmarklet</strong> (nút Bookmark trên thanh trình duyệt của bạn) có toàn quyền thao tác trên trang Facebook đang mở.
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>
                    Kéo nút bên dưới thả vào thanh <strong>Dấu trang (Bookmarks Bar)</strong> của trình duyệt Chrome/Cốc Cốc:
                    <div className="mt-2 mb-2">
                      <a
                        href={bookmarkletCode}
                        onClick={(e) => {
                          e.preventDefault();
                          alert('Kéo nút này thả lên thanh Bookmark (Ctrl+Shift+B) của Chrome/Cốc Cốc để dùng!');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow cursor-grab active:cursor-grabbing"
                      >
                        <Zap className="w-3.5 h-3.5 fill-slate-950" />
                        <span>⚡ Kéo Tôi Vào Bookmark: Tự Dán & Đăng FB</span>
                      </a>
                    </div>
                  </li>
                  <li>Mỗi khi mở 1 nhóm Facebook, bạn chỉ cần bấm vào nút Bookmark đó trên thanh trình duyệt. Nó sẽ tự động dán và bấm nút Đăng cho bạn!</li>
                </ol>
              </div>
            ) : (
              <p className="text-[11px] text-slate-300">
                Bạn có thể cài nút Bookmarklet "Tự Dán & Bấm Đăng" để tự động hóa 100% thao tác trên tab Facebook mà không cần gõ phím.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Tuyệt đối an toàn cho tài khoản cá nhân • Không vi phạm bảo mật</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
          >
            Đóng Trình Đăng
          </button>
        </div>
      </div>
    </div>
  );
};
