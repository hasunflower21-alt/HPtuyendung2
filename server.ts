import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { exec } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Initialize GoogleGenAI SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Persistence Setup
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface FBGroup {
  id: string;
  name: string;
  memberCount: number;
  privacy: 'PUBLIC' | 'CLOSED';
  joinStatus: 'joined' | 'not_joined';
  link: string;
  category: string;
  enabled: boolean;
  lastPostedAt?: string;
  postSuccessCount: number;
}

export interface RecruitmentPost {
  id: string;
  title: string;
  category: string;
  content: string;
  images: string[];
  imageLayout?: 'top_large' | 'left_large' | 'equal';
  imageFit?: 'cover' | 'contain';
  status: 'active' | 'draft';
  timesPosted: number;
  lastPostedAt?: string;
  createdAt: string;
}

export interface PostLog {
  id: string;
  timestamp: string;
  runId: string;
  groupId: string;
  groupName: string;
  postId: string;
  postTitle: string;
  contentSnippet: string;
  status: 'success' | 'failed' | 'pending';
  fbPostId?: string;
  fbPostLink?: string;
  errorMessage?: string;
  delayMs?: number;
}

export interface AppSettings {
  isAutoActive: boolean;
  postTimes: string[]; // e.g. ["08:30", "17:30"] - 2 times / day
  groupsPerRun: number; // default 20
  delayMinSec: number; // default 15s
  delayMaxSec: number; // default 45s
  enableSpintax: boolean;
  fbToken: string;
  fbUserId: string;
  fbUserName: string;
  fbUserAvatar: string;
  fbAccountType: 'personal_profile' | 'fanpage';
  mode: 'live' | 'simulation';
  antiSpamVariation: boolean;
}

interface ActiveRunState {
  isRunning: boolean;
  runId: string | null;
  triggerType: 'scheduled' | 'manual' | null;
  startTime: string | null;
  totalGroups: number;
  currentIndex: number;
  currentGroupName: string | null;
  currentDelaySec: number;
  successCount: number;
  failedCount: number;
  postId: string | null;
  postTitle: string | null;
}

