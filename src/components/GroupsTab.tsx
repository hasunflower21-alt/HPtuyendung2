import React, { useState } from 'react';
import {
  Users2,
  Plus,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Send,
  Shield,
  Layers,
  Check,
  Zap,
  ClipboardList,
  X,
  Sparkles,
} from 'lucide-react';
import { FBGroup, RecruitmentPost } from '../types';

interface GroupsTabProps {
  groups: FBGroup[];
  posts: RecruitmentPost[];
  onToggleGroup: (id: string, enabled?: boolean) => Promise<void>;
  onToggleAll: (enabled: boolean) => Promise<void>;
  onAddGroup: (group: Partial<FBGroup>) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
  onResetDefaults: () => Promise<void>;
  onTestSinglePost: (postId: string, groupId: string) => Promise<void>;
  onOpenAutoRunner?: () => void;
  onBulkImportGroups?: (rawText: string, replaceAll: boolean) => Promise<void>;
}

export const GroupsTab: React.FC<GroupsTabProps> = ({
  groups,
  posts,
  onToggleGroup,
  onToggleAll,
  onAddGroup,
  onDeleteGroup,
  onResetDefaults,
  onTestSinglePost,
  onOpenAutoRunner,
  onBulkImportGroups,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [bulkInputText, setBulkInputText] = useState<string>('');
  const [replaceAllBulk, setReplaceAllBulk] = useState<boolean>(true);
  const [bulkLoading, setBulkLoading] = useState<boolean>(false);

  // Add form states
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupLink, setNewGroupLink] = useState<string>('');
  const [newGroupCategory, setNewGroupCategory] = useState<string>('Tổng hợp');
  const [newGroupMembers, setNewGroupMembers] = useState<string>('120000');

  // Single test state
  const [testingGroupId, setTestingGroupId] = useState<string | null>(null);
  const [successTestId, setSuccessTestId] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(groups.map((g) => g.category)))];

  const filteredGroups = groups.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.link.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'all' || g.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const activeCount = groups.filter((g) => g.enabled).length;
  const totalAudience = groups
    .filter((g) => g.enabled)
    .reduce((acc, g) => acc + g.memberCount, 0);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    await onAddGroup({
      name: newGroupName,
      link: newGroupLink || `https://facebook.com/groups/${Date.now()}`,
      category: newGroupCategory,
      memberCount: parseInt(newGroupMembers, 10) || 50000,
      enabled: true,
    });

    setNewGroupName('');
    setNewGroupLink('');
    setIsAddModalOpen(false);
  };

  const handleTestPost = async (groupId: string) => {
    if (posts.length === 0) return;
    setTestingGroupId(groupId);
    try {
      await onTestSinglePost(posts[0].id, groupId);
      setSuccessTestId(groupId);
      setTimeout(() => setSuccessTestId(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setTestingGroupId(null);
    }
  };

  const handleSelectFirst20 = async () => {
    for (let i = 0; i < groups.length; i++) {
      const shouldEnable = i < 20;
      if (groups[i].enabled !== shouldEnable) {
        await onToggleGroup(groups[i].id, shouldEnable);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Statistics */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users2 className="w-5 h-5 text-blue-600" />
            <span>Danh Sách Nhóm Tuyển Dụng Đã Vào Sẵn ({groups.length} Nhóm)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hệ thống tự động lấy <strong className="text-blue-600 font-semibold">20 nhóm</strong> đang bật để đăng trong mỗi đợt tuyển dụng từ tài khoản chính chủ
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đang bật: <strong>{activeCount} nhóm</strong></span>
            </div>
            <div className="text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
              Tiếp cận ước tính: <strong className="text-slate-900">{(totalAudience / 1000000).toFixed(1)} triệu thành viên</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onOpenAutoRunner && (
            <button
              onClick={onOpenAutoRunner}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Khởi động quy trình đăng lần lượt từng nhóm trong 20 nhóm này"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>⚡ Đăng Liên Hoàn 20 Nhóm Này</span>
            </button>
          )}

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Dán nhanh danh sách 20 link nhóm Facebook thật của bạn cùng một lúc"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Dán 20 Link Nhóm Thật</span>
          </button>

          <button
            onClick={handleSelectFirst20}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
            title="Tự động chọn chính xác 20 nhóm ưu tiên cho 1 đợt đăng"
          >
            <Layers className="w-4 h-4" />
            <span>Chọn Chuẩn 20 Nhóm</span>
          </button>

          <button
            onClick={() => onToggleAll(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Bật Hết
          </button>

          <button
            onClick={() => onResetDefaults()}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Khôi phục 22 nhóm mẫu việc làm hàng đầu"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Mặc Định</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Nhóm Mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên nhóm hoặc link..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'Tất cả nhóm' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Groups Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">STT</th>
                <th className="px-4 py-3.5">Tên Nhóm Facebook</th>
                <th className="px-4 py-3.5">Thành Viên</th>
                <th className="px-4 py-3.5">Danh Mục</th>
                <th className="px-4 py-3.5">Trạng Thái Vào</th>
                <th className="px-4 py-3.5 text-center">Đã Đăng</th>
                <th className="px-4 py-3.5 text-center">Bật / Tắt</th>
                <th className="px-4 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredGroups.map((group, index) => {
                const isTesting = testingGroupId === group.id;
                const isSuccess = successTestId === group.id;

                return (
                  <tr
                    key={group.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      !group.enabled ? 'opacity-60 bg-slate-50/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-center font-mono text-slate-400">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 line-clamp-1 max-w-sm">
                        {group.name}
                      </div>
                      <a
                        href={group.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span className="truncate max-w-[240px]">{group.link}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                      {group.memberCount.toLocaleString('vi-VN')} TV
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                        {group.category}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-2.5 h-2.5" />
                        <span>Đã vào sẵn</span>
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center font-bold text-slate-900">
                      {group.postSuccessCount || 0}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onToggleGroup(group.id)}
                        className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                          group.enabled ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                        title={group.enabled ? 'Nhấp để tắt nhóm này' : 'Nhấp để bật nhóm này'}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                            group.enabled ? 'left-6' : 'left-1'
                          }`}
                        ></span>
                      </button>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleTestPost(group.id)}
                          disabled={isTesting}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            isSuccess
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          }`}
                          title="Đăng thử ngay 1 bài vào nhóm này"
                        >
                          <Send className="w-3 h-3" />
                          <span>{isTesting ? 'Đang gửi...' : isSuccess ? 'Đã đăng ✓' : 'Đăng thử'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa nhóm "${group.name}" khỏi danh sách?`)) {
                              onDeleteGroup(group.id);
                            }
                          }}
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                          title="Xóa nhóm này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD GROUP MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base text-white">Thêm Nhóm Facebook Đã Tham Gia</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên nhóm Facebook *
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="VD: Tuyển Dụng Việc Làm Part-time..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đường dẫn (Link) hoặc ID Nhóm
                </label>
                <input
                  type="text"
                  value={newGroupLink}
                  onChange={(e) => setNewGroupLink(e.target.value)}
                  placeholder="https://www.facebook.com/groups/xxxxx"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngành nghề / Khu vực
                  </label>
                  <input
                    type="text"
                    value={newGroupCategory}
                    onChange={(e) => setNewGroupCategory(e.target.value)}
                    placeholder="VD: F&B, Hà Nội, IT..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số lượng thành viên
                  </label>
                  <input
                    type="number"
                    value={newGroupMembers}
                    onChange={(e) => setNewGroupMembers(e.target.value)}
                    placeholder="120000"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 -mx-6 -mb-6 border-t border-slate-200 flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Lưu Nhóm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Import Groups */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Dán Danh Sách 20 Link Nhóm Facebook Thật
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Đảm bảo đăng chính xác vào các nhóm bạn đã tham gia
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Dán các liên kết nhóm Facebook của bạn vào ô dưới đây (mỗi dòng 1 link). Hệ thống sẽ tự động làm sạch tham số theo dõi và nạp vào danh sách nhóm:
              </p>

              <textarea
                rows={8}
                value={bulkInputText}
                onChange={(e) => setBulkInputText(e.target.value)}
                placeholder="https://www.facebook.com/groups/1234567890/
https://www.facebook.com/groups/vieclamhanoi247/
https://www.facebook.com/groups/tuyendungvieclamhcm/"
                className="w-full text-xs font-mono p-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/80"
              />

              <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-100/70 p-3 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="replaceCheck"
                  checked={replaceAllBulk}
                  onChange={(e) => setReplaceAllBulk(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="replaceCheck" className="cursor-pointer font-medium text-slate-800">
                  Thay thế toàn bộ nhóm mẫu cũ bằng danh sách nhóm này (Khuyên dùng)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={bulkLoading || !bulkInputText.trim()}
                onClick={async () => {
                  if (!bulkInputText.trim()) return;
                  setBulkLoading(true);
                  try {
                    if (onBulkImportGroups) {
                      await onBulkImportGroups(bulkInputText, replaceAllBulk);
                    }
                    setIsBulkModalOpen(false);
                    setBulkInputText('');
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setBulkLoading(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all"
              >
                {bulkLoading ? 'Đang lưu...' : 'Lưu Danh Sách 20 Nhóm Này'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
