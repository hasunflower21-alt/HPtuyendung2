import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Key,
  Layers,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Play,
  Shuffle,
  Users2,
  HelpCircle,
  Smartphone,
  Monitor,
  Pin,
  ArrowRight,
  Package,
  Download,
  Zap,
} from 'lucide-react';

interface GuideTabProps {
  onNavigateTab: (tab: 'dashboard' | 'posts' | 'groups' | 'settings' | 'logs' | 'guide') => void;
}

export const GuideTab: React.FC<GuideTabProps> = ({ onNavigateTab }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const steps = [
    {
      num: 1,
      title: 'Kết Nối Tài Khoản Facebook Chính Chủ',
      badge: 'Bắt Buộc Lần Đầu',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      actionTab: 'settings' as const,
      actionText: 'Vào Cài Đặt Token',
      summary:
        'Hệ thống dùng Nick cá nhân hoặc Fanpage chính chủ của bạn để đăng bài vào các nhóm mà bạn đã tham gia.',
      bullets: [
        'Truy cập tab "Cài Đặt Lịch & Token".',
        'Lấy Facebook Access Token chính chủ từ Meta Graph API Explorer (Cần 2 quyền: publish_to_groups và groups_access_member_info).',
        'Dán mã Token và bấm "Xác Thực Token": Tên thật, UID, Avatar và nhóm của bạn sẽ được kết nối.',
        'Mẹo: Nếu chưa có Token, bạn có thể chọn chế độ "Mô Phỏng Kiểm Thử (Safe Simulator)" để thử nghiệm quy trình đăng.',
      ],
    },
    {
      num: 2,
      title: 'Quản Lý 20+ Nhóm Tuyển Dụng Đã Vào Sẵn',
      badge: 'Danh Sách Nhóm',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionTab: 'groups' as const,
      actionText: 'Xem 20+ Nhóm',
      summary:
        'Đã nạp sẵn 22 nhóm tuyển dụng lớn (>4.2 triệu thành viên). Bạn có thể thêm hoặc bật/tắt nhóm bất kỳ.',
      bullets: [
        'Vào tab "20+ Nhóm Đã Tham Gia" để xem toàn bộ danh sách.',
        'Bấm nút "Chọn Chuẩn 20 Nhóm" để hệ thống tự động lọc đúng 20 nhóm ưu tiên cho mỗi đợt đăng.',
        'Thêm nhóm mới: Bấm "Thêm Nhóm Mới" và dán Link Facebook nhóm mà nick chính chủ đã tham gia.',
        'Có thể bật/tắt từng nhóm linh hoạt bằng công tắc gạt xanh/xám.',
      ],
    },
    {
      num: 3,
      title: 'Soạn Bài Đăng, Đính Kèm Ảnh Flyer & Trợ Lý AI',
      badge: 'Nội Dung & Ảnh',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      actionTab: 'posts' as const,
      actionText: 'Soạn Bài Viết',
      summary:
        'Chuẩn bị sẵn nội dung tin tuyển dụng thu hút, ảnh flyer đẹp mắt và áp dụng Spintax chống spam.',
      bullets: [
        'Dùng Trợ Lý AI Gemini 3.8 Flash: Nhấn "Tạo Bằng AI Gemini", điền vị trí công việc, mức lương. AI sẽ tự động tạo bài viết chuẩn Facebook kèm emoji hấp dẫn.',
        'Đính kèm hình ảnh: Tải ảnh từ điện thoại/máy tính hoặc chọn các banner có sẵn trong thư viện.',
        'Cú pháp Spintax chống spam: Áp dụng cú pháp {Từ 1|Từ 2|Từ 3}. Mỗi nhóm sẽ nhận 1 biến thể từ ngữ khác nhau, Facebook không quét trùng lặp.',
        'Xem trước thực tế (Mockup): Giao diện mô phỏng 100% hiển thị thật trên Facebook app di động và máy tính.',
      ],
    },
    {
      num: 4,
      title: 'Lập Trình Tự Động 100% (2 Lần/Ngày)',
      badge: 'Tự Động Hóa',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      actionTab: 'dashboard' as const,
      actionText: 'Xem Bảng Điều Khiển',
      summary:
        'Hệ thống tự động chạy ngầm trên máy chủ đúng khung giờ 08:30 sáng và 17:30 chiều.',
      bullets: [
        'Khung giờ vàng chuẩn: 08:30 (Đầu ngày tìm việc) & 17:30 (Tan tầm lướt mạng). Có thể đổi giờ bất kỳ.',
        'Không cần mở máy: Máy chủ cloud chạy liên tục 24/7, tự kích hoạt đợt đăng kể cả khi bạn tắt máy tính.',
        'Nghỉ ngẫu nhiên 15s - 45s: Giữa 2 bài đăng liên tiếp vào các nhóm, hệ thống tự động giãn cách an toàn như người thật gõ phím để chống chặn checkpoint.',
        'Nút "Kích Hoạt Đăng Ngay": Cho phép kích hoạt 1 đợt đăng khẩn cấp bất kỳ lúc nào nếu có đợt tuyển gấp.',
      ],
    },
    {
      num: 5,
      title: 'Xem Báo Cáo Thời Gian Thực & Xuất File CSV',
      badge: 'Báo Cáo Chi Tiết',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      actionTab: 'logs' as const,
      actionText: 'Xem Nhật Ký Đăng',
      summary:
        'Minh bạch 100% với đường dẫn trực tiếp tới từng bài viết Facebook trong mỗi nhóm và xuất báo cáo.',
      bullets: [
        'Nhật ký chi tiết: Thời gian đăng chính xác từng giây, tên nhóm, ID nhóm, nội dung đã biến đổi Spintax.',
        'Nút "Xem bài": Nhấp để nhảy thẳng tới bài đăng trên Facebook của nhóm đó để kiểm tra tương tác.',
        'Thống kê tỷ lệ: Tính toán chính xác số bài thành công, bài chờ Admin duyệt và tỷ lệ hoàn thành.',
        'Xuất Excel/CSV: 1 cú click để tải file nhật ký gửi cho bộ phận nhân sự hoặc quản lý.',
      ],
    },
  ];

  const faqs = [
    {
      q: '1. Facebook có quét khóa nick khi đăng tự động không?',
      a: 'Nếu dùng tool spam gửi 50-100 nhóm cùng lúc với nội dung giống hệt nhau, Facebook sẽ checkpoint ngay. AutoRecruit an toàn tuyệt đối nhờ 3 nguyên tắc: (1) Chuẩn 20 nhóm/lần; (2) Nghỉ ngẫu nhiên 15-45 giây giữa các bài như người thật; (3) Tự động đổi Spintax để nội dung mỗi bài khác biệt hoàn toàn.',
    },
    {
      q: '2. Tôi có cần mở trình duyệt liên tục để hệ thống tự đăng không?',
      a: 'Không cần. Bộ lập lịch (Cron Scheduler) chạy trực tiếp trên máy chủ backend 24/7. Đúng 08:30 và 17:30 mỗi ngày, máy chủ sẽ tự kích hoạt đợt đăng ngầm ngay cả khi bạn tắt máy tính hay điện thoại.',
    },
    {
      q: '3. Làm thế nào để lấy Token Facebook chính chủ an toàn nhất?',
      a: 'Bạn truy cập công cụ chính thức của Meta tại https://developers.facebook.com/tools/explorer/, chọn ứng dụng của bạn và cấp quyền publish_to_groups, groups_access_member_info rồi nhấn Generate Access Token. Hoặc bạn có thể dùng Chế độ Mô Phỏng (Safe Simulator) có sẵn trong app để chạy thử nghiệm an toàn.',
    },
    {
      q: '4. Cú pháp Spintax là gì và hoạt động thế nào?',
      a: 'Spintax là cách viết văn bản dạng {Lựa chọn 1|Lựa chọn 2|Lựa chọn 3}. Khi đăng tới Nhóm A, hệ thống sẽ chọn "Lựa chọn 1"; tới Nhóm B hệ thống chọn "Lựa chọn 2". Nhờ đó 20 bài đăng vào 20 nhóm có nội dung khác biệt hoàn toàn nhưng cùng truyền tải 1 thông điệp tuyển dụng.',
    },
    {
      q: '5. Nếu nhóm có chế độ duyệt bài từ Quản trị viên thì sao?',
      a: 'Bài viết sau khi đăng tự động sẽ nằm trong hàng đợi duyệt của nhóm đó. Hệ thống sẽ ghi nhận trạng thái "Chờ duyệt / Pending" trong bảng nhật ký.',
    },
    {
      q: '6. Khắc phục lỗi Cloudflare Pages: "npm ENOENT: không tìm thấy /opt/buildhome/repo/package.json"?',
      a: 'Lỗi này xảy ra khi toàn bộ code trên GitHub đang nằm bên trong một thư mục con chứ không nằm ngay ở thư mục gốc của repository. Cách xử lý: Trên Cloudflare Pages -> Settings -> Builds & deployments -> Edit build configuration -> Tại ô "Root directory (Path)", hãy điền tên thư mục con đó (hoặc nếu đẩy từ máy tính, hãy đảm bảo file package.json nằm ngay ngoài cùng của repo GitHub). Đồng thời trong Settings -> Environment variables, thêm biến NODE_VERSION = 20.',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* 1. HERO BANNER - BỐ CỤC GỌN GÀNG, CHỮ CHUẨN KÍCH THƯỚC */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-7 rounded-3xl shadow-sm border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black tracking-wide uppercase">
            <Pin className="w-3 h-3 fill-current" />
            TAB GIM CHÍNH THỨC
          </span>
          <span className="text-xs text-slate-400">• Đọc 1 lần, hiểu ngay toàn bộ</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Cẩm Nang Hướng Dẫn Vận Hành AutoRecruit FB 24/7
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Quy trình chuẩn hóa tự động đăng bài tuyển dụng từ Facebook chính chủ tới <strong className="text-white">20 nhóm đã tham gia sẵn</strong>, tần suất <strong className="text-white">2 lần/ngày</strong> (08:30 & 17:30) kèm hình ảnh và cơ chế chống checkpoint 100%.
        </p>

        {/* Quick Launch Button */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Vào Bảng Điều Khiển Để Đăng Ngay</span>
          </button>
          <span className="text-xs text-slate-400">hoặc xem chi tiết từng bước bên dưới:</span>
        </div>
      </div>

      {/* ĐẶC BIỆT: GIẢI PHÁP TỰ ĐỘNG 100% BẰNG CHROME EXTENSION */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-7 border-2 border-amber-500/50 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase">
                Giải Pháp Tự Động 100% Khuyên Dùng
              </span>
              <span className="text-xs text-amber-300 font-bold">● Đăng Thật 100%</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Cài Tiện Ích Chrome Extension: Tự Mở Nhóm, Điền Bài & Tự Bấm Đăng 20 Nhóm
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Vì Facebook đã đóng API đăng nhóm từ 04/2024, một <strong>Chrome Extension</strong> cài trực tiếp vào trình duyệt là cách duy nhất và an toàn nhất để máy tự động mở từng tab nhóm, tự điền bài viết Spintax, tự bấm nút "Đăng" màu xanh của Facebook và tự chuyển nhóm tiếp theo!
            </p>
          </div>

          <div className="shrink-0">
            <a
              href="/autorecruit-fb-extension.zip"
              download="autorecruit-fb-extension.zip"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Tải Tiện Ích (.ZIP) Về Máy</span>
            </a>
          </div>
        </div>

        {/* 4 Bước Cài Đặt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[11px]">1</span>
              <span>Tải & Giải Nén</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Bấm nút tải file <code className="text-amber-200">autorecruit-fb-extension.zip</code> về máy, chuột phải chọn "Extract All" để giải nén.
            </p>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[11px]">2</span>
              <span>Mở Trang Extension</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Trên Chrome hoặc Cốc Cốc, gõ vào thanh địa chỉ: <code className="text-amber-200">chrome://extensions</code> rồi nhấn Enter.
            </p>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[11px]">3</span>
              <span>Bật Developer Mode</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Ở góc trên bên phải màn hình, gạt bật công tắc <strong>"Chế độ dành cho nhà phát triển"</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[11px]">4</span>
              <span>Tải Đã Giải Nén</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Bấm <strong>"Tải tiện ích đã giải nén"</strong> ở góc trái và chọn thư mục vừa giải nén. Bấm Extension và chạy tự động!
            </p>
          </div>
        </div>
      </div>

      {/* 2. BỐ CỤC 5 BƯỚC THAO TÁC RÕ RÀNG */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Quy Trình 5 Bước Vận Hành Chi Tiết</span>
          </h2>
          <span className="text-xs text-slate-500">Từ chuẩn bị đến đăng bài tự động</span>
        </div>

        <div className="space-y-3.5">
          {steps.map((st) => (
            <div
              key={st.num}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              {/* Header của từng bước */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                    {st.num}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">
                        {st.title}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.badgeColor}`}>
                        {st.badge}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab(st.actionTab)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 transition-colors self-start sm:self-auto shrink-0"
                >
                  <span>{st.actionText}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Tóm tắt */}
              <p className="text-xs text-slate-600 font-medium leading-relaxed pl-11">
                {st.summary}
              </p>

              {/* Chi tiết từng ý (gạch đầu dòng rõ ràng, xuống dòng chuẩn) */}
              <div className="bg-slate-50 rounded-xl p-3.5 pl-4 sm:pl-11 space-y-2 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                {st.bullets.map((b, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. QUY TẮC AN TOÀN CHỐNG CHẶN FACEBOOK */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900">
            3 Quy Tắc Giữ Tài Khoản Facebook An Toàn 100%
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              1. Tần Suất 2 Lần/Ngày
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Khung giờ 08:30 và 17:30 là chuẩn tự nhiên. Tránh đăng liên tục dồn dập trong ngày.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5 text-blue-600" />
              2. Chuẩn 20 Nhóm/Lần
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              20 nhóm là giới hạn tối ưu do Facebook khuyến nghị để không bị thuật toán spam chú ý.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Shuffle className="w-3.5 h-3.5 text-blue-600" />
              3. Giãn Cách & Spintax
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Hệ thống tự động nghỉ 15s - 45s giữa mỗi bài và đổi từ ngữ để bài viết luôn khác biệt.
            </p>
          </div>
        </div>
      </div>

      {/* 4. CÂU HỎI THƯỜNG GẶP (FAQ) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-900">
            Các Câu Hỏi Thường Gặp (FAQ)
          </h3>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all text-xs"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 bg-slate-50 hover:bg-slate-100 transition-colors font-bold text-slate-800"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-3.5 bg-white text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
