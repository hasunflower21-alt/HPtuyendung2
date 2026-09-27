import React, { useState } from 'react';
import {
  Settings,
  Clock,
  ShieldCheck,
  Key,
  Save,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Shuffle,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  onVerifyFbToken: (token: string) => Promise<{ success: boolean; error?: string }>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onVerifyFbToken,
}) => {
  // Form states
  const [isAutoActive, setIsAutoActive] = useState<boolean>(settings.isAutoActive);
  const [postTimesList, setPostTimesList] = useState<string[]>(
    settings.postTimes && settings.postTimes.length ? settings.postTimes : ['08:30', '17:30']
  );
  const [newTimeInput, setNewTimeInput] = useState<string>('');
  const [groupsPerRun, setGroupsPerRun] = useState<number>(settings.groupsPerRun || 20);
  const [delayMinSec, setDelayMinSec] = useState<number>(settings.delayMinSec || 15);
  const [delayMaxSec, setDelayMaxSec] = useState<number>(settings.delayMaxSec || 45);
  const [enableSpintax, setEnableSpintax] = useState<boolean>(settings.enableSpintax);
  const [mode, setMode] = useState<'live' | 'simulation'>(settings.mode || 'simulation');

  // FB Token & Account
  const [tokenInput, setTokenInput] = useState<string>(settings.fbToken || '');
  const [fbUserName, setFbUserName] = useState<string>(settings.fbUserName);
  const [fbUserId, setFbUserId] = useState<string>(settings.fbUserId);
  const [fbUserAvatar, setFbUserAvatar] = useState<string>(settings.fbUserAvatar);

  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyMsg, setVerifyMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSaveSettings = async () => {
    await onUpdateSettings({
      isAutoActive,
      postTimes: postTimesList,
      groupsPerRun: Number(groupsPerRun),
      delayMinSec: Number(delayMinSec),
      delayMaxSec: Number(delayMaxSec),
      enableSpintax,
      mode,
      fbToken: tokenInput,
      fbUserName,
      fbUserId,
      fbUserAvatar,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleVerifyToken = async () => {
    if (!tokenInput.trim()) {
      setVerifyMsg({ text: 'Vui lòng nhập Token Facebook để kiểm tra.', type: 'error' });
      return;
    }

    setIsVerifying(true);
    setVerifyMsg(null);
    try {
      const res = await onVerifyFbToken(tokenInput.trim());
      if (res.success) {
        setVerifyMsg({
          text: 'Xác thực thành công! Đã kết nối tài khoản chính chủ và đồng bộ nhóm.',
          type: 'success',
        });
      } else {
        setVerifyMsg({
          text: res.error || 'Token không hợp lệ hoặc đã hết hạn.',
          type: 'error',
        });
      }
    } catch (e: any) {
      setVerifyMsg({ text: e.message || 'Lỗi kết nối máy chủ.', type: 'error' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Cài Đặt Lịch Tự Động & Cơ Chế Chống Checkpoint Facebook</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập giờ đăng cố định 2 lần/ngày, số lượng 20 nhóm, giãn cách an toàn và quản lý Token
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? 'Đã Lưu Thành Công ✓' : 'Lưu Tất Cả Cài Đặt'}</span>
        </button>
      </div>

      {/* 1. LỊCH TỰ ĐỘNG ĐĂNG BÀI */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">
              1. Cài Đặt Khung Giờ Đăng Tuyển Dụng Trong Ngày
            </h3>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-semibold text-slate-700">Tự động 100%:</span>
            <div
              onClick={() => setIsAutoActive(!isAutoActive)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                isAutoActive ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  isAutoActive ? 'left-6' : 'left-1'
                }`}
              ></span>
            </div>
          </label>
        </div>

        {/* Dynamic Post Times Tags */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-800">
              Các mốc giờ đăng cố định hàng ngày ({postTimesList.length} mốc giờ):
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPostTimesList(['08:30', '17:30'])}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700"
              >
                2 Lần (08:30, 17:30)
              </button>
              <button
                type="button"
                onClick={() => setPostTimesList(['08:30', '11:30', '17:30', '20:00'])}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-800"
              >
                ⭐ 4 Giờ Vàng (8h30, 11h30, 17h30, 20h00)
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {postTimesList.map((timeStr) => (
              <div
                key={timeStr}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold shadow-2xs"
              >
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{timeStr}</span>
                {postTimesList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setPostTimesList(postTimesList.filter((t) => t !== timeStr))}
                    className="ml-1 text-slate-400 hover:text-rose-600 font-black text-sm"
                    title="Xóa mốc giờ này"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add time input */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
            <input
              type="time"
              value={newTimeInput}
              onChange={(e) => setNewTimeInput(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
            />
            <button
              type="button"
              onClick={() => {
                if (newTimeInput && !postTimesList.includes(newTimeInput)) {
                  setPostTimesList([...postTimesList, newTimeInput].sort());
                  setNewTimeInput('');
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              + Thêm Mốc Giờ
            </button>
            <span className="text-[11px] text-slate-500">
              (Hệ thống & Extension sẽ tự động nạp các mốc giờ này)
            </span>
          </div>
        </div>

        {/* Groups Per Run Slider */}
        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Số lượng nhóm đăng trong mỗi đợt:</span>
            </label>
            <span className="text-sm font-bold text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200">
              {groupsPerRun} Nhóm / đợt
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={groupsPerRun}
            onChange={(e) => setGroupsPerRun(Number(e.target.value))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>5 nhóm</span>
            <span className="font-semibold text-blue-600">20 nhóm (Chuẩn yêu cầu)</span>
            <span>30 nhóm</span>
          </div>
        </div>
      </div>

      {/* 2. CƠ CHẾ CHỐNG CHECKPOINT & CHỐNG SPAM */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900">
            2. Cấu Hình An Toàn Chống Checkpoint Facebook (Anti-Ban 100%)
          </h3>
        </div>

        {/* Delay configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold text-slate-800">
                Giãn cách ngẫu nhiên giữa 2 bài đăng liên tiếp
              </label>
              <p className="text-[11px] text-slate-500">
                Facebook sẽ khóa nick nếu đăng 20 nhóm cùng lúc 1 giây. Việc nghỉ ngẫu nhiên giúp hành vi đăng giống hệt người dùng thật 100%.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
              {delayMinSec}s - {delayMaxSec}s ngẫu nhiên
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Thời gian nghỉ tối thiểu:</span>
              <input
                type="number"
                min={3}
                max={60}
                value={delayMinSec}
                onChange={(e) => setDelayMinSec(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Thời gian nghỉ tối đa:</span>
              <input
                type="number"
                min={delayMinSec}
                max={120}
                value={delayMaxSec}
                onChange={(e) => setDelayMaxSec(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Spintax Feature */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Shuffle className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-800">
                Tự động xáo trộn Spintax khi gửi tới từng nhóm
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Biến đổi các cụm từ {'{Chào bạn|Xin chào|Chào anh chị}'} để 20 bài đăng vào 20 nhóm hoàn toàn độc nhất, không bị Facebook đánh dấu duplicate content.
            </p>
          </div>
          <input
            type="checkbox"
            checked={enableSpintax}
            onChange={(e) => setEnableSpintax(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
          />
        </div>
      </div>

      {/* 3. KẾT NỐI TÀI KHOẢN FACEBOOK CHÍNH CHỦ & TOKEN */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              3. Tài Khoản Facebook Chính Chủ & Access Token
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Chế độ vận hành:</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="simulation">Mô Phỏng Kiểm Thử (Safe Simulator)</option>
              <option value="live">Live Facebook Graph API Thật</option>
            </select>
          </div>
        </div>

        {/* Current Account Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={fbUserAvatar}
              alt={fbUserName}
              className="w-12 h-12 rounded-full object-cover border border-slate-200"
            />
            <div>
              <div className="font-bold text-sm text-slate-900">{fbUserName}</div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>UID: {fbUserId}</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Nick chính chủ (Đã vào 22 nhóm)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Token Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Facebook User Access Token (Hoặc Page Access Token)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="EAA..."
              className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleVerifyToken}
              disabled={isVerifying}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shrink-0 transition-colors"
            >
              {isVerifying ? 'Đang kiểm tra...' : 'Xác Thực Token'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Token cần quyền: <code className="text-blue-600 font-mono">publish_to_groups</code> hoặc{' '}
            <code className="text-blue-600 font-mono">pages_manage_posts</code>. Ở chế độ mô phỏng, hệ thống vẫn ghi nhận đầy đủ lịch trình và báo cáo.
          </p>

          {verifyMsg && (
            <div
              className={`p-3 rounded-xl text-xs mt-2 flex items-center gap-2 ${
                verifyMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {verifyMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{verifyMsg.text}</span>
            </div>
          )}
        </div>

        {/* Guide / How to get Token safely */}
        <div className="p-4 bg-slate-900 text-white rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>Hướng Dẫn Lấy Token Facebook Chính Chủ An Toàn 100%</span>
            </span>
            <a
              href="https://developers.facebook.com/tools/explorer/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>Mở Graph API Explorer</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
            <li>Truy cập Facebook Graph API Explorer (Công cụ chính thức của Meta dành cho nhà phát triển).</li>
            <li>Chọn Ứng dụng Facebook của bạn và nhấn <strong>"Generate Access Token"</strong>.</li>
            <li>Tích chọn quyền: <code className="text-amber-300">publish_to_groups</code>, <code className="text-amber-300">groups_access_member_info</code>.</li>
            <li>Dán chuỗi Token bắt đầu bằng <code className="text-emerald-300">EAA...</code> vào ô trên và nhấn <strong>"Xác Thực Token"</strong>.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
