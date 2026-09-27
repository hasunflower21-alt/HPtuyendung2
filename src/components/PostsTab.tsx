import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Sparkles,
  Image as ImageIcon,
  Trash2,
  Edit3,
  Check,
  Upload,
  Copy,
  Shuffle,
  Eye,
  EyeOff,
  AlertCircle,
  Play,
  HelpCircle,
  Send,
  CheckCircle2,
  Zap,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Grid,
  Columns,
  Layout,
  RefreshCw,
  FolderPlus,
  Sliders,
  Type,
  List,
} from 'lucide-react';
import { RecruitmentPost, FBGroup, AppSettings } from '../types';
import { FacebookMockup } from './FacebookMockup';

interface PostsTabProps {
  posts: RecruitmentPost[];
  groups: FBGroup[];
  settings: AppSettings;
  onSavePost: (post: Partial<RecruitmentPost>) => Promise<void>;
  onDeletePost: (id: string) => Promise<void>;
  onTestSinglePost: (postId: string, groupId: string) => Promise<void>;
  onTriggerRunNow: (postId?: string) => void;
  onOpenAutoRunner: (postId?: string) => void;
}

// Curated 3-photo packs designed specifically for Facebook engagement
interface ImagePack {
  name: string;
  tag: string;
  images: [string, string, string];
}