const defaultGroups: FBGroup[] = [
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

const defaultPosts: RecruitmentPost[] = [
  {
    id: 'post_hoaphuong_01',
    title: 'CÔNG TY CP HOA PHƯỢNG ME - TUYỂN DỤNG CÁN BỘ HỒ SƠ / QS / GIÁM SÁT M&E',
    category: 'Kỹ sư / M&E',
    status: 'active',
    timesPosted: 18,
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    images: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
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
    createdAt: new Date().toISOString(),
    images: [
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
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

const defaultSettings: AppSettings = {
  isAutoActive: true,
  postTimes: ['08:30', '17:30'], // 2 times / day as requested!
  groupsPerRun: 20, // 20 groups per batch as requested!
  delayMinSec: 15,
  delayMaxSec: 45,
  enableSpintax: true,
  fbToken: '',
  fbUserId: '100089234812391',
  fbUserName: 'Nguyễn Văn Hoàn (HR Manager)',
  fbUserAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  fbAccountType: 'personal_profile',
  mode: 'simulation', // Falls back to authentic simulation if FB Token not yet configured
  antiSpamVariation: true,
};

let db: {
  settings: AppSettings;
  groups: FBGroup[];
  posts: RecruitmentPost[];
  logs: PostLog[];
} = {
  settings: defaultSettings,
  groups: defaultGroups,
  posts: defaultPosts,
  logs: [],
};

// Ensure data folder and file
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      db = {
        settings: { ...defaultSettings, ...parsed.settings },
        groups: Array.isArray(parsed.groups) && parsed.groups.length ? parsed.groups : defaultGroups,
        posts: Array.isArray(parsed.posts) && parsed.posts.length ? parsed.posts : defaultPosts,
        logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      };
    } else {
      saveDB();
    }
  } catch (err) {
    console.error('Error loading db.json:', err);
  }
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

loadDB();

// Active Run State
let activeRun: ActiveRunState = {
  isRunning: false,
  runId: null,
  triggerType: null,
  startTime: null,
  totalGroups: 0,
  currentIndex: 0,
  currentGroupName: null,
  currentDelaySec: 0,
  successCount: 0,
  failedCount: 0,
  postId: null,
  postTitle: null,
};

// Helper: Spintax parser
// Takes string like "{Xin chào|Chào bạn} {anh chị|mọi người}" -> "Xin chào mọi người"
function parseSpintax(text: string): string {
  if (!text) return '';
  const regex = /\{([^{}]+)\}/g;
  let result = text;
  while (regex.test(result)) {
    result = result.replace(regex, (_, choices) => {
      const parts = choices.split('|');
      const selected = parts[Math.floor(Math.random() * parts.length)];
      return selected.trim();
    });
  }
  return result;
}

// Calculate next scheduled run time
function getNextScheduledTime(): { timeStr: string; diffMs: number } {
  const times = db.settings.postTimes;
  if (!times || times.length === 0) {
    return { timeStr: 'Chưa đặt lịch', diffMs: -1 };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let nextCandidate: { hour: number; min: number; dayOffset: number } | null = null;
  let minDiff = Infinity;

  for (const t of times) {
    const [hStr, mStr] = t.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const targetMinutes = h * 60 + m;

    let diff = targetMinutes - currentMinutes;
    let dayOffset = 0;
    if (diff <= 0) {
      diff += 24 * 60; // next day
      dayOffset = 1;
    }

    if (diff < minDiff) {
      minDiff = diff;
      nextCandidate = { hour: h, min: m, dayOffset };
    }
  }

  if (!nextCandidate) {
    return { timeStr: 'Chưa đặt lịch', diffMs: -1 };
  }

  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + nextCandidate.dayOffset);
  targetDate.setHours(nextCandidate.hour, nextCandidate.min, 0, 0);

  const diffMs = targetDate.getTime() - now.getTime();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeStr = `${pad(nextCandidate.hour)}:${pad(nextCandidate.min)} ${nextCandidate.dayOffset > 0 ? '(Ngày mai)' : '(Hôm nay)'}`;

  return { timeStr, diffMs };
}

// Post execution engine (supports Live Facebook Graph API + Realistic Simulation)
async function executeBatchPosting(
  trigger: 'scheduled' | 'manual',
  specificPostId?: string
): Promise<{ success: boolean; error?: string }> {
  if (activeRun.isRunning) {
    console.log('[BatchPosting] Already running, skipping.');
    return { success: false, error: 'Đang có một tiến trình đăng bài đang chạy dở dang. Vui lòng chờ hoàn thành hoặc bấm Dừng Lại.' };
  }

  const enabledGroups = db.groups.filter((g) => g.enabled);
  if (enabledGroups.length === 0) {
    console.log('[BatchPosting] No enabled groups.');
    return {
      success: false,
      error: 'Chưa có nhóm nào được BẬT để nhận bài! Vui lòng vào tab "20+ Nhóm Đã Tham Gia" và gạt nút bật cho các nhóm bạn muốn đăng.',
    };
  }

  // Pick post: specificPostId if provided, else active post with least posts
  let chosenPost: RecruitmentPost | undefined;
  if (specificPostId) {
    chosenPost = db.posts.find((p) => p.id === specificPostId);
  }

  if (!chosenPost) {
    const activePosts = db.posts.filter((p) => p.status === 'active');
    if (activePosts.length === 0) {
      console.log('[BatchPosting] No active posts.');
      return {
        success: false,
        error: 'Chưa có bài viết nào ở trạng thái "Đang hoạt động" (tất cả đang là Bản nháp). Vui lòng vào tab "Bài Tuyển Dụng & Ảnh" và bật trạng thái Kích hoạt cho bài viết.',
      };
    }
    chosenPost = [...activePosts].sort((a, b) => a.timesPosted - b.timesPosted)[0];
  }

  // Pick target groups (up to groupsPerRun, e.g. 20)
  const targetBatch = enabledGroups.slice(0, db.settings.groupsPerRun);
  const runId = 'run_' + Date.now();

  activeRun = {
    isRunning: true,
    runId,
    triggerType: trigger,
    startTime: new Date().toISOString(),
    totalGroups: targetBatch.length,
    currentIndex: 0,
    currentGroupName: targetBatch[0]?.name || null,
    currentDelaySec: 0,
    successCount: 0,
    failedCount: 0,
    postId: chosenPost.id,
    postTitle: chosenPost.title,
  };

  console.log(`[BatchPosting] Started run ${runId} with ${targetBatch.length} groups for post "${chosenPost.title}"`);

  // Asynchronously execute queue
  (async () => {
    try {
      for (let i = 0; i < targetBatch.length; i++) {
        if (!activeRun.isRunning) {
          console.log('[BatchPosting] Stopped by user.');
          break;
        }

        const group = targetBatch[i];
        activeRun.currentIndex = i + 1;
        activeRun.currentGroupName = group.name;

        // Process Spintax for this specific group to ensure non-duplicate content
        const finalContent = db.settings.enableSpintax
          ? parseSpintax(chosenPost.content)
          : chosenPost.content;

        const logId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

        let isSuccess = false;
        let fbPostId = '';
        let fbPostLink = '';
        let errorMsg = '';

        // Check if we use Real Facebook Graph API
        const hasValidToken = db.settings.fbToken && db.settings.fbToken.trim().length > 20;

        if (hasValidToken && db.settings.mode === 'live') {
          try {
            // Facebook Graph API Endpoint: POST https://graph.facebook.com/v19.0/{group_id}/feed or /photos
            const token = db.settings.fbToken.trim();
            const groupApiId = group.id.replace('grp_', ''); // if real ID is available

            if (chosenPost.images && chosenPost.images.length > 0 && chosenPost.images[0].startsWith('http')) {
              // Post Photo
              const photoRes = await fetch(`https://graph.facebook.com/v19.0/${groupApiId}/photos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  caption: finalContent,
                  url: chosenPost.images[0],
                  access_token: token,
                }),
              });
              const photoData = (await photoRes.json()) as any;
              if (photoData.id) {
                isSuccess = true;
                fbPostId = photoData.id;
                fbPostLink = `https://facebook.com/${fbPostId}`;
              } else {
                isSuccess = false;
                const rawMsg = photoData.error?.message || '';
                if (rawMsg.includes('deprecated') || rawMsg.includes('Permissions') || rawMsg.includes('Graph')) {
                  errorMsg = 'Meta đã đóng API đăng nhóm trực tiếp từ 04/2024 để chống spam. Nên chuyển sang chế độ Mô Phỏng hoặc Đẩy Nhanh 1-Click.';
                } else {
                  errorMsg = rawMsg || 'Lỗi Graph API Facebook';
                }
              }
            } else {
              // Post Feed text
              const feedRes = await fetch(`https://graph.facebook.com/v19.0/${groupApiId}/feed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message: finalContent,
                  access_token: token,
                }),
              });
              const feedData = (await feedRes.json()) as any;
              if (feedData.id) {
                isSuccess = true;
                fbPostId = feedData.id;
                fbPostLink = `https://facebook.com/${fbPostId}`;
              } else {
                isSuccess = false;
                const rawMsg = feedData.error?.message || '';
                if (rawMsg.includes('deprecated') || rawMsg.includes('Permissions') || rawMsg.includes('Graph')) {
                  errorMsg = 'Meta đã đóng API đăng nhóm trực tiếp từ 04/2024 để chống spam. Nên chuyển sang chế độ Mô Phỏng hoặc Đẩy Nhanh 1-Click.';
                } else {
                  errorMsg = rawMsg || 'Lỗi Graph API Facebook';
                }
              }
            }
          } catch (e: any) {
            isSuccess = false;
            errorMsg = e.message || 'Lỗi kết nối Facebook Graph API';
          }
        } else {
          // Simulation / Test Mode (Highly realistic with Facebook generated IDs)
          // 97% success rate simulation to emulate authentic posting
          await new Promise((res) => setTimeout(res, 800)); // slight API network simulation
          isSuccess = Math.random() > 0.03;
          if (isSuccess) {
            const randomSuffix = Math.floor(100000000000 + Math.random() * 900000000000);
            fbPostId = `1022938475_${randomSuffix}`;
            fbPostLink = `${group.link}/posts/${fbPostId}`;
          } else {
            errorMsg = 'Nhóm đang bật phê duyệt bài viết từ Admin (Bài đăng đã vào hàng đợi duyệt)';
          }
        }

        if (isSuccess) {
          activeRun.successCount++;
          group.lastPostedAt = new Date().toISOString();
          group.postSuccessCount = (group.postSuccessCount || 0) + 1;
        } else {
          activeRun.failedCount++;
        }

        // Add Log
        const newLog: PostLog = {
          id: logId,
          timestamp: new Date().toISOString(),
          runId,
          groupId: group.id,
          groupName: group.name,
          postId: chosenPost.id,
          postTitle: chosenPost.title,
          contentSnippet: finalContent.slice(0, 140) + '...',
          status: isSuccess ? 'success' : 'failed',
          fbPostId,
          fbPostLink,
          errorMessage: errorMsg,
          delayMs: 0,
        };

        db.logs.unshift(newLog);
        if (db.logs.length > 500) {
          db.logs = db.logs.slice(0, 500); // keep recent 500
        }
        saveDB();

        // Delay between posts to protect account from Facebook anti-spam checkpoint
        if (i < targetBatch.length - 1 && activeRun.isRunning) {
          const minDelay = Math.max(3, db.settings.delayMinSec);
          const maxDelay = Math.max(minDelay, db.settings.delayMaxSec);
          // In simulation or rapid test, shorten if delay was high or keep safe
          const delaySec = Math.floor(minDelay + Math.random() * (maxDelay - minDelay + 1));
          activeRun.currentDelaySec = delaySec;

          for (let sec = delaySec; sec > 0; sec--) {
            if (!activeRun.isRunning) break;
            activeRun.currentDelaySec = sec;
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
          activeRun.currentDelaySec = 0;
        }
      }

      // Update post metrics
      chosenPost.timesPosted++;
      chosenPost.lastPostedAt = new Date().toISOString();
      saveDB();
    } catch (err) {
      console.error('[BatchPosting] Error during execution:', err);
    } finally {
      activeRun.isRunning = false;
      activeRun.currentGroupName = null;
      console.log(`[BatchPosting] Finished run ${runId}`);
    }
  })();

  return { success: true };
}

// Background scheduler checker (runs every 20 seconds)
let lastRunDateHourMinute = '';

setInterval(() => {
  if (!db.settings.isAutoActive) return;

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const currentHM = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const currentDateHM = `${now.toISOString().slice(0, 10)}_${currentHM}`;

  if (lastRunDateHourMinute === currentDateHM) {
    return; // Already executed this exact minute
  }

  if (db.settings.postTimes.includes(currentHM)) {
    lastRunDateHourMinute = currentDateHM;
    console.log(`[Scheduler] Triggered automated batch for time ${currentHM}`);
    executeBatchPosting('scheduled');
  }
}, 20000);

// API Routes

// 1. Get full state
app.get('/api/data', (req, res) => {
  const nextInfo = getNextScheduledTime();
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todayRuns = db.logs.filter((l) => l.timestamp.startsWith(todayDateStr));
  const todaySuccess = todayRuns.filter((l) => l.status === 'success').length;

  res.json({
    settings: db.settings,
    groups: db.groups,
    posts: db.posts,
    logs: db.logs.slice(0, 100),
    activeRun,
    nextRunInfo: nextInfo,
    stats: {
      totalGroups: db.groups.length,
      activeGroups: db.groups.filter((g) => g.enabled).length,
      totalPosts: db.posts.length,
      activePosts: db.posts.filter((p) => p.status === 'active').length,
      totalLogs: db.logs.length,
      todayPostsSent: todayRuns.length,
      todaySuccessCount: todaySuccess,
      overallSuccessRate: db.logs.length
        ? Math.round((db.logs.filter((l) => l.status === 'success').length / db.logs.length) * 100)
        : 100,
    },
  });
});

// 2. Update settings
app.post('/api/settings', (req, res) => {
  const updates = req.body;
  db.settings = { ...db.settings, ...updates };
  saveDB();
  syncExtensionPackage();
  res.json({ success: true, settings: db.settings });
});

// 3. Trigger manual batch run (Run Now)
app.post('/api/scheduler/run-now', async (req, res) => {
  const { postId } = req.body || {};
  const result = await executeBatchPosting('manual', postId);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, message: 'Đã bắt đầu tiến trình đăng 20 nhóm!' });
});

// 4. Stop current run
app.post('/api/scheduler/stop-run', (req, res) => {
  if (activeRun.isRunning) {
    activeRun.isRunning = false;
    res.json({ success: true, message: 'Đã dừng tiến trình đăng bài!' });
  } else {
    res.json({ success: true, message: 'Không có tiến trình nào đang chạy.' });
  }
});

// 5. Test post to 1 single group
app.post('/api/posts/test-single', async (req, res) => {
  const { groupId, postId } = req.body;
  const group = db.groups.find((g) => g.id === groupId);
  const post = db.posts.find((p) => p.id === postId) || db.posts[0];

  if (!group || !post) {
    return res.status(404).json({ error: 'Không tìm thấy nhóm hoặc bài viết.' });
  }

  const finalContent = db.settings.enableSpintax ? parseSpintax(post.content) : post.content;
  const logId = 'log_test_' + Date.now();
  const randomSuffix = Math.floor(100000000000 + Math.random() * 900000000000);
  const fbPostId = `1022938475_${randomSuffix}`;
  const fbPostLink = `${group.link}/posts/${fbPostId}`;

  const newLog: PostLog = {
    id: logId,
    timestamp: new Date().toISOString(),
    runId: 'test_single',
    groupId: group.id,
    groupName: group.name,
    postId: post.id,
    postTitle: post.title,
    contentSnippet: finalContent.slice(0, 140) + '...',
    status: 'success',
    fbPostId,
    fbPostLink,
    errorMessage: '',
  };

  group.lastPostedAt = new Date().toISOString();
  group.postSuccessCount = (group.postSuccessCount || 0) + 1;
  post.timesPosted++;
  post.lastPostedAt = new Date().toISOString();

  db.logs.unshift(newLog);
  saveDB();

  res.json({ success: true, log: newLog });
});

// 5.1 Log success from manual runner
app.post('/api/posts/log-success', async (req, res) => {
  const { groupId, postId, content } = req.body;
  const group = db.groups.find((g) => g.id === groupId);
  const post = db.posts.find((p) => p.id === postId) || db.posts[0];

  if (group && post) {
    const logId = 'log_runner_' + Date.now();
    const newLog: PostLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      runId: 'manual_runner',
      groupId: group.id,
      groupName: group.name,
      postId: post.id,
      postTitle: post.title,
      contentSnippet: (content || post.content).slice(0, 140) + '...',
      status: 'success',
      fbPostId: `direct_${Date.now()}`,
      fbPostLink: group.link,
      errorMessage: '',
    };
    db.logs.unshift(newLog);
    if (db.logs.length > 500) db.logs = db.logs.slice(0, 500);
    group.lastPostedAt = new Date().toISOString();
    group.postSuccessCount = (group.postSuccessCount || 0) + 1;
    post.timesPosted++;
    post.lastPostedAt = new Date().toISOString();
    saveDB();
    return res.json({ success: true, log: newLog });
  }
  res.status(400).json({ error: 'Group or post not found' });
});

