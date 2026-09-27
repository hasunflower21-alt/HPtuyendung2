/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { PostsTab } from './components/PostsTab';
import { GroupsTab } from './components/GroupsTab';
import { SettingsTab } from './components/SettingsTab';
import { LogsTab } from './components/LogsTab';
import { GuideTab } from './components/GuideTab';
import { RunNowModal } from './components/RunNowModal';
import { AutoRunnerModal } from './components/AutoRunnerModal';
import { ExtensionModal } from './components/ExtensionModal';
import { AppDataResponse, RecruitmentPost, FBGroup, AppSettings } from './types';
import { RefreshCw, AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { apiService } from './utils/apiService';

export default function App() {
  const [data, setData] = useState<AppDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'groups' | 'settings' | 'logs' | 'guide'>('dashboard');
  const [isRunNowModalOpen, setIsRunNowModalOpen] = useState<boolean>(false);
  const [isAutoRunnerOpen, setIsAutoRunnerOpen] = useState<boolean>(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState<boolean>(false);
  const [isExtensionConnected, setIsExtensionConnected] = useState<boolean>(false);
  const [targetPostIdForModal, setTargetPostIdForModal] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Nhận diện kết nối 2 chiều thời gian thực với Chrome Extension
  useEffect(() => {
    const handleExtensionPresence = () => setIsExtensionConnected(true);
    window.addEventListener('AUTORECRUIT_EXTENSION_PONG', handleExtensionPresence);
    window.addEventListener('AUTORECRUIT_EXTENSION_READY', handleExtensionPresence);

    const ping = () => {
      window.dispatchEvent(new CustomEvent('AUTORECRUIT_WEBAPP_PING'));
    };
    ping();
    const interval = setInterval(ping, 3000);

    return () => {
      window.removeEventListener('AUTORECRUIT_EXTENSION_PONG', handleExtensionPresence);
      window.removeEventListener('AUTORECRUIT_EXTENSION_READY', handleExtensionPresence);
      clearInterval(interval);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Open AutoRunner modal with specific post
  const handleOpenAutoRunner = (postId?: string) => {
    setTargetPostIdForModal(postId);
    setIsAutoRunnerOpen(true);
  };

  const handleLogManualPostSuccess = async (postId: string, groupId: string, content: string) => {
    try {
      const updated = await apiService.logManualPost(postId, groupId, content);
      setData(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all app data
  const fetchData = useCallback(async () => {
    try {
      const result = await apiService.getData();
      setData(result);
      setError('');
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and smart polling
  useEffect(() => {
    fetchData();

    // Polling interval
    const intervalTime = data?.activeRun?.isRunning ? 2000 : 20000;
    const interval = setInterval(fetchData, intervalTime);

    return () => clearInterval(interval);
  }, [fetchData, data?.activeRun?.isRunning]);

  // Cache hash để chỉ đồng bộ khi nội dung bài viết, nhóm hoặc cài đặt thực sự thay đổi
  const lastSyncHashRef = React.useRef<string>('');

  // Tự động kết nối dữ liệu sang Chrome Extension (Chỉ chạy khi có thay đổi thực sự, không chạy theo polling tick)
  useEffect(() => {
    if (data) {
      const activePost = data.posts.find((p) => p.status === 'active') || data.posts[0];
      const contentHash = JSON.stringify({
        posts: data.posts.map((p) => ({ id: p.id, title: p.title, len: p.content.length, imgs: p.images })),
        groups: data.groups.map((g) => ({ id: g.id, enabled: g.enabled })),
        settings: { postTimes: data.settings.postTimes, groupsPerRun: data.settings.groupsPerRun },
      });

      if (contentHash === lastSyncHashRef.current) {
        return; // Dữ liệu cốt lõi không thay đổi, bỏ qua để ứng dụng mượt mà 100%
      }
      lastSyncHashRef.current = contentHash;

      const payload = {
        posts: data.posts,
        groups: data.groups.filter((g) => g.enabled).length ? data.groups.filter((g) => g.enabled) : data.groups,
        settings: data.settings,
        activePost,
        updatedAt: Date.now(),
      };

      // Gán vào biến toàn cục cho extension đọc trực tiếp
      (window as any).__AUTORECRUIT_DATA__ = payload;

      // Lưu trữ đồng bộ vào localStorage
      try {
        localStorage.setItem('autorecruit_fb_data_v1', JSON.stringify(data));
      } catch (e) {}

      // Phát sự kiện thời gian thực cho web_bridge.js (CustomEvent & postMessage)
      window.dispatchEvent(new CustomEvent('AUTORECRUIT_DATA_CHANGE', { detail: payload }));
      window.postMessage({ type: 'AUTORECRUIT_DATA_CHANGE', payload }, '*');
    }
  }, [data]);

  // Open Run Now modal with specific post
  const handleOpenRunNowModal = (postId?: string) => {
    setTargetPostIdForModal(postId);
    setIsRunNowModalOpen(true);
  };

  // Action: Run Now
  const handleConfirmRunNow = async (postId?: string) => {
    try {
      const updated = await apiService.runNow(postId || targetPostIdForModal);
      setData(updated);
      showToast('Đã bắt đầu tiến trình đẩy bài lên 20 nhóm thành công!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Không thể bắt đầu đăng bài', 'error');
    }
  };

  // Action: Stop Run
  const handleStopRun = async () => {
    try {
      const updated = await apiService.stopRun();
      setData(updated);
      showToast('Đã dừng tiến trình đăng bài!', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Save Post (Create or Update)
  const handleSavePost = async (postData: Partial<RecruitmentPost>) => {
    try {
      const updated = await apiService.savePost(postData);
      setData(updated);
      showToast('Đã lưu bài viết tuyển dụng thành công!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu bài viết', 'error');
    }
  };

  // Action: Delete Post
  const handleDeletePost = async (id: string) => {
    try {
      const updated = await apiService.deletePost(id);
      setData(updated);
      showToast('Đã xóa bài viết thành công!', 'info');
    } catch (err: any) {
      showToast(err.message || 'Lỗi xóa bài', 'error');
    }
  };

  // Action: Toggle Group
  const handleToggleGroup = async (id: string, enabled?: boolean) => {
    try {
      const updated = await apiService.toggleGroup(id, enabled);
      setData(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Toggle All Groups
  const handleToggleAll = async (enabled: boolean) => {
    try {
      const updated = await apiService.toggleAllGroups(enabled);
      setData(updated);
      showToast(enabled ? 'Đã bật tất cả các nhóm' : 'Đã tắt tất cả các nhóm', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Add Group
  const handleAddGroup = async (groupData: Partial<FBGroup>) => {
    try {
      const updated = await apiService.addGroup(groupData);
      setData(updated);
      showToast('Đã thêm nhóm mới thành công!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi thêm nhóm', 'error');
    }
  };

  // Action: Delete Group
  const handleDeleteGroup = async (id: string) => {
    try {
      const updated = await apiService.deleteGroup(id);
      setData(updated);
      showToast('Đã xóa nhóm khỏi danh sách', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Reset Default Groups
  const handleResetDefaults = async () => {
    try {
      const updated = await apiService.resetDefaultGroups();
      setData(updated);
      showToast('Đã khôi phục 22 nhóm tuyển dụng mẫu!', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Bulk Import Groups
  const handleBulkImportGroups = async (rawText: string, replaceAll: boolean) => {
    try {
      const updated = await apiService.bulkImportGroups(rawText, replaceAll);
      setData(updated);
      showToast('Đã lưu danh sách nhóm thật của bạn thành công!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi nạp nhóm', 'error');
    }
  };

  // Action: Test single post to 1 group
  const handleTestSinglePost = async (postId: string, groupId: string) => {
    try {
      const updated = await apiService.testSinglePost(postId, groupId);
      setData(updated);
      showToast('Đã đăng thử 1 bài thành công! Xem chi tiết trong Nhật Ký.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi đăng thử nghiệm', 'error');
    }
  };

  // Action: Update Settings
  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = await apiService.updateSettings(newSettings);
      setData(updated);
      showToast('Đã cập nhật cài đặt thành công!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật cấu hình', 'error');
    }
  };

  // Action: Verify Facebook Token
  const handleVerifyFbToken = async (token: string): Promise<{ success: boolean; error?: string }> => {
    return await apiService.verifyFbToken(token);
  };

  // Action: Clear logs
  const handleClearLogs = async () => {
    try {
      const updated = await apiService.clearLogs();
      setData(updated);
      showToast('Đã xóa sạch nhật ký!', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-base font-bold text-slate-800">
          Đang khởi tạo hệ thống AutoRecruit FB 24/7...
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Thiết lập lịch tự động 2 lần/ngày & kết nối nhóm tuyển dụng
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 max-w-md w-full text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="font-bold text-slate-900">Không thể kết nối máy chủ</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold mx-auto hover:bg-blue-500"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const hasNoActivePosts = data.stats.activePosts === 0;
  const hasNoActiveGroups = data.stats.activeGroups === 0;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-500 selection:text-white relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-md animate-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 text-xs backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500 text-rose-100'
                : 'bg-slate-900/90 border-slate-700 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
            <span className="flex-1 font-medium leading-relaxed">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-white/60 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={data.settings}
        activeRun={data.activeRun}
        nextRunInfo={data.nextRunInfo}
        onRunNowClick={() => handleOpenRunNowModal()}
        onStopRunClick={handleStopRun}
        onAutoRunnerClick={() => handleOpenAutoRunner()}
        onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
        isExtensionConnected={isExtensionConnected}
      />

      {/* Diagnostics Alert Banner if blocked */}
      {(hasNoActivePosts || hasNoActiveGroups) && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Cảnh báo điều kiện đăng bài:</strong>{' '}
                {hasNoActivePosts && 'Tất cả bài viết đang là Bản nháp (chưa kích hoạt). '}
                {hasNoActiveGroups && 'Chưa có nhóm nào được bật để nhận tin. '}
                Hệ thống sẽ không thể đẩy bài nếu chưa đủ 2 điều kiện này!
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {hasNoActivePosts && (
                <button
                  onClick={() => setActiveTab('posts')}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px]"
                >
                  Kích hoạt bài viết
                </button>
              )}
              {hasNoActiveGroups && (
                <button
                  onClick={() => setActiveTab('groups')}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px]"
                >
                  Bật các nhóm
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            data={data}
            onRunNowClick={() => handleOpenRunNowModal()}
            onStopRunClick={handleStopRun}
            onRefreshData={fetchData}
            onNavigateTab={setActiveTab}
            onOpenAutoRunner={() => handleOpenAutoRunner()}
            onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
          />
        )}

        {activeTab === 'posts' && (
          <PostsTab
            posts={data.posts}
            groups={data.groups}
            settings={data.settings}
            onSavePost={handleSavePost}
            onDeletePost={handleDeletePost}
            onTestSinglePost={handleTestSinglePost}
            onTriggerRunNow={handleOpenRunNowModal}
            onOpenAutoRunner={handleOpenAutoRunner}
          />
        )}

        {activeTab === 'groups' && (
          <GroupsTab
            groups={data.groups}
            posts={data.posts}
            onToggleGroup={handleToggleGroup}
            onToggleAll={handleToggleAll}
            onAddGroup={handleAddGroup}
            onDeleteGroup={handleDeleteGroup}
            onResetDefaults={handleResetDefaults}
            onTestSinglePost={handleTestSinglePost}
            onOpenAutoRunner={() => handleOpenAutoRunner()}
            onBulkImportGroups={handleBulkImportGroups}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={data.settings}
            onUpdateSettings={handleUpdateSettings}
            onVerifyFbToken={handleVerifyFbToken}
          />
        )}

        {activeTab === 'logs' && (
          <LogsTab
            logs={data.logs}
            onClearLogs={handleClearLogs}
            onRefreshData={fetchData}
          />
        )}

        {activeTab === 'guide' && (
          <GuideTab onNavigateTab={setActiveTab} />
        )}
      </main>

      {/* Modal: Run Now (Batch Simulation) */}
      <RunNowModal
        isOpen={isRunNowModalOpen}
        onClose={() => {
          setIsRunNowModalOpen(false);
          setTargetPostIdForModal(undefined);
        }}
        onConfirm={handleConfirmRunNow}
        posts={data.posts}
        groups={data.groups}
        settings={data.settings}
        initialPostId={targetPostIdForModal}
      />

      {/* Modal: Auto Runner (Real Facebook Groups Continuous Poster) */}
      <AutoRunnerModal
        isOpen={isAutoRunnerOpen}
        onClose={() => {
          setIsAutoRunnerOpen(false);
          setTargetPostIdForModal(undefined);
        }}
        groups={data.groups}
        posts={data.posts}
        settings={data.settings}
        onLogPostSuccess={handleLogManualPostSuccess}
        initialPostId={targetPostIdForModal}
      />

      {/* Modal: Chrome Extension Downloader & Guide */}
      <ExtensionModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>AutoRecruit FB 24/7</strong> — Giải pháp tự động hóa 100% đăng tin tuyển dụng Facebook
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>2 lần/ngày (08:30 & 17:30)</span>
            <span>•</span>
            <span>20 nhóm/đợt</span>
            <span>•</span>
            <span>Kèm ảnh & Spintax chống spam</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