const ENGAGEMENT_PACKS: ImagePack[] = [
  {
    name: 'Kỹ Thuật, Công Trình & M&E (Dự Án Lớn)',
    tag: 'Xây dựng / Cơ điện',
    images: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    name: 'Đội Ngũ Văn Phòng & Đồng Nghiệp Năng Động',
    tag: 'Văn phòng / Nhân sự',
    images: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    name: 'Kinh Doanh, Telesale & Bảng Lương Thưởng Khủng',
    tag: 'Kinh doanh / Sale',
    images: [
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    name: 'F&B, Nhà Hàng, Quán Cafe & Dịch Vụ',
    tag: 'F&B / Cafe',
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    name: 'Kéo Tương Tác Hài Hước (Meme & Phúc Lợi Trà Sữa)',
    tag: 'Viral / Hút Like',
    images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

// Single stock engagement photos
const INDIVIDUAL_STOCK_PHOTOS = [
  { name: 'Công trường dự án', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=800&q=80' },
  { name: 'Văn phòng hiện đại', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Đội ngũ đồng nghiệp', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Telesale & CSKH', url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bảng lương & Thưởng', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pha chế cafe & F&B', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80' },
  { name: 'Trà sữa & Ăn vặt', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bắt tay nhận việc', url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80' },
];

export const PostsTab: React.FC<PostsTabProps> = ({
  posts,
  groups,
  settings,
  onSavePost,
  onDeletePost,
  onTestSinglePost,
  onTriggerRunNow,
  onOpenAutoRunner,
}) => {
  const [selectedPost, setSelectedPost] = useState<RecruitmentPost | null>(posts[0] || null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [copiedMessage, setCopiedMessage] = useState<string>('');
  const [isOverviewMode, setIsOverviewMode] = useState<boolean>(true);

  // Form states for editor
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Tuyển dụng');
  const [formContent, setFormContent] = useState<string>('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formImageLayout, setFormImageLayout] = useState<'top_large' | 'left_large' | 'equal'>('top_large');
  const [formImageFit, setFormImageFit] = useState<'cover' | 'contain'>('cover');
  const [formStatus, setFormStatus] = useState<'active' | 'draft'>('active');
  const [manualImageUrl, setManualImageUrl] = useState<string>('');

  // AI Generator States
  const [aiJobTitle, setAiJobTitle] = useState<string>('Kỹ sư M&E / Cán bộ hồ sơ QS');
  const [aiSalary, setAiSalary] = useState<string>('12 - 20 Triệu (Up to 25 Tr theo năng lực)');
  const [aiLocation, setAiLocation] = useState<string>('Hà Nội & Hà Nam');
  const [aiRequirements, setAiRequirements] = useState<string>('Tốt nghiệp ĐH, thạo tin học, nhận kỹ sư mới ra trường');
  const [aiBenefits, setAiBenefits] = useState<string>('Không nợ lương, thử việc 85%, tăng lương theo hiệu quả');
  const [aiContact, setAiContact] = useState<string>('Hotline/Zalo: 0966.203.310 (Mr. Hoàn)');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');

  // Single test modal
  const [testGroupId, setTestGroupId] = useState<string>(groups[0]?.id || '');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testSuccessMsg, setTestSuccessMsg] = useState<string>('');

  // Spintax helper
  const resolveSpintaxText = (text: string): string => {
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
  };

  const handleCopyProcessedPost = async () => {
    if (!selectedPost) return;
    const finalContent = resolveSpintaxText(selectedPost.content);
    try {
      await navigator.clipboard.writeText(finalContent);
      setCopiedMessage('✓ Đã sao chép nội dung bài viết (chuẩn 100% dòng, đoạn & emoji) vào bộ nhớ tạm!');
      setTimeout(() => setCopiedMessage(''), 4500);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePushToExtension = async (post: RecruitmentPost) => {
    const payload = {
      title: post.title,
      content: post.content,
      images: (post.images && post.images.length > 0) ? post.images.slice(0, 3) : [],
      category: post.category,
    };

    if ((window as any).__AUTORECRUIT_DATA__) {
      (window as any).__AUTORECRUIT_DATA__.activePost = post;
    }
    try {
      const cur = localStorage.getItem('autorecruit_fb_data_v1');
      if (cur) {
        const parsed = JSON.parse(cur);
        parsed.posts = [post, ...parsed.posts.filter((p: any) => p.id !== post.id)];
        localStorage.setItem('autorecruit_fb_data_v1', JSON.stringify(parsed));
      }
    } catch (e) {}

    window.postMessage({ type: 'AUTORECRUIT_PUSH_TO_EXTENSION', post }, '*');
    window.dispatchEvent(new CustomEvent('AUTORECRUIT_DATA_CHANGE', { detail: { activePost: post } }));

    try {
      await navigator.clipboard.writeText(post.content);
    } catch (e) {}

    setCopiedMessage(`✓ Đã nạp bài "${post.title}" cùng ${payload.images.length} ảnh tương tác sang Extension!`);
    setTimeout(() => setCopiedMessage(''), 5000);
  };

  const handleDirect1ClickPublish = async () => {
    if (!selectedPost) return;
    const grp = groups.find((g) => g.id === testGroupId) || groups[0];
    const finalContent = resolveSpintaxText(selectedPost.content);
    try {
      await navigator.clipboard.writeText(finalContent);
      setCopiedMessage(`✓ Đã copy nội dung chuẩn bố cục! Đang mở nhóm "${grp?.name || 'Facebook'}". Bạn chỉ cần nhấn Ctrl+V để đăng ngay!`);
      if (grp?.link) {
        window.open(grp.link, '_blank');
      }
      setTimeout(() => setCopiedMessage(''), 6000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickActivate = async (post: RecruitmentPost) => {
    await onSavePost({
      ...post,
      status: post.status === 'active' ? 'draft' : 'active',
    });
  };

  // Open editor for existing post
  const handleEditClick = (post: RecruitmentPost) => {
    setSelectedPost(post);
    setFormTitle(post.title);
    setFormCategory(post.category);
    setFormContent(post.content);
    setFormImages(post.images ? [...post.images.slice(0, 3)] : []);
    setFormImageLayout(post.imageLayout || 'top_large');
    setFormImageFit(post.imageFit || 'cover');
    setFormStatus(post.status);
    setIsEditing(true);
  };

  // Open editor for brand new post
  const handleCreateNewClick = () => {
    setSelectedPost(null);
    setFormTitle('Bài Tuyển Dụng Mới (Kèm 3 Ảnh Tương Tác)');
    setFormCategory('Kỹ sư / M&E');
    setFormContent(`{TUYỂN GẤP ĐỒNG ĐỘI|TIN TUYỂN DỤNG NÓNG HỔI}! 🔥

🔴 VỊ TRÍ: {Cán bộ Hồ sơ QS|Giám sát thi công M&E|Kỹ sư hiện trường}
🏗️ Dự án: Các công trình cao tầng trọng điểm
💰 MỨC LƯƠNG: {12 - 20 Triệu/tháng|Up to 25 Triệu theo năng lực} + Phụ cấp
🎓 Đặc biệt: Nhận Kỹ sư MỚI RA TRƯỜNG – Đào tạo từ đầu!

✅ QUYỀN LỢI NỔI BẬT:
• Cam kết KHÔNG NỢ LƯƠNG, đóng BHXH đầy đủ
• Thưởng hiệu quả dự án + Lương tháng 13
• Hỗ trợ ăn ở tại công trình hoặc phụ cấp đi lại

📄 YÊU CẦU:
• Tốt nghiệp Cao đẳng/Đại học chuyên ngành liên quan
• Có laptop cá nhân, nhiệt tình, có trách nhiệm

📞 LIÊN HỆ ỨNG TUYỂN:
👉 Hotline / Zalo: 0966.203.310 (Trao đổi trực tiếp)
👉 Email nhận CV: hr.tuyendung@gmail.com
#tuyendung #vieclam #kymu #congtrinh`);
    setFormImages([...ENGAGEMENT_PACKS[0].images]);
    setFormImageLayout('top_large');
    setFormImageFit('cover');
    setFormStatus('active');
    setIsEditing(true);
  };

  // Save changes
  const handleSave = async () => {
    const postToSave: Partial<RecruitmentPost> = {
      id: selectedPost?.id,
      title: formTitle.trim() || 'Bài Tuyển Dụng Mới',
      category: formCategory,
      content: formContent,
      images: formImages.slice(0, 3),
      imageLayout: formImageLayout,
      imageFit: formImageFit,
      status: formStatus,
    };
    await onSavePost(postToSave);
    setIsEditing(false);
  };

  // AI Gemini Generator Call
  const handleGenerateAI = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/ai/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: aiJobTitle,
          salary: aiSalary,
          location: aiLocation,
          requirements: aiRequirements,
          benefits: aiBenefits,
          contactInfo: aiContact,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi gọi AI');
      }

      setFormTitle(data.data.title || `Tuyển ${aiJobTitle}`);
      setFormCategory(data.data.category || 'Tuyển dụng');
      setFormContent(data.data.content || '');
      // Automatically choose 3 engagement images
      if (formImages.length === 0) {
        setFormImages([...ENGAGEMENT_PACKS[0].images]);
      }
      setIsAiModalOpen(false);
      setIsEditing(true);
    } catch (err: any) {
      setAiError(err.message || 'Không thể tạo bài viết');
    } finally {
      setAiLoading(false);
    }
  };

  // Multi-file image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = 3 - formImages.length;
    if (availableSlots <= 0) {
      alert('Đã đạt tối đa 3 ảnh tương tác. Vui lòng xóa bớt ảnh cũ trước khi tải thêm!');
      return;
    }

    const filesToRead = Array.from(files).slice(0, availableSlots);
    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        if (base64) {
          setFormImages((prev) => {
            if (prev.length >= 3) return prev;
            return [...prev, base64];
          });
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset file input value
    e.target.value = '';
  };

  // Add individual stock photo
  const handleAddStockPhoto = (url: string) => {
    if (formImages.length >= 3) {
      alert('Đã đủ 3 ảnh tương tác. Vui lòng bấm xóa hoặc đổi vị trí ảnh!');
      return;
    }
    setFormImages((prev) => [...prev, url]);
  };

  // Apply a 3-photo pack
  const handleApplyImagePack = (pack: ImagePack) => {
    setFormImages([...pack.images]);
  };

  // Remove 1 image by index
  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Move image index
  const handleMoveImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= formImages.length) return;
    setFormImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, item);
      return copy;
    });
  };

  // Add manual URL
  const handleAddManualUrl = () => {
    const url = manualImageUrl.trim();
    if (!url) return;
    if (formImages.length >= 3) {
      alert('Đã đủ 3 ảnh. Vui lòng xóa bớt ảnh trước khi thêm!');
      return;
    }
    setFormImages((prev) => [...prev, url]);
    setManualImageUrl('');
  };

  // Helper text insertions
  const insertTextAtCursor = (textToInsert: string) => {
    setFormContent((prev) => prev + '\n' + textToInsert);
  };

  // Single test post
  const handleRunTest = async () => {
    if (!selectedPost && !formContent) return;
    setIsTesting(true);
    setTestSuccessMsg('');
    try {
      const targetPostId = selectedPost?.id || posts[0]?.id;
      await onTestSinglePost(targetPostId, testGroupId);
      setTestSuccessMsg('Đã đăng thử 1 bài thành công vào nhóm kiểm tra!');
      setTimeout(() => setTestSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Kho Bài Đăng Tuyển Dụng & 3 Ảnh Tương Tác Chuẩn Bố Cục</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Soạn thảo bố cục rõ ràng, hỗ trợ ghép 3 ảnh tương tác tự động điều chỉnh, xem bao quát 100% nội dung
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tạo Bằng AI Gemini</span>
          </button>

          <button
            onClick={handleCreateNewClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Soạn Mới (Kèm 3 Ảnh)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Post List on Left, Editor / Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Posts Library Cards */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Danh sách bài viết ({posts.length})
            </span>
            <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              <span>Tự động xoay tua</span>
            </span>
          </div>

          <div className="space-y-3">
            {posts.map((post) => {
              const isSelected = selectedPost?.id === post.id;
              const postImgs = post.images || [];
              return (
                <div
                  key={post.id}
                  onClick={() => {
                    setSelectedPost(post);
                    if (isEditing) handleEditClick(post);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {postImgs.length} ảnh
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          post.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {post.status === 'active' ? 'Hoạt động' : 'Bản nháp'}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 mt-2 line-clamp-1">
                    {post.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {post.content.replace(/[\n\r]/g, ' ')}
                  </p>

                  {/* Thumbnail Row (Up to 3 thumbs) */}
                  {postImgs.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5">
                      {postImgs.slice(0, 3).map((img, i) => (
                        <div key={i} className="h-14 flex-1 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                          <img src={img} alt="thumb" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                    <span>Đã đăng: <strong className="text-slate-800">{post.timesPosted} lần</strong></span>
                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(post);
                        }}
                        className="p-1 rounded-md hover:bg-slate-200 text-blue-600"
                        title="Chỉnh sửa bài và 3 ảnh"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {posts.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
                              onDeletePost(post.id);
                            }
                          }}
                          className="p-1 rounded-md hover:bg-slate-200 text-rose-600"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 cols): Visual Editor OR Realistic Facebook Mockup */}
        <div className="lg:col-span-8 space-y-6">
          {isEditing ? (
            /* EDITOR FORM */
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-base text-slate-900">
                    {selectedPost ? 'Chỉnh Sửa Bài Viết & Bộ 3 Ảnh' : 'Soạn Bài Tuyển Dụng Mới (3 Ảnh Tương Tác)'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu Bài Viết</span>
                  </button>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tiêu đề gợi nhớ
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="VD: Tuyển Cán Bộ Hồ Sơ / QS / Giám Sát M&E Lương 12-25tr"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngành nghề
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Kỹ sư / M&E">Kỹ sư / M&E / Thi công</option>
                    <option value="Kinh doanh / Sale">Kinh doanh / Sale</option>
                    <option value="Văn phòng">Văn phòng / Hành chính</option>
                    <option value="F&B / Nhà hàng">F&B / Nhà hàng / Cafe</option>
                    <option value="Sinh viên / Part-time">Sinh viên / Part-time</option>
                    <option value="Công nghệ thông tin">Công nghệ IT</option>
                    <option value="Lao động phổ thông">Lao động phổ thông</option>
                    <option value="Tài xế / Giao vận">Tài xế / Giao vận</option>
                  </select>
                </div>
              </div>

              {/* Formatting & Spintax Quick Action Toolbar */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-blue-600" />
                    <span>Công cụ chèn nhanh cấu trúc bài đăng (Chuẩn bố cục & Spintax)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Bấm để chèn các trường thông tin chuẩn
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('🔴 VỊ TRÍ: ')}
                    className="px-2 py-1 bg-white hover:bg-blue-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium"
                  >
                    + Vị trí
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('💰 MỨC LƯƠNG: {12 - 20 Triệu|Thỏa thuận theo năng lực} + Phụ cấp')}
                    className="px-2 py-1 bg-white hover:bg-blue-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium"
                  >
                    + Mức lương
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('🏗️ DỰ ÁN: ')}
                    className="px-2 py-1 bg-white hover:bg-blue-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium"
                  >
                    + Dự án
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('✅ CAM KẾT: KHÔNG NỢ LƯƠNG | Thử việc 85% | Tăng lương theo hiệu quả')}
                    className="px-2 py-1 bg-white hover:bg-blue-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium"
                  >
                    + Quyền lợi
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('📞 Hotline / Zalo: 0966.203.310 (Mr. Hoàn)')}
                    className="px-2 py-1 bg-white hover:bg-blue-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium"
                  >
                    + Hotline/Zalo
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('{TUYỂN DỤNG GẤP|CƠ HỘI NGHỀ NGHIỆP|THÔNG BÁO TUYỂN DỤNG}')}
                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold"
                  >
                    + Spintax Tiêu đề
                  </button>
                </div>
              </div>

              {/* Main Content Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Nội dung bài đăng (Giữ nguyên dòng cách, thụt lề, emoji, danh sách •)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {formContent.length} ký tự • {(formContent.match(/\n/g) || []).length + 1} dòng
                  </span>
                </div>
                <textarea
                  rows={10}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Nhập nội dung bài đăng tuyển dụng chi tiết..."
                  className="w-full text-xs font-mono p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                ></textarea>
              </div>

              {/* 3 IMAGES ATTACHMENT & ADJUSTMENT SECTION */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>Bộ 3 Ảnh Tương Tác Kèm Theo (Tối Đa 3 Ảnh)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Chọn 3 ảnh để Facebook hiển thị dạng lưới hút tương tác người tìm việc
                    </p>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    formImages.length === 3
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}>
                    Đã chọn: {formImages.length}/3 ảnh
                  </span>
                </div>

                {/* CURRENT 3 SLOTS PREVIEW & REORDER */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[0, 1, 2].map((slotIdx) => {
                    const imgUrl = formImages[slotIdx];
                    return (
                      <div
                        key={slotIdx}
                        className={`h-36 rounded-xl border relative overflow-hidden flex flex-col items-center justify-center transition-all ${
                          imgUrl
                            ? 'bg-slate-900 border-slate-300'
                            : 'bg-white border-dashed border-slate-300 text-slate-400'
                        }`}
                      >
                        {imgUrl ? (
                          <>
                            <img
                              src={imgUrl}
                              alt={`Slot ${slotIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Slot Badge */}
                            <div className="absolute top-2 left-2 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                              {slotIdx === 0 ? 'Ảnh chính (1)' : `Ảnh phụ (${slotIdx + 1})`}
                            </div>
                            {/* Action Buttons Bar */}
                            <div className="absolute bottom-2 inset-x-2 flex items-center justify-between bg-black/60 backdrop-blur-xs p-1 rounded-lg">
                              <div className="flex items-center gap-1">
                                {slotIdx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(slotIdx, slotIdx - 1)}
                                    className="p-1 text-white hover:text-blue-300"
                                    title="Dời sang trái (Làm ảnh trước)"
                                  >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {slotIdx < formImages.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(slotIdx, slotIdx + 1)}
                                    className="p-1 text-white hover:text-blue-300"
                                    title="Dời sang phải"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(slotIdx)}
                                className="p-1 text-rose-400 hover:text-rose-300"
                                title="Xóa ảnh này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-3 space-y-1">
                            <ImageIcon className="w-6 h-6 text-slate-300 mx-auto" />
                            <span className="text-[11px] font-medium block">
                              Vị trí ảnh {slotIdx + 1}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              (Chưa có ảnh)
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* CONTROLS: LAYOUT STYLE & FIT MODE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Layout className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kiểu bố cục 3 ảnh trên Facebook:</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setFormImageLayout('top_large')}
                        className={`p-2 rounded-xl border text-center font-medium transition-all ${
                          formImageLayout === 'top_large'
                            ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        1 To Trên + 2 Nhỏ Dưới
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormImageLayout('left_large')}
                        className={`p-2 rounded-xl border text-center font-medium transition-all ${
                          formImageLayout === 'left_large'
                            ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        1 To Trái + 2 Nhỏ Phải
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormImageLayout('equal')}
                        className={`p-2 rounded-xl border text-center font-medium transition-all ${
                          formImageLayout === 'equal'
                            ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        3 Cột Ngang Bằng Nhau
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tự điều chỉnh hiển thị (Fit / Cover):</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setFormImageFit('cover')}
                        className={`p-2 rounded-xl border text-center font-medium transition-all ${
                          formImageFit === 'cover'
                            ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Lấp đầy khung (Vuông vắn Facebook)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormImageFit('contain')}
                        className={`p-2 rounded-xl border text-center font-medium transition-all ${
                          formImageFit === 'contain'
                            ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Giữ trọn ảnh (Không bị cắt mép)
                      </button>
                    </div>
                  </div>
                </div>

                {/* ADD IMAGES: FILE UPLOAD OR SELECT PRESET PACKS */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tải ảnh từ máy tính (Có thể chọn nhiều ảnh cùng lúc)</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {formImages.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormImages([])}
                        className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
                      >
                        Xóa tất cả 3 ảnh
                      </button>
                    )}
                  </div>

                  {/* Manual Link Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                      placeholder="Hoặc dán URL ảnh trực tiếp (https://...)"
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualUrl}
                      disabled={!manualImageUrl.trim()}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shrink-0 disabled:opacity-50"
                    >
                      + Thêm Ảnh
                    </button>
                  </div>

                  {/* Curated 3-photo packs */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-slate-700 block">
                      Hoặc chọn nhanh trọn bộ 3 ảnh tương tác mẫu (1-Click áp dụng):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {ENGAGEMENT_PACKS.map((pack, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleApplyImagePack(pack)}
                          className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-xs cursor-pointer transition-all space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-800 truncate">
                              {pack.name}
                            </span>
                            <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                              {pack.tag}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 h-12">
                            {pack.images.map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt="preview"
                                className="w-full h-full object-cover rounded-md"
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Individual Stock Engagement Photos */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs text-slate-500 block">
                      Ảnh lẻ kéo tương tác (bấm để thêm vào chỗ trống):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {INDIVIDUAL_STOCK_PHOTOS.map((photo, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddStockPhoto(photo.url)}
                          className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left text-xs transition-colors"
                        >
                          <img src={photo.url} alt={photo.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                          <span className="text-[11px] text-slate-700 font-medium truncate">
                            {photo.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Radio */}
              <div className="flex items-center gap-4 pt-2">
                <label className="text-xs font-semibold text-slate-700">Trạng thái bài đăng:</label>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formStatus === 'active'}
                      onChange={() => setFormStatus('active')}
                      className="text-blue-600"
                    />
                    <span>Kích hoạt (Cho phép tự động đăng)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formStatus === 'draft'}
                      onChange={() => setFormStatus('draft')}
                      className="text-slate-600"
                    />
                    <span>Lưu tạm (Bản nháp)</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            /* PREVIEW MODE WITH FACEBOOK MOCKUP & TEST POST ACTION */
            <div className="space-y-4">
              {/* Draft Warning Banner if currently selected post is draft */}
              {selectedPost && selectedPost.status === 'draft' && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Lưu ý:</strong> Bài viết này đang ở chế độ <strong>Bản nháp</strong>. Hệ thống sẽ bỏ qua không tự động đẩy bài này nếu chưa kích hoạt.
                    </span>
                  </div>
                  <button
                    onClick={() => handleQuickActivate(selectedPost)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shrink-0 transition-colors"
                  >
                    Bật sang Hoạt Động
                  </button>
                </div>
              )}

              {/* Top Controls: Preview Title + Actions */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Bố Cục Thực Tế & Mô Phỏng Bài Đăng Kèm 3 Ảnh
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bảo toàn 100% định dạng soạn thảo, tự động điều chỉnh 3 ảnh tương tác
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedPost && (
                    <>
                      <button
                        onClick={() => handlePushToExtension(selectedPost)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                        title="Tự động đồng bộ bài viết và 3 ảnh này sang Chrome Extension"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>⚡ Đẩy 3 Ảnh Sang Extension</span>
                      </button>

                      <button
                        onClick={handleCopyProcessedPost}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Sao chép nội dung bài viết đã tự động xáo trộn Spintax"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                        <span>Copy Nội Dung Chuẩn</span>
                      </button>

                      <button
                        onClick={() => handleEditClick(selectedPost)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa bài & Đổi 3 ảnh</span>
                      </button>

                      <button
                        onClick={() => onOpenAutoRunner(selectedPost.id)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Zap className="w-3.5 h-3.5 fill-slate-950" />
                        <span>⚡ Trợ Lý Đăng 20 Nhóm</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Copied Success Toast Message */}
              {copiedMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{copiedMessage}</span>
                </div>
              )}

              {/* Realistic Facebook Mockup */}
              {selectedPost ? (
                <FacebookMockup
                  userName={settings.fbUserName}
                  userAvatar={settings.fbUserAvatar}
                  groupName="Tuyển Dụng & Việc Làm TP.HCM (480k TV)"
                  timeText="Vừa xong"
                  content={selectedPost.content}
                  images={selectedPost.images}
                  imageLayout={selectedPost.imageLayout || 'top_large'}
                  imageFit={selectedPost.imageFit || 'cover'}
                  defaultOverviewMode={isOverviewMode}
                />
              ) : (
                <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                  Chưa chọn bài viết nào. Hãy chọn từ danh sách bên trái!
                </div>
              )}

              {/* TOOL: ĐẨY NHANH 1-CLICK VÀO NHÓM FACEBOOK THẬT */}
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm space-y-3.5 border border-indigo-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-white">
                      ⚡ Đẩy Nhanh 1-Click Vào Nhóm Facebook Thật (Chuẩn 100% Bố Cục)
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-300 font-medium">
                    100% Thành công • Tự động xáo trộn Spintax
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Hệ thống sẽ <strong>tự sinh nội dung Spintax mới nhất</strong> cho bài này, <strong>bảo toàn 100% dòng xuống và thụt lề</strong>, <strong>tự động copy vào bộ nhớ tạm</strong> và <strong>mở thẳng nhóm Facebook</strong>. Bạn chỉ cần nhấn <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-white font-mono">Ctrl + V</kbd> để dán và đăng ngay trong 3 giây!
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <select
                    value={testGroupId}
                    onChange={(e) => setTestGroupId(e.target.value)}
                    className="w-full sm:flex-1 text-xs px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({(g.memberCount / 1000).toFixed(0)}k TV)
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleDirect1ClickPublish}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Send className="w-3.5 h-3.5 fill-current" />
                    <span>Mở Nhóm & Tự Động Copy Để Đăng</span>
                  </button>
                </div>
              </div>

              {/* Single Group Test Action */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-sm text-slate-900">
                      Đăng Thử Nghiệm 1 Nhóm (Mô Phỏng Kiểm Tra Luồng)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Ghi log vào hệ thống để kiểm tra
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <select
                    value={testGroupId}
                    onChange={(e) => setTestGroupId(e.target.value)}
                    className="w-full sm:flex-1 text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({(g.memberCount / 1000).toFixed(0)}k TV)
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleRunTest}
                    disabled={isTesting}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5"
                  >
                    {isTesting ? (
                      <span>Đang gửi thử...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Chạy Thử Nghiệm Nhóm Này</span>
                      </>
                    )}
                  </button>
                </div>

                {testSuccessMsg && (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{testSuccessMsg}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI GEMINI GENERATOR MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Tạo Bài Tuyển Dụng Chuẩn Facebook Bằng AI Gemini
                  </h3>
                  <p className="text-xs text-purple-200">
                    Tự động tạo tiêu đề, emoji, quyền lợi và Spintax chống spam
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {aiError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Vị trí tuyển dụng *
                </label>
                <input
                  type="text"
                  value={aiJobTitle}
                  onChange={(e) => setAiJobTitle(e.target.value)}
                  placeholder="VD: Cán bộ hồ sơ QS / Giám sát thi công M&E..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    2. Mức lương
                  </label>
                  <input
                    type="text"
                    value={aiSalary}
                    onChange={(e) => setAiSalary(e.target.value)}
                    placeholder="VD: 12 - 20 Triệu (Up to 25Tr)"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    3. Địa điểm làm việc
                  </label>
                  <input
                    type="text"
                    value={aiLocation}
                    onChange={(e) => setAiLocation(e.target.value)}
                    placeholder="VD: Hà Nội & Hà Nam"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4. Quyền lợi nổi bật (Ví dụ: Cam kết không nợ lương, BHXH...)
                </label>
                <input
                  type="text"
                  value={aiBenefits}
                  onChange={(e) => setAiBenefits(e.target.value)}
                  placeholder="VD: Không nợ lương | Thử việc 85% | Dự án Vingroup"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  5. Yêu cầu ứng viên
                </label>
                <input
                  type="text"
                  value={aiRequirements}
                  onChange={(e) => setAiRequirements(e.target.value)}
                  placeholder="VD: Tốt nghiệp ĐH, thạo tin học, nhận kỹ sư mới ra trường"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6. Thông tin liên hệ
                </label>
                <input
                  type="text"
                  value={aiContact}
                  onChange={(e) => setAiContact(e.target.value)}
                  placeholder="VD: Hotline / Zalo: 0966.203.310 (Mr. Hoàn)"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={aiLoading || !aiJobTitle.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>AI Đang Soạn Bài...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tạo Nội Dung Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