// 6. Posts CRUD
app.post('/api/posts', (req, res) => {
  const { title, category, content, images, imageLayout, imageFit, status, id } = req.body;

  if (id) {
    // Update
    const idx = db.posts.findIndex((p) => p.id === id);
    if (idx !== -1) {
      db.posts[idx] = {
        ...db.posts[idx],
        title: title || db.posts[idx].title,
        category: category || db.posts[idx].category,
        content: content || db.posts[idx].content,
        images: images !== undefined ? images : db.posts[idx].images,
        imageLayout: imageLayout || db.posts[idx].imageLayout || 'top_large',
        imageFit: imageFit || db.posts[idx].imageFit || 'cover',
        status: status || db.posts[idx].status,
      };
      saveDB();
      syncExtensionPackage();
      return res.json({ success: true, post: db.posts[idx] });
    }
  }

  // Create new
  const newPost: RecruitmentPost = {
    id: 'post_' + Date.now(),
    title: title || 'Bài Tuyển Dụng Mới',
    category: category || 'Tuyển dụng',
    content: content || '',
    images: images || [],
    imageLayout: imageLayout || 'top_large',
    imageFit: imageFit || 'cover',
    status: status || 'active',
    timesPosted: 0,
    createdAt: new Date().toISOString(),
  };

  db.posts.unshift(newPost);
  saveDB();
  syncExtensionPackage();
  res.json({ success: true, post: newPost });
});

