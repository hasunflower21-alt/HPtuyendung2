import { FBGroup, RecruitmentPost, AppSettings } from '../types';

export const initialSettings: AppSettings = {
  isAutoActive: true,
  postTimes: ['08:30', '17:30'],
  groupsPerRun: 20,
  delayMinSec: 15,
  delayMaxSec: 45,
  enableSpintax: true,
  fbToken: '',
  fbUserId: '100089234812391',
  fbUserName: 'Nguyễn Văn Hoàn (HR Manager)',
  fbUserAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  fbAccountType: 'personal_profile',
  mode: 'simulation',
  antiSpamVariation: true,
};

export const initialGroups: FBGroup[] = [
  {
    id: 'grp_1001',
    name: 'Tuyển Dụng & Việc Làm TP.HCM (480k TV)',
    memberCount: 480000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/tuyendungvieclamhcm',
    category: 'Tổng hợp',
    enabled: true,
    postSuccessCount: 42,
  },
  {
    id: 'grp_1002',
    name: 'Hội Tìm Việc Làm Hà Nội 24/7 (350k TV)',
    memberCount: 350000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/timvieclamhanoi247',
    category: 'Tổng hợp',
    enabled: true,
    postSuccessCount: 38,
  },
  {
    id: 'grp_1003',
    name: 'Tuyển Dụng Nhân Viên Kinh Doanh & Telesale Toàn Quốc',
    memberCount: 215000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/tuyendungtelesalesale',
    category: 'Kinh doanh / Sale',
    enabled: true,
    postSuccessCount: 35,
  },
  {
    id: 'grp_1004',
    name: 'Việc Làm Sinh Viên Part-time & Full-time Sài Gòn',
    memberCount: 195000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/vieclamsinhvienhcm',
    category: 'Sinh viên / Part-time',
    enabled: true,
    postSuccessCount: 29,
  },
  {
    id: 'grp_1005',
    name: 'Cộng Đồng Tuyển Dụng F&B - Nhà Hàng - Quán Cafe TP.HCM & HN',
    memberCount: 180000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/vieclamfnbvn',
    category: 'F&B / Nhà hàng',
    enabled: true,
    postSuccessCount: 31,
  },
  {
    id: 'grp_1006',
    name: 'Hội Việc Làm Văn Phòng - Kế Toán - Hành Chính Nhân Sự',
    memberCount: 260000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/vieclamvanphonghanoi',
    category: 'Văn phòng',
    enabled: true,
    postSuccessCount: 27,
  },
  {
    id: 'grp_1007',
    name: 'Tìm Việc Làm Bình Dương & Đồng Nai - Các KCN Lớn',
    memberCount: 310000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/vieclambinhduongdongnai',
    category: 'Khu công nghiệp',
    enabled: true,
    postSuccessCount: 40,
  },
  {
    id: 'grp_1008',
    name: 'Việc Làm Lao Động Phổ Thông & Đóng Gói - Lương Tuần/Liền',
    memberCount: 175000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/vieclamldpt',
    category: 'Lao động phổ thông',
    enabled: true,
    postSuccessCount: 33,
  },
  {
    id: 'grp_1009',
    name: 'Chợ Tuyển Dụng Việc Làm Đà Nẵng & Miền Trung',
    memberCount: 140000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/vieclamdanangmientrung',
    category: 'Đà Nẵng',
    enabled: true,
    postSuccessCount: 22,
  },
  {
    id: 'grp_1010',
    name: 'Tuyển Dụng Nhân Viên Bán Hàng & Thu Ngân Siêu Thị',
    memberCount: 165000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/tuyendungbanhangsieuthi',
    category: 'Bán hàng / Thu ngân',
    enabled: true,
    postSuccessCount: 25,
  },
  {
    id: 'grp_1011',
    name: 'Hội Tuyển Dụng Marketing, Designer & Content Creator',
    memberCount: 125000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/tuyendungmarketingdesigner',
    category: 'Marketing',
    enabled: true,
    postSuccessCount: 20,
  },
  {
    id: 'grp_1012',
    name: 'Việc Làm Sinh Viên Hà Nội - Nhận Việc Đi Làm Ngay',
    memberCount: 155000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/sinhvienhanoitimviec',
    category: 'Sinh viên / Part-time',
    enabled: true,
    postSuccessCount: 28,
  },
  {
    id: 'grp_1013',
    name: 'Tuyển Dụng IT & Developer Việt Nam (Junior - Senior)',
    memberCount: 150000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/tuyendungitdeveloper',
    category: 'Công nghệ thông tin',
    enabled: true,
    postSuccessCount: 19,
  },
  {
    id: 'grp_1014',
    name: 'Tuyển Dụng Chăm Sóc Khách Hàng / Call Center Trực Tổng Đài',
    memberCount: 110000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/cskhtructongdai',
    category: 'CSKH',
    enabled: true,
    postSuccessCount: 24,
  },
  {
    id: 'grp_1015',
    name: 'Hội Việc Làm Online & Remote Tại Nhà Uy Tín',
    memberCount: 230000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/vieclamonlinetainha',
    category: 'Online / Remote',
    enabled: true,
    postSuccessCount: 30,
  },
  {
    id: 'grp_1016',
    name: 'Tuyển Dụng Nhân Sự & Headhunter Việt Nam (HR Club)',
    memberCount: 92000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/hrheadhuntervn',
    category: 'Nhân sự HR',
    enabled: true,
    postSuccessCount: 18,
  },
  {
    id: 'grp_1017',
    name: 'Tìm Việc Làm Hải Phòng & Quảng Ninh 24h',
    memberCount: 128000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/vieclamhaiphongquangninh',
    category: 'Hải Phòng',
    enabled: true,
    postSuccessCount: 21,
  },
  {
    id: 'grp_1018',
    name: 'Hội Tuyển Dụng Tài Xế Lái Xe B2, C, D & Giao Nhận Toàn Quốc',
    memberCount: 118000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/tuyendungtaixelaixe',
    category: 'Tài xế / Giao vận',
    enabled: true,
    postSuccessCount: 23,
  },
  {
    id: 'grp_1019',
    name: 'Cộng Đồng Việc Làm Khách Sạn - Du Lịch - Lễ Tân',
    memberCount: 88000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/khachsandulichvn',
    category: 'Khách sạn / Du lịch',
    enabled: true,
    postSuccessCount: 16,
  },
  {
    id: 'grp_1020',
    name: 'Hội Việc Làm Cần Thơ & Miền Tây Nam Bộ',
    memberCount: 96000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/vieclamcanthomientay',
    category: 'Miền Tây',
    enabled: true,
    postSuccessCount: 22,
  },
  {
    id: 'grp_1021',
    name: 'Tuyển Dụng Thợ Kỹ Thuật, Điện Lạnh, Cơ Khí Tay Nghề Cao',
    memberCount: 84000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/kythuatcodienlanh',
    category: 'Kỹ thuật',
    enabled: true,
    postSuccessCount: 17,
  },
  {
    id: 'grp_1022',
    name: 'Việc Làm Thời Vụ & Khởi Nghiệp Sinh Viên Toàn Quốc',
    memberCount: 160000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    link: 'https://www.facebook.com/groups/vieclamthoivusv',
    category: 'Thời vụ',
    enabled: true,
    postSuccessCount: 26,
  },
];

