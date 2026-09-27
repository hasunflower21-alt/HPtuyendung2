import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  X,
  Copy,
  Terminal,
  ChevronRight,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface ExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtensionModal: React.FC<ExtensionModalProps> = ({ isOpen, onClose }) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'manifest' | 'content' | 'background'>('content');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyCode = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

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
                  Tiện Ích Mở Rộng: Đăng Bài Tự Động 100% (Chrome Extension)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                  GIẢI PHÁP TỐT NHẤT
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Tự động mở từng nhóm Facebook, tự động điền bài và tự bấm nút Đăng mà bạn không cần chạm tay
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Main Download CTA Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-blue-500/10 border-2 border-amber-500/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-lg">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Đã đóng gói hoàn chỉnh trọn bộ mã nguồn
              </span>
              <h4 className="text-lg font-black text-slate-900 leading-snug">
                Tải Tiện Ích "AutoRecruit FB" Dành Cho Chrome & Cốc Cốc
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tệp ZIP bao gồm đầy đủ tệp manifest V3, background worker và content script tự động can thiệp DOM Facebook. Cài đặt chỉ mất 30 giây!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
              <a
                href="/autorecruit-fb-extension.zip"
                download="autorecruit-fb-extension.zip"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Tải Bộ Cài (.ZIP) Ngay</span>
              </a>
            </div>
          </div>

          {/* 3 ĐIỂM HOÀN THIỆN ĐÃ ĐƯỢC CẬP NHẬT */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1">
              <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                1. ĐÚNG VỊ TRÍ
              </span>
              <p className="text-[11px] text-blue-800/80 leading-relaxed">
                Tự động nhận diện nhóm Mua & Bán để chuyển sang tab <strong>Thảo luận</strong>. Tuyệt đối không bấm nhầm vào ô "Bán gì đó".
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
              <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                2. ĐÚNG NHÓM
              </span>
              <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                Dán trực tiếp danh sách 20 link nhóm thật của bạn vào Extension hoặc bấm nút <strong>"🔄 Lấy từ Web App"</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1">
              <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                3. ĐÚNG NỘI DUNG
              </span>
              <p className="text-[11px] text-amber-800/80 leading-relaxed">
                Chọn chính xác bài viết bạn đã soạn từ menu. Hỗ trợ tùy chọn giữ <strong>100% nguyên văn bài gốc</strong> hoặc dùng Spintax.
              </p>
            </div>
          </div>

          {/* 4 Steps Visual Installation Guide */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>4 Bước Cài Đặt Nhanh Trong 1 Phút:</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black">
                    1
                  </span>
                  <span>Giải nén tệp vừa tải</span>
                </div>
                <p className="text-slate-600 pl-7 leading-relaxed">
                  Bấm nút màu cam phía trên để tải file <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">autorecruit-fb-extension.zip</code>. Chuột phải vào file và chọn <strong>"Extract All"</strong> (Giải nén ra thư mục).
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black">
                    2
                  </span>
                  <span>Mở trang Quản lý tiện ích</span>
                </div>
                <p className="text-slate-600 pl-7 leading-relaxed">
                  Trên trình duyệt Chrome hoặc Cốc Cốc, gõ vào thanh địa chỉ: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px] font-bold text-blue-700">chrome://extensions</code> rồi nhấn Enter.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black">
                    3
                  </span>
                  <span>Bật Chế độ Nhà phát triển</span>
                </div>
                <p className="text-slate-600 pl-7 leading-relaxed">
                  Nhìn lên góc trên bên phải màn hình, gạt bật công tắc <strong>"Chế độ dành cho nhà phát triển" (Developer mode)</strong>.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black">
                    4
                  </span>
                  <span>Chọn thư mục và Chạy</span>
                </div>
                <p className="text-slate-600 pl-7 leading-relaxed">
                  Bấm nút <strong>"Tải tiện ích đã giải nén" (Load unpacked)</strong> ở góc trái và chọn thư mục vừa giải nén ở Bước 1. Xong!
                </p>
              </div>
            </div>
          </div>

          {/* How to use */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <div className="font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cách Sử Dụng Extension Đăng Tự Động 100%:</span>
            </div>
            <p className="leading-relaxed">
              1. Bấm vào biểu tượng mảnh ghép 🧩 ở góc trên bên phải trình duyệt và ghim tiện ích <strong>"AutoRecruit FB"</strong> ra ngoài.<br />
              2. Bấm vào icon của tiện ích để mở bảng điều khiển nhỏ.<br />
              3. Bấm nút <strong>"⚡ BẮT ĐẦU ĐĂNG TỰ ĐỘNG 20 NHÓM"</strong>.<br />
              👉 Tiện ích sẽ <strong>tự mở từng nhóm Facebook</strong> trong danh sách 20 nhóm, <strong>tự điền nội dung Spintax</strong>, <strong>tự bấm nút Đăng</strong> màu xanh của Facebook, <strong>đợi 20 giây an toàn</strong> rồi tự chuyển sang nhóm kế tiếp cho đến khi hoàn thành!
            </p>
          </div>

          {/* Security Assurance */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Tại sao phương án Chrome Extension lại an toàn tuyệt đối?</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Extension chạy trực tiếp trên phiên đăng nhập Facebook chính chủ bạn đang lướt hàng ngày. Bạn <strong>không cần phải cung cấp mật khẩu, không cần nhập Token bí mật</strong>. Facebook nhận diện hành vi gửi bài từ chính trình duyệt của bạn với giãn cách an toàn 20 giây nên hoàn toàn không bị đánh dấu bot spam hay checkpoint.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 hidden sm:inline">
            Hỗ trợ Google Chrome, Cốc Cốc, Microsoft Edge, Brave Browser
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors ml-auto"
          >
            Đóng Hướng Dẫn
          </button>
        </div>
      </div>
    </div>
  );
};