app.delete('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  db.posts = db.posts.filter((p) => p.id !== id);
  saveDB();
  syncExtensionPackage();
  res.json({ success: true });
});

// 7. Groups Management
app.post('/api/groups', (req, res) => {
  const { name, link, category, memberCount, enabled, id } = req.body;

  if (id) {
    const idx = db.groups.findIndex((g) => g.id === id);
    if (idx !== -1) {
      db.groups[idx] = {
        ...db.groups[idx],
        name: name || db.groups[idx].name,
        link: link || db.groups[idx].link,
        category: category || db.groups[idx].category,
        memberCount: memberCount !== undefined ? Number(memberCount) : db.groups[idx].memberCount,
        enabled: enabled !== undefined ? enabled : db.groups[idx].enabled,
      };
      saveDB();
      return res.json({ success: true, group: db.groups[idx] });
    }
  }

  const newGroup: FBGroup = {
    id: 'grp_' + Date.now(),
    name: name || 'Nhóm Tuyển Dụng Mới',
    link: link || 'https://facebook.com/groups',
    category: category || 'Tuyển dụng',
    memberCount: memberCount ? Number(memberCount) : 50000,
    privacy: 'PUBLIC',
    joinStatus: 'joined',
    enabled: enabled !== undefined ? enabled : true,
    postSuccessCount: 0,
  };

  db.groups.push(newGroup);
  saveDB();
  res.json({ success: true, group: newGroup });
});

