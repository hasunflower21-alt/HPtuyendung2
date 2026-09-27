import { AppDataResponse, FBGroup, RecruitmentPost, PostLog } from '../types';
import { initialSettings, initialGroups, initialPosts } from '../data/initialData';

const STORAGE_KEY = 'autorecruit_fb_data_v1';

export function getClientData(): AppDataResponse {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.settings && parsed.groups && parsed.stats) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc localStorage:', e);
  }

  const rawGroups: FBGroup[] = initialGroups;
  const rawPosts: RecruitmentPost[] = initialPosts;
  const rawLogs: PostLog[] = [];

  const initialData: AppDataResponse = {
    settings: initialSettings,
    groups: rawGroups,
    posts: rawPosts,
    logs: rawLogs,
    activeRun: {
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
    },
    nextRunInfo: {
      timeStr: '08:30 (Sáng mai)',
      diffMs: 32400000,
    },
    stats: {
      totalGroups: rawGroups.length,
      activeGroups: rawGroups.filter((g) => g.enabled).length,
      totalPosts: rawPosts.length,
      activePosts: rawPosts.filter((p) => p.status === 'active').length,
      totalLogs: 0,
      todayPostsSent: 20,
      todaySuccessCount: 20,
      overallSuccessRate: 98.6,
    },
  };

  saveClientData(initialData);
  return initialData;
}

export function saveClientData(data: AppDataResponse) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Lỗi lưu localStorage:', e);
  }
}
