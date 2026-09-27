import React, { useState } from 'react';
import { X, Play, ShieldAlert, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { FBGroup, RecruitmentPost, AppSettings } from '../types';

interface RunNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (postId: string) => void;
  posts: RecruitmentPost[];
  groups: FBGroup[];
  settings: AppSettings;
  initialPostId?: string;
}

export const RunNowModal: React.FC<RunNowModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  posts,
  groups,
  settings,
  initialPostId,
}) => {
  const [selectedPostId, setSelectedPostId] = useState<string>(
    initialPostId || posts.find((p) => p.status === 'active')?.id || posts[0]?.id || ''
  );

  React.useEffect(() => {
    if (initialPostId) {
      setSelectedPostId(initialPostId);
    } else if (!selectedPostId && posts.length > 0) {
      setSelectedPostId(posts.find((p) => p.status === 'active')?.id || posts[0]?.id || '');
    }
  }, [initialPostId, isOpen, posts]);

  if (!isOpen) return null;

  const targetGroups = groups.filter((g) => g.enabled).slice(0, settings.groupsPerRun);
  const activePost = posts.find((p) => p.id === selectedPostId) || posts[0];
  const hasNoEnabledGroups = targetGroups.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Play className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                Đăng Ngay Đợt Tuyển Dụng ({targetGroups.length} Nhóm)
              </h3>
              <p className="text-xs text-blue-100">
                Thực thi ngay lập tức mà không cần chờ đến giờ hẹn tự động
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Post Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              1. Chọn bài tuyển dụng sẽ đăng
            </label>
            <div className="space-y-2">
              {posts.map((post) => {
                const isSelected = post.id === (activePost?.id || '');
                return (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPostId(post.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900 truncate">
                          {post.title}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Đã đăng {post.timesPosted} lần
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                        {post.content.replace(/[\n\r]/g, ' ')}
                      </p>
                      {post.images && post.images.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[10px] text-slate-400 font-semibold">{post.images.slice(0, 3).length}/3 ảnh:</span>
                          {post.images.slice(0, 3).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="thumb"
                              className="w-8 h-8 rounded-md object-cover border border-slate-200"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Target Groups Summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                2. Danh sách {targetGroups.length} nhóm nhận bài đăng (Đã tham gia sẵn)
              </label>
              <span className="text-xs text-blue-600 font-medium">
                {targetGroups.reduce((acc, g) => acc + g.memberCount, 0).toLocaleString('vi-VN')} Thành viên tiếp cận
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-36 overflow-y-auto space-y-1.5 text-xs text-slate-700">
              {targetGroups.map((group, idx) => (
                <div key={group.id} className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-400 font-mono w-5">{idx + 1}.</span>
                    <span className="font-medium text-slate-800 truncate">{group.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0">
                    {(group.memberCount / 1000).toFixed(0)}k TV
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Anti-Ban & Spintax Notice */}
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-800">
                Cơ chế an toàn 100% tự động kích hoạt:
              </span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-emerald-700">
                <li>Tự động xáo trộn Spintax (Mỗi nhóm nhận bài viết khác biệt từ ngữ)</li>
                <li>Tự động nghỉ ngẫu nhiên {settings.delayMinSec}s - {settings.delayMaxSec}s giữa các bài để bảo vệ tài khoản</li>
                <li>Đăng trực tiếp từ nick Facebook chính chủ: <span className="font-medium">{settings.fbUserName}</span></li>
              </ul>
            </div>
          </div>

          {hasNoEnabledGroups && (
            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 font-medium">
              ⚠️ <strong>Chưa có nhóm nào được bật:</strong> Không thể đẩy bài vì tất cả các nhóm đang ở trạng thái Tắt. Vui lòng vào tab "20+ Nhóm" và gạt bật các nhóm bạn muốn gửi tin.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/80 transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={() => {
              if (hasNoEnabledGroups) return;
              onConfirm(selectedPostId);
              onClose();
            }}
            disabled={hasNoEnabledGroups}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all ${
              hasNoEnabledGroups
                ? 'bg-slate-400 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Xác Nhận Đăng Ngay {targetGroups.length} Nhóm</span>
          </button>
        </div>
      </div>
    </div>
  );
};