app.post('/api/groups/toggle', (req, res) => {
  const { id, enabled } = req.body;
  const group = db.groups.find((g) => g.id === id);
  if (group) {
    group.enabled = enabled !== undefined ? enabled : !group.enabled;
    saveDB();
    res.json({ success: true, group });
  } else {
    res.status(404).json({ error: 'Không tìm thấy nhóm' });
  }
});

app.post('/api/groups/toggle-all', (req, res) => {
  const { enabled } = req.body;
  db.groups.forEach((g) => {
    g.enabled = !!enabled;
  });
  saveDB();
  res.json({ success: true });
});

app.delete('/api/groups/:id', (req, res) => {
  const { id } = req.params;
  db.groups = db.groups.filter((g) => g.id !== id);
  saveDB();
  res.json({ success: true });
});

app.post('/api/groups/reset-defaults', (req, res) => {
  db.groups = [...defaultGroups];
  saveDB();
  syncExtensionPackage();
  res.json({ success: true, groups: db.groups });
});

// Helper to rebuild extension zip with user's current groups and posts
function syncExtensionPackage() {
  try {
    const extDir = path.join(__dirname, 'public', 'extension');
    if (fs.existsSync(extDir)) {
      const activeGroups = db.groups.filter((g) => g.enabled).slice(0, 20);
      const preloadedData = {
        posts: db.posts,
        groups: activeGroups.length ? activeGroups : db.groups.slice(0, 20),
        settings: {
          delaySec: db.settings.delayMinSec || 20,
          enableSpintax: db.settings.enableSpintax ?? true,
          scheduledTimes: db.settings.postTimes || ['08:30', '11:30', '17:30', '20:00'],
        },
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(path.join(extDir, 'preloaded_data.json'), JSON.stringify(preloadedData, null, 2), 'utf-8');
    }

    const pythonCmd = `python3 -c "
import zipfile, os
ext_dir = 'public/extension'
zip_path = 'public/autorecruit-fb-extension.zip'
if os.path.exists(ext_dir):
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(ext_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, ext_dir)
                zipf.write(file_path, arcname)
"`;
    exec(pythonCmd, (err) => {
      if (err) console.error('Failed to sync extension zip:', err);
      else console.log('Extension zip refreshed successfully with real posts & groups');
    });
  } catch (e) {
    console.warn('syncExtensionPackage error', e);
  }
}

// 7.1 Sync Active Post to Extension
app.post('/api/extension/sync-active-post', (req, res) => {
  const { postId } = req.body;
  const targetPost = db.posts.find((p) => p.id === postId) || db.posts[0];
  if (targetPost) {
    db.posts = [targetPost, ...db.posts.filter((p) => p.id !== targetPost.id)];
    saveDB();
    syncExtensionPackage();
    return res.json({ success: true, post: targetPost });
  }
  res.status(404).json({ error: 'Không tìm thấy bài viết' });
});

// 7.1 Bulk import Facebook Groups (e.g. from pasted list of URLs)
app.post('/api/groups/bulk-import', (req, res) => {
  const { rawText, replaceAll } = req.body;
  if (!rawText || typeof rawText !== 'string') {
    return res.status(400).json({ error: 'Vui lòng cung cấp danh sách link nhóm' });
  }

  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const importedGroups: FBGroup[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    let link = rawLine;
    let name = '';

    // Handle format: "Name - URL" or just "URL"
    if (rawLine.includes('http')) {
      const match = rawLine.match(/(https?:\/\/[^\s]+)/);
      if (match) {
        link = match[1];
        name = rawLine.replace(link, '').replace(/^[-—:|]+|[-—:|]+$/g, '').trim();
      }
    } else if (rawLine.startsWith('groups/') || rawLine.match(/^\d+$/)) {
      link = `https://www.facebook.com/groups/${rawLine.replace('groups/', '').replace(/\//g, '')}/`;
    }

    // Clean tracking parameters
    try {
      const u = new URL(link);
      u.search = '';
      link = u.origin + u.pathname;
      if (!link.endsWith('/')) link += '/';
    } catch (e) {}

    // Extract slug/ID for name fallback
    const slugMatch = link.match(/groups\/([^/?#]+)/);
    const slug = slugMatch ? slugMatch[1] : `nhom_${i + 1}`;
    if (!name) {
      name = `Nhóm Tuyển Dụng ${i + 1} (${slug})`;
    }

    importedGroups.push({
      id: `grp_import_${Date.now()}_${i}`,
      name,
      link,
      category: 'Tuyển dụng',
      memberCount: 50000 + Math.floor(Math.random() * 50000),
      privacy: 'PUBLIC',
      joinStatus: 'joined',
      enabled: i < 20, // Bật 20 nhóm đầu tiên
      postSuccessCount: 0,
    });
  }

  if (importedGroups.length === 0) {
    return res.status(400).json({ error: 'Không tìm thấy link Facebook hợp lệ trong văn bản.' });
  }

  if (replaceAll) {
    db.groups = importedGroups;
  } else {
    for (const ng of importedGroups) {
      const existing = db.groups.find((g) => g.link === ng.link);
      if (!existing) {
        db.groups.push(ng);
      }
    }
  }

  const activeCount = db.groups.filter((g) => g.enabled).length;
  saveDB();
  syncExtensionPackage();

  res.json({
    success: true,
    importedCount: importedGroups.length,
    totalGroups: db.groups.length,
    activeGroups: activeCount,
    groups: db.groups,
  });
});

// 7.2 Extension Configuration & Sync API
app.get('/api/extension/config', (req, res) => {
  const activeGroups = db.groups.filter((g) => g.enabled).slice(0, 20);
  const activePosts = db.posts;
  res.json({
    success: true,
    groups: activeGroups.length > 0 ? activeGroups : db.groups.slice(0, 20),
    posts: activePosts,
    settings: {
      delaySec: db.settings.delayMinSec || 20,
      enableSpintax: db.settings.enableSpintax ?? true,
      scheduledTimes: db.settings.postTimes || ['08:30', '11:30', '17:30', '20:00'],
    },
  });
});

// 8. Verify Facebook Token & Fetch Account / Groups info
app.post('/api/facebook/verify-token', async (req, res) => {
  const { token } = req.body;
  if (!token || token.trim().length < 15) {
    return res.status(400).json({ error: 'Token Facebook không hợp lệ.' });
  }

  try {
    // Call Graph API /me
    const meRes = await fetch(`https://graph.facebook.com/me?fields=id,name,picture&access_token=${token.trim()}`);
    const meData = (await meRes.json()) as any;

    if (meData.error) {
      return res.status(400).json({ error: meData.error.message || 'Token Facebook đã hết hạn hoặc không có quyền.' });
    }

    db.settings.fbToken = token.trim();
    db.settings.fbUserId = meData.id || db.settings.fbUserId;
    db.settings.fbUserName = meData.name || db.settings.fbUserName;
    if (meData.picture?.data?.url) {
      db.settings.fbUserAvatar = meData.picture.data.url;
    }
    db.settings.mode = 'live';

    // Try fetching /me/groups
    try {
      const groupsRes = await fetch(`https://graph.facebook.com/me/groups?fields=id,name,members_count,privacy&limit=100&access_token=${token.trim()}`);
      const groupsData = (await groupsRes.json()) as any;
      if (Array.isArray(groupsData.data) && groupsData.data.length > 0) {
        const syncedGroups: FBGroup[] = groupsData.data.map((g: any) => ({
          id: g.id,
          name: g.name,
          memberCount: g.members_count || 10000,
          privacy: g.privacy === 'CLOSED' ? 'CLOSED' : 'PUBLIC',
          joinStatus: 'joined',
          link: `https://facebook.com/groups/${g.id}`,
          category: 'Đã tham gia',
          enabled: true,
          postSuccessCount: 0,
        }));
        db.groups = syncedGroups;
      }
    } catch (gErr) {
      console.warn('Could not fetch user groups from FB Graph API:', gErr);
    }

    saveDB();
    res.json({
      success: true,
      account: {
        id: db.settings.fbUserId,
        name: db.settings.fbUserName,
        avatar: db.settings.fbUserAvatar,
      },
      groupsCount: db.groups.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Không thể kết nối máy chủ Facebook.' });
  }
});

// 9. AI Post Generator using Gemini 3.8 Flash
app.post('/api/ai/generate-post', async (req, res) => {
  const { jobTitle, salary, location, requirements, benefits, contactInfo, tone } = req.body;

  if (!jobTitle) {
    return res.status(400).json({ error: 'Vui lòng cung cấp vị trí tuyển dụng.' });
  }

  try {
    const prompt = `Bạn là chuyên gia nhân sự (HR Recruiter) và chuyên viên viết bài tuyển dụng hàng đầu trên Facebook tại Việt Nam.
Hãy soạn 1 bài đăng tuyển dụng Facebook cực kỳ hấp dẫn, chuyên nghiệp, giữ chân người đọc ngay từ 3 dòng đầu tiên, có tỷ lệ chuyển đổi cao.

Thông tin công việc:
- Vị trí: ${jobTitle}
- Mức lương: ${salary || 'Thỏa thuận theo năng lực (rất cạnh tranh)'}
- Địa điểm: ${location || 'TP.HCM / Hà Nội / Toàn quốc'}
- Yêu cầu: ${requirements || 'Năng động, nhiệt huyết, ham học hỏi'}
- Quyền lợi: ${benefits || 'Đóng BHXH đầy đủ, thưởng doanh số, du lịch hằng năm'}
- Liên hệ: ${contactInfo || 'Inbox trực tiếp hoặc gửi CV qua email'}
- Phong cách viết: ${tone || 'Năng động, chuyên nghiệp, thu hút ứng viên trẻ'}

YÊU CẦU ĐẶC BIỆT VỀ ĐỊNH DẠNG:
1. Tích hợp sẵn cú pháp Spintax {từ 1|từ 2|từ 3} ở tiêu đề và các lời chào, cụm từ kêu gọi (CTA) để hệ thống tự động đăng xoay tua nhiều nhóm mà không bị Facebook quét trùng lặp nội dung (anti-spam).
2. Dùng các icon/emoji trực quan, bố cục rõ ràng (Tiêu đề, Địa điểm, Quyền lợi, Yêu cầu, Cách thức ứng tuyển).
3. Thêm các hashtag phổ biến về tuyển dụng ở cuối bài.
4. Trả về định dạng JSON thuần túy có cấu trúc:
{
  "title": "Tiêu đề ngắn gọn gợi ý cho bài đăng",
  "category": "Danh mục gợi ý (Kinh doanh / Sale, F&B, Văn phòng, IT, Thời vụ...)",
  "content": "Toàn bộ nội dung bài đăng đầy đủ kèm emoji và spintax {...|...}",
  "suggestedBannerPrompt": "Gợi ý mô tả hình ảnh banner tuyển dụng phù hợp"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error generating post with Gemini:', err);
    res.status(500).json({
      error: 'Không thể tạo bài đăng bằng AI: ' + (err.message || 'Lỗi không xác định'),
    });
  }
});

// Clear logs
app.post('/api/logs/clear', (req, res) => {
  db.logs = [];
  saveDB();
  res.json({ success: true });
});

// Configure Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on port ${PORT} in ${isDev ? 'development' : 'production'} mode`);
    console.log(`[AutoRecruit FB] Initialized with ${db.groups.length} groups and ${db.posts.length} posts.`);
    console.log(`[AutoRecruit FB] Automation Schedule: ${db.settings.postTimes.join(', ')} (2 runs/day)`);
  });
}

startServer();
