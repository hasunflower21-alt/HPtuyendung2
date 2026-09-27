import React, { useState, useEffect } from 'react';
import {
  Play,
  Square,
  Clock,
  CheckCircle2,
  Users2,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Calendar,
  ExternalLink,
  RefreshCw,
  Zap,
  Package,
  Download,
} from 'lucide-react';
import { AppDataResponse } from '../types';
import { FacebookMockup } from './FacebookMockup';

interface DashboardTabProps {
  data: AppDataResponse;
  onRunNowClick: () => void;
  onStopRunClick: () => void;
  onRefreshData: () => void;
  onNavigateTab: (tab: 'dashboard' | 'posts' | 'groups' | 'settings' | 'logs' | 'guide') => void;
  onOpenAutoRunner: () => void;
  onOpenExtensionModal?: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  data,
  onRunNowClick,
  onStopRunClick,
  onRefreshData,
  onNavigateTab,
  onOpenAutoRunner,
  onOpenExtensionModal,
}) => {
  const { settings, groups, posts, logs, activeRun, nextRunInfo, stats } = data;

  const activePosts = posts.filter((p) => p.status === 'active');
  const nextPost = activePosts[0] || posts[0];
  const targetGroups = groups.filter((g) => g.enabled).slice(0, settings.groupsPerRun);

  // Time remaining countdown
  const [countdownText, setCountdownText] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      if (nextRunInfo.diffMs > 0) {
        let remainingSeconds = Math.max(0, Math.floor(nextRunInfo.diffMs / 1000));
        const hours = Math.floor(remainingSeconds / 3600);
        remainingSeconds %= 3600;
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;

        const pad = (n: number) => n.toString().padStart(2, '0');
        setCountdownText(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
      } else {
        setCountdownText(nextRunInfo.timeStr);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [nextRunInfo]);

  const progressPercent = activeRun.totalGroups
    ? Math.round((activeRun.currentIndex / activeRun.totalGroups) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* TIẾN TRÌNH ĐANG ĐĂNG BÀI (Chỉ hiện khi đang chạy) */}
      {activeRun.isRunning && (
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-blue-500/40 animate-in fade-in space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-bold text-xs uppercase tracking-wider text-blue-300">
                  Đang Đăng Tin Tự Động
                </span>
                <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full font-mono">
                  {activeRun.currentIndex} / {activeRun.totalGroups} Nhóm
                </span>
              </div>
              <p className="text-sm font-semibold text-white truncate max-w-lg">
                Đang gửi tới:{' '}
                <span className="text-amber-300 font-bold">
                  {activeRun.currentGroupName || 'Chuẩn bị dữ liệu...'}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {activeRun.currentDelaySec > 0 && (
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-lg font-mono">
                  ⏳ Nghỉ {activeRun.currentDelaySec}s
                </span>
              )}
              <button
                onClick={onStopRunClick}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Dừng Lại</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 3. LỊCH ĐĂNG VÀ ĐỢT KẾ TIẾP (Thông tin gọn gàng) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 leading-none">
                Lịch Đăng Tuyển Dụng Tự Động
              </h2>
              <button
                onClick={() => onNavigateTab('settings')}
                className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 transition-colors"
                title="Bấm để chỉnh sửa khung giờ đăng trong ngày"
              >
                ⏰ {settings.postTimes.length} Khung Giờ: {settings.postTimes.join(' • ')} (Chỉnh sửa)
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Đợt đăng kế tiếp lúc:{' '}
              <strong className="text-blue-700 font-semibold">{nextRunInfo.timeStr}</strong>{' '}
              <span className="text-slate-400 font-mono">({countdownText})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={onRefreshData}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Làm mới trạng thái"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAutoRunner}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Mở trình hỗ trợ đăng liên hoàn 20 nhóm thật trên Facebook: Tự sinh Spintax, tự copy, tự mở nhóm"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>⚡ Chạy Trợ Lý Đăng Liên Hoàn 20 Nhóm</span>
          </button>

          <button
            onClick={onRunNowClick}
            disabled={activeRun.isRunning}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all ${
              activeRun.isRunning
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Mô Phỏng Đăng Lập Lịch</span>
          </button>
        </div>
      </div>

      {/* BANNER ĐẶC BIỆT: TIỆN ÍCH EXTENSION ĐĂNG TỰ ĐỘNG 100% */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-indigo-500/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-white">
                Tiện Ích Chrome Extension: Tự Động 100% Đăng Vào 20 Nhóm
              </h3>
              <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                Khuyên Dùng Nhất
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Extension chạy trên Chrome/Cốc Cốc: Tự động mở từng nhóm Facebook, tự điền bài viết Spintax, tự bấm nút "Đăng", nghỉ 20s và chuyển nhóm tiếp theo hoàn toàn tự động!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <a
            href="/autorecruit-fb-extension.zip"
            download="autorecruit-fb-extension.zip"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải File .ZIP</span>
          </a>

          {onOpenExtensionModal && (
            <button
              onClick={onOpenExtensionModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Xem Hướng Dẫn Cài (1 Phút)</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. CHỈ SỐ QUAN TRỌNG (4 Cards hiển thị đúng 1 lần) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Groups */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold text-slate-500">Nhóm Nhận Tin</span>
            <Users2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {stats.activeGroups}{' '}
            <span className="text-xs font-normal text-slate-400">/ {stats.totalGroups}</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            ✓ Đã sẵn sàng 20 nhóm/lần
          </div>
        </div>

        {/* Card 2: Posts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold text-slate-500">Mẫu Tuyển Dụng</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {stats.activePosts}{' '}
            <span className="text-xs font-normal text-slate-400">bài sẵn có</span>
          </div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">
            Kèm ảnh & Spintax
          </div>
        </div>

        {/* Card 3: Today Sent */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold text-slate-500">Đã Gửi Hôm Nay</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {stats.todayPostsSent}{' '}
            <span className="text-xs font-normal text-slate-400">lượt đăng</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Thành công: {stats.todaySuccessCount}
          </div>
        </div>

        {/* Card 4: Anti-Ban Protection */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold text-slate-500">An Toàn Tài Khoản</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {settings.fbUserName.split('(')[0].trim()}
          </div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">
            Chống Checkpoint: BẬT
          </div>
        </div>
      </div>

      {/* 5. KHU VỰC CHÍNH: XEM TRƯỚC BÀI ĐĂNG (BÊN TRÁI) & NHẬT KÝ ĐĂNG (BÊN PHẢI) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Mockup Bài Viết & 20 Nhóm Mục Tiêu */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card: Mockup */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Xem Trước Bài Đăng Sẽ Gửi Lên Facebook
                </h3>
                <p className="text-[11px] text-slate-500">
                  Mô phỏng chính xác hiển thị bài viết trên điện thoại và máy tính
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('posts')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Soạn / Đổi bài</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {nextPost ? (
              <FacebookMockup
                userName={settings.fbUserName}
                userAvatar={settings.fbUserAvatar}
                groupName="Tuyển Dụng & Việc Làm TP.HCM (480k TV)"
                timeText="Xem trước đợt tới"
                content={nextPost.content}
                images={nextPost.images}
                imageLayout={nextPost.imageLayout || 'top_large'}
                imageFit={nextPost.imageFit || 'cover'}
              />
            ) : (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl text-xs">
                Chưa có bài viết. Hãy vào tab "Bài Tuyển Dụng" để soạn nội dung!
              </div>
            )}
          </div>

          {/* Card: 20 Nhóm Mục Tiêu */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  20 Nhóm Tuyển Dụng Ưu Tiên Cho Đợt Này
                </h3>
                <p className="text-[11px] text-slate-500">
                  Nghỉ an toàn {settings.delayMinSec}s - {settings.delayMaxSec}s giữa mỗi nhóm
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('groups')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {targetGroups.map((grp, idx) => (
                <div
                  key={grp.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-100"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-slate-400 w-4 shrink-0">{idx + 1}.</span>
                    <span className="font-medium text-slate-800 truncate">{grp.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                    {(grp.memberCount / 1000).toFixed(0)}k TV
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Nhật Ký Đăng Mới Nhất */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Nhật Ký Đăng Mới Nhất
                </h3>
                <p className="text-[11px] text-slate-500">
                  Bấm "Xem bài" để mở thẳng link bài trên Facebook
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('logs')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Tất cả</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl text-xs">
                  Chưa có lượt đăng nào. Nhấn <strong>"Kích Hoạt Đăng Ngay"</strong> để bắt đầu đợt đầu tiên!
                </div>
              ) : (
                logs.slice(0, 8).map((log) => {
                  const isSuccess = log.status === 'success';
                  const dateStr = new Date(log.timestamp).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                          {log.groupName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{dateStr}</span>
                      </div>
                      <p className="text-slate-500 line-clamp-1 text-[11px]">
                        {log.contentSnippet}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span
                          className={`font-semibold px-1.5 py-0.2 rounded ${
                            isSuccess
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isSuccess ? 'Đã đăng thành công' : 'Chờ duyệt / Lỗi'}
                        </span>

                        {log.fbPostLink && (
                          <a
                            href={log.fbPostLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-0.5 font-semibold"
                          >
                            <span>Xem bài</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
