import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Download,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { PostLog } from '../types';

interface LogsTabProps {
  logs: PostLog[];
  onClearLogs: () => Promise<void>;
  onRefreshData: () => void;
}

export const LogsTab: React.FC<LogsTabProps> = ({
  logs,
  onClearLogs,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.postTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.contentSnippet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const exportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Thời gian', 'Tên nhóm', 'ID Nhóm', 'Tiêu đề bài', 'Trạng thái', 'Link bài FB', 'Ghi chú/Lỗi'];
    const rows = logs.map((l) => [
      `"${new Date(l.timestamp).toLocaleString('vi-VN')}"`,
      `"${l.groupName.replace(/"/g, '""')}"`,
      `"${l.groupId}"`,
      `"${l.postTitle.replace(/"/g, '""')}"`,
      `"${l.status === 'success' ? 'Thành công' : 'Lỗi / Chờ duyệt'}"`,
      `"${l.fbPostLink || ''}"`,
      `"${(l.errorMessage || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nhat_ky_dang_fb_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const successCount = logs.filter((l) => l.status === 'success').length;
  const failedCount = logs.filter((l) => l.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Nhật Ký & Báo Cáo Chi Tiết Đăng Tin Tự Động</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận toàn bộ tiến trình đăng vào từng nhóm Facebook theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefreshData}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={exportCSV}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Báo Cáo CSV</span>
          </button>

          {logs.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Bạn có chắc muốn xóa sạch toàn bộ lịch sử đăng bài?')) {
                  onClearLogs();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa Lịch Sử</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Tổng lượt đăng:</span>
          <span className="text-lg font-bold text-slate-900">{logs.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-600">Đăng thành công:</span>
          <span className="text-lg font-bold text-emerald-700">{successCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-medium text-rose-500">Chờ duyệt / Lỗi:</span>
          <span className="text-lg font-bold text-rose-600">{failedCount}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên nhóm hoặc nội dung..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({logs.length})
          </button>
          <button
            onClick={() => setStatusFilter('success')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Thành công ({successCount})
          </button>
          <button
            onClick={() => setStatusFilter('failed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'failed'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Lỗi / Duyệt ({failedCount})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">STT</th>
                <th className="px-4 py-3.5">Thời Gian</th>
                <th className="px-4 py-3.5">Nhóm Nhận Tin</th>
                <th className="px-4 py-3.5">Bài Tuyển Dụng</th>
                <th className="px-4 py-3.5">Đoạn Trích Nội Dung (Spintax)</th>
                <th className="px-4 py-3.5 text-center">Trạng Thái</th>
                <th className="px-4 py-3.5 text-right">Chi Tiết Facebook</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    Chưa có bản ghi nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  const isSuccess = log.status === 'success';
                  const dateStr = new Date(log.timestamp).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-center font-mono text-slate-400">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-900 max-w-[200px] truncate">
                        {log.groupName}
                      </td>

                      <td className="px-4 py-3 text-slate-800 max-w-[180px] truncate">
                        {log.postTitle}
                      </td>

                      <td className="px-4 py-3 text-slate-500 max-w-[240px] truncate font-mono text-[11px]">
                        {log.contentSnippet}
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                            isSuccess
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isSuccess ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Thành công</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>Chờ duyệt / Lỗi</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {log.fbPostLink ? (
                          <a
                            href={log.fbPostLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-semibold flex items-center justify-end gap-1"
                          >
                            <span>Xem bài</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px]">
                            {log.errorMessage || '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
