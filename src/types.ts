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
  delayMinSec: number;
  delayMaxSec: number;
  enableSpintax: boolean;
  fbToken: string;
  fbUserId: string;
  fbUserName: string;
  fbUserAvatar: string;
  fbAccountType: 'personal_profile' | 'fanpage';
  mode: 'live' | 'simulation';
  antiSpamVariation: boolean;
}

export interface ActiveRunState {
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

export interface NextRunInfo {
  timeStr: string;
  diffMs: number;
}

export interface AppStats {
  totalGroups: number;
  activeGroups: number;
  totalPosts: number;
  activePosts: number;
  totalLogs: number;
  todayPostsSent: number;
  todaySuccessCount: number;
  overallSuccessRate: number;
}

export interface AppDataResponse {
  settings: AppSettings;
  groups: FBGroup[];
  posts: RecruitmentPost[];
  logs: PostLog[];
  activeRun: ActiveRunState;
  nextRunInfo: NextRunInfo;
  stats: AppStats;
}