export const initialPosts: RecruitmentPost[] = [
  {
    id: 'post_hoaphuong_01',
    title: 'CÔNG TY CP HOA PHƯỢNG ME - TUYỂN DỤNG CÁN BỘ HỒ SƠ / QS / GIÁM SÁT M&E',
    category: 'Kỹ sư / M&E',
    status: 'active',
    timesPosted: 18,
    createdAt: '2026-09-26T05:07:57.177Z',
    imageLayout: 'top_large',
    imageFit: 'cover',
    images: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    ],
    content: `Tại (Hà Nội & Hà Nam)
🔴 CÔNG TY CP HOA PHƯỢNG ME - TUYỂN DỤNG CÁN BỘ HỒ SƠ / CÁN BỘ QS / GIÁM SÁT M&E
🏗️ Dự án: Cao tầng Vingroup/Sungroup
🎓 Đặc biệt: Nhận Kỹ sư MỚI RA TRƯỜNG – Đào tạo từ đầu!
💰 Mức lương: 12 - 20 Triệu (Up to 25 Tr theo năng lực) + PC
✅ Cam kết: KHÔNG NỢ LƯƠNG | Thử việc 85% | Tăng lương theo hiệu quả
📄 Yêu cầu: Tốt nghiệp ĐH, có laptop, thạo Excel/Word, có trách nhiệm.
⏰ Thời gian: T2 - T7 (CN, Tăng ca tính hệ số)
Hotline / Zalo: 0966.203.310 (Liên hệ để được hỗ trợ nhanh nhất)
Email nhận CV: hp.hoannx@mehoaphuong.com`,
  },
  {
    id: 'post_2001',
    title: 'Tuyển 05 Nhân Viên Kinh Doanh / Telesales (Lương 12 - 25 Triệu)',
    category: 'Kinh doanh / Sale',
    status: 'active',
    timesPosted: 18,
    createdAt: '2026-09-26T05:07:57.177Z',
    imageLayout: 'top_large',
    imageFit: 'cover',
    images: [
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=800&q=80',
    ],
    content: `{CÔNG TY THÔNG BÁO TUYỂN DỤNG|CƠ HỘI NGHỀ NGHIỆP HẤP DẪN|TIN TUYỂN DỤNG NÓNG HỔI}! 🔥

🎯 VỊ TRÍ: {NHÂN VIÊN KINH DOANH|CHUYÊN VIÊN TƯ VẤN BÁN HÀNG|TELESALES DỰ ÁN}
📍 Địa điểm làm việc: {Văn phòng Quận 1, TP.HCM|Trung tâm Cầu Giấy, Hà Nội|Hỗ trợ Hybrid linh hoạt}
⏰ Thời gian: Giờ hành chính {Thứ 2 - Thứ 6 (nghỉ Thứ 7 & CN)|Thứ 2 - Sáng Thứ 7}

💰 QUYỀN LỢI & THU NHẬP:
• Lương cứng: {8.000.000đ - 12.000.000đ|Thỏa thuận theo năng lực} (Không áp KPI thử việc)
• Hoa hồng + Thưởng nóng doanh số: Thu nhập bình quân {15.000.000đ - 30.000.000đ/tháng|từ 18 đến 35 triệu/tháng}
• Đóng BHXH, BHYT đầy đủ theo quy định của Luật lao động
• Được đào tạo bài bản từ A-Z về kỹ năng giao tiếp và chốt deal
• Thưởng Lễ Tết, du lịch định kỳ hàng năm cùng công ty ✈️

📌 YÊU CẦU CÔNG VIỆC:
• Nam/Nữ từ 20 - 32 tuổi, giọng nói dễ nghe, nhanh nhẹn
• {Ưu tiên ứng viên có kinh nghiệm tư vấn/telesale, chưa có sẽ được đào tạo|Không yêu cầu kinh nghiệm, chỉ cần thái độ nhiệt huyết}
• Tự tin, có tinh thần cầu tiến và mong muốn bứt phá thu nhập

📩 CÁCH THỨC ỨNG TUYỂN:
👉 Nhắn tin trực tiếp qua Facebook / Zalo: {0988.xxx.xxx|0909.xxx.xxx} (Phòng Nhân Sự)
👉 Gửi CV về email: hr.recruitment.career@gmail.com
#tuyendung #vieclam #kinhdoanh #telesale #vieclamhcm #vieclamhanoi`,
  },
  {
    id: 'post_2002',
    title: 'Tuyển Nhân Viên Phục Vụ / Pha Chế Cafe & Nhà Hàng (Part/Full-time)',
    category: 'F&B / Nhà hàng',
    status: 'active',
    timesPosted: 14,
    createdAt: '2026-09-26T05:07:57.177Z',
    imageLayout: 'top_large',
    imageFit: 'cover',
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
    ],
    content: `{HỆ THỐNG CAFE & NHÀ HÀNG CẦN TUYỂN GẤP ĐỒNG ĐỘI|TUYỂN DỤNG PART-TIME & FULL-TIME CHO CÁC BẠN TRẺ}! ☕️🍽

⭐️ VỊ TRÍ:
1. {Nhân viên Phục Vụ / Thu Ngân|Phục vụ bàn & Chăm sóc khách}
2. {Nhân viên Pha Chế (Barista)|Pha chế thức uống cơ bản}

⏰ CA LÀM VIỆC LINH HOẠT (Phù hợp sinh viên):
• Ca sáng: 07h00 - 12h00
• Ca chiều: 12h00 - 17h30
• Ca tối: 17h30 - 23h00
(Có thể xoay ca linh hoạt theo lịch học)

💵 MỨC LƯƠNG:
• Part-time: {25.000đ - 32.000đ/giờ|28.000đ/giờ + Tip + Thưởng chuyên cần}
• Full-time: {7.500.000đ - 9.500.000đ/tháng|8.000.000đ - 10.500.000đ/tháng} + Phụ cấp ăn uống + Thưởng doanh thu

✨ ĐIỀU KIỆN:
• Nam/Nữ từ đủ 18 tuổi, hoạt bát, vui vẻ, trung thực
• Không cần kinh nghiệm, quản lý sẽ hướng dẫn tận tình ngày đầu!

📞 LIÊN HỆ ĐĂNG KÝ CA NGAY:
Inbox fanpage hoặc liên hệ Hotline/Zalo Quản lý: 0912.xxx.xxx
#tuyendungfnb #phucvu #phache #parttime #vieclamsinhvien`,
  },
  {
    id: 'post_2003',
    title: 'Tuyển Nhân Viên Văn Phòng / Hành Chính - Kế Toán Nội Bộ',
    category: 'Văn phòng',
    status: 'active',
    timesPosted: 9,
    createdAt: '2026-09-26T05:07:57.177Z',
    imageLayout: 'top_large',
    imageFit: 'cover',
    images: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
    ],
    content: `{THÔNG BÁO TUYỂN DỤNG NHÂN SỰ VĂN PHÒNG|CÔNG TY MỞ RỘNG QUY MÔ CẦN BỔ SUNG NHÂN SỰ}! 💼

🏢 VỊ TRÍ: {NHÂN VIÊN HÀNH CHÍNH VĂN PHÒNG|KẾ TOÁN NỘI BỘ & HỖ TRỢ DỰ ÁN}
⏰ Thời gian: Giờ hành chính 08h00 - 17h30 (Thứ 2 đến Thứ 6, Thứ 7 làm cách tuần)

💎 MỨC LƯƠNG & CHẾ ĐỘ:
• Thu nhập: {9.000.000đ - 13.000.000đ/tháng|10.000.000đ - 14.000.000đ/tháng tùy kinh nghiệm}
• Chế độ BHXH, BHYT, BHTN theo chuẩn nhà nước
• Thưởng tháng 13, thưởng năng suất quý, du lịch công ty
• Môi trường làm việc trẻ trung 9x, trà sữa bánh ngọt hàng tuần 🍰

🎯 MÔ TẢ CÔNG VIỆC:
• Soạn thảo hợp đồng, quản lý hồ sơ giấy tờ, lưu trữ chứng từ
• Theo dõi xuất nhập tồn, thanh toán nội bộ công ty
• Hỗ trợ các công việc hành chính văn phòng theo chỉ đạo

📩 ỨNG TUYỂN:
Gửi CV qua Email: hr.admin@tuyendungcongty.com hoặc Inbox trực tiếp trao đổi cụ thể.
#tuyendung #nhanvienvanphong #ketoan #hanhchinh #vieclam`,
  },
];
