import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Users2,
  Settings,
  History,
  Play,
  Square,
  Clock,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Pin,
  Zap,
  Package,
} from 'lucide-react';
import { AppSettings, ActiveRunState, NextRunInfo } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'posts' | 'groups' | 'settings' | 'logs' | 'guide';
  setActiveTab: (tab: 'dashboard' | 'posts' | 'groups' | 'settings' | 'logs' | 'guide') => void;
  settings: AppSettings;
  activeRun: ActiveRunState;
  nextRunInfo: NextRunInfo;
  onRunNowClick: () => void;
  onStopRunClick: () => void;
  onAutoRunnerClick: () => void;
  onOpenExtensionModal?: () => void;
  isExtensionConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  activeRun,
  nextRunInfo,
  onRunNowClick,
  onStopRunClick,
  onAutoRunnerClick,
  onOpenExtensionModal,
  isExtensionConnected,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-400 flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
              <span className="text-white font-black text-lg">f</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight leading-none">
                  AutoRecruit <span className="text-blue-400">FB</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30 leading-none">
                  2 LẦN/NGÀY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate hidden sm:block mt-0.5">
                Tự động đăng 20 nhóm tuyển dụng từ Facebook chính chủ
              </p>
            </div>
          </div>

          {/* Right Area: Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Chrome Extension Button with Live Status */}
            {onOpenExtensionModal && (
              <button
                onClick={onOpenExtensionModal}
                className={`hidden md:flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isExtensionConnected
                    ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/90'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                }`}
                title={
                  isExtensionConnected
                    ? 'Extension đã kết nối Real-time! Mọi thay đổi bài viết trên Web sẽ tự động đồng bộ ngay sang Extension.'
                    : 'Tải tiện ích Chrome Extension để tự động 100% mở nhóm, dán và bấm đăng'
                }
              >
                {isExtensionConnected ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>🟢 Extension: Đã Kết Nối Real-Time</span>
                  </>
                ) : (
                  <>
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cài Extension (Tự Động 100%)</span>
                  </>
                )}
              </button>
            )}

            {/* Auto Runner Button */}
            <button
              onClick={onAutoRunnerClick}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Mở trình hỗ trợ đăng liên hoàn 20 nhóm Facebook: Tự sinh Spintax, tự copy, tự mở nhóm"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span className="hidden sm:inline">⚡ Trợ Lý Đăng 20 Nhóm</span>
              <span className="sm:hidden">⚡ Đăng 20 Nhóm</span>
            </button>

            {/* Quick Status / Run Button */}
            {activeRun.isRunning ? (
              <button
                onClick={onStopRunClick}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition-all animate-pulse"
                title="Dừng tiến trình đăng bài"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>[{activeRun.currentIndex}/{activeRun.totalGroups}] Dừng</span>
              </button>
            ) : (
              <button
                onClick={onRunNowClick}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span className="hidden sm:inline">Đăng Ngay 20 Nhóm</span>
                <span className="sm:hidden">Đăng Ngay</span>
              </button>
            )}

            {/* Profile Avatar Pill */}
            <div className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700/70 text-xs">
              <img
                src={settings.fbUserAvatar}
                alt={settings.fbUserName}
                className="w-7 h-7 rounded-full object-cover border border-blue-400/50 shrink-0"
              />
              <div className="hidden md:block text-left leading-tight">
                <div className="font-semibold text-slate-200 truncate max-w-[120px]">
                  {settings.fbUserName.split('(')[0].trim()}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">
                  Chính chủ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-slate-950/85 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none items-center">
            {/* TAB 1: BẢNG ĐIỀU KHIỂN */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Bảng Điều Khiển</span>
            </button>

            {/* TAB 2: HƯỚNG DẪN SỬ DỤNG (ĐÃ GIM ĐẶT NGAY ĐẦU ĐỂ NHÌN THẤY NGAY) */}
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all shrink-0 border ${
                activeTab === 'guide'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border-amber-500/40'
              }`}
            >
              <Pin className="w-3.5 h-3.5 fill-current shrink-0" />
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>HƯỚNG DẪN SỬ DỤNG</span>
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                activeTab === 'guide' ? 'bg-slate-950 text-amber-400' : 'bg-amber-400 text-slate-950'
              }`}>
                ĐÃ GIM
              </span>
            </button>

            {/* TAB 3: BÀI TUYỂN DỤNG & SOẠN AI */}
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                activeTab === 'posts'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Bài Tuyển Dụng & Ảnh</span>
              <span className="bg-purple-500/30 text-purple-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />
                AI
              </span>
            </button>

            {/* TAB 4: NHÓM ĐÃ THAM GIA */}
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                activeTab === 'groups'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users2 className="w-4 h-4 shrink-0" />
              <span>20+ Nhóm Đã Tham Gia</span>
              <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                22
              </span>
            </button>

            {/* TAB 5: CÀI ĐẶT LỊCH VÀ CHỐNG CHẶN */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Cài Đặt & Token</span>
            </button>

            {/* TAB 6: NHẬT KÝ & BÁO CÁO */}
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Nhật Ký & Báo Cáo</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
