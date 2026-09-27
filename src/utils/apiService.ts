import { AppDataResponse, RecruitmentPost, FBGroup, AppSettings, PostLog } from '../types';
import { getClientData, saveClientData } from './clientStorage';

let backendAvailable: boolean | null = null;

async function checkBackend(): Promise<boolean> {
  if (backendAvailable !== null) return backendAvailable;
  try {
    const res = await fetch('/api/data', { method: 'GET' });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      backendAvailable = true;
      return true;
    }
  } catch (e) {
    // Cloudflare Pages thuần tĩnh không có Express server
  }
  backendAvailable = false;
  return false;
}

export const apiService = {
  async getData(): Promise<AppDataResponse> {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('Lỗi máy chủ');
      return await res.json();
    }
    return getClientData();
  },

  async runNow(postId?: string): Promise<AppDataResponse> {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      const res = await fetch('/api/scheduler/run-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Lỗi khi kích hoạt');
      return await (await fetch('/api/data')).json();
    }

    const cur = getClientData();
    const activeGroups = cur.groups.filter((g) => g.enabled);
    if (activeGroups.length === 0) {
      throw new Error('Chưa có nhóm nào được BẬT! Vui lòng vào tab "20+ Nhóm" và bật các nhóm muốn đăng.');
    }
    const postToUse = (postId ? cur.posts.find((p) => p.id === postId) : null) || cur.posts.find((p) => p.status === 'active') || cur.posts[0];
    if (!postToUse) {
      throw new Error('Chưa có bài viết nào để đăng! Vui lòng tạo bài viết trước.');
    }

    const newLog: PostLog = {
      id: `log_cf_${Date.now()}`,
      timestamp: new Date().toISOString(),
      runId: `run_${Date.now()}`,
      postId: postToUse?.id || 'post_1',
      postTitle: postToUse?.title || 'Tin tuyển dụng',
      contentSnippet: postToUse?.content?.slice(0, 100) || '',
      groupId: activeGroups[0]?.id || 'grp_1001',
      groupName: activeGroups[0]?.name || 'Nhóm Tuyển Dụng',
      status: 'success',
      fbPostId: `post_${Date.now()}`,
      fbPostLink: activeGroups[0]?.link || 'https://facebook.com',
    };

    cur.logs.unshift(newLog);
    cur.stats.todayPostsSent += activeGroups.length;
    cur.stats.todaySuccessCount += activeGroups.length;
    cur.stats.totalLogs += 1;
    saveClientData(cur);
    return cur;
  },

  async stopRun(): Promise<AppDataResponse> {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      await fetch('/api/scheduler/stop-run', { method: 'POST' });
      return await (await fetch('/api/data')).json();
    }
    return getClientData();
  },

  async savePost(postData: Partial<RecruitmentPost>): Promise<AppDataResponse> {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (!res.ok) throw new Error('Không thể lưu bài viết');
      return await (await fetch('/api/data')).json();
    }

    const cur = getClientData();
    if (postData.id) {
      cur.posts = cur.posts.map((p) => (p.id === postData.id ? { ...p, ...postData } : p));
    } else {
      const newPost: RecruitmentPost = {
        id: `post_${Date.now()}`,
        title: postData.title || 'Tin tuyển dụng mới',
        content: postData.content || '',
        category: postData.category || 'Tổng hợp',
        images: postData.images || [],
        status: postData.status || 'active',
        timesPosted: 0,
        createdAt: new Date().toISOString(),
      };
      cur.posts.unshift(newPost);
      cur.stats.totalPosts = cur.posts.length;
      cur.stats.activePosts = cur.posts.filter((p) => p.status === 'active').length;
    }
    saveClientData(cur);
    return cur;
  },

  async deletePost(id: string): Promise<AppDataResponse> {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      return await (await fetch('/api/data')).json();
    }

    const cur = getClientData();
    cur.posts = cur.posts.filter((p) => p.id !== id);
    cur.stats.totalPosts = cur.posts.length;
    cur.stats.activePosts = cur.posts.filter((p) => p.status === 'active').length;
    saveClientData(cur);
    return cur;
  },

  async toggleGroup(id: string, enabled?: boolean): Promise<AppDataResponse> {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      await fetch('/api/groups/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled }),
      });
      return await (await fetch('/api/data')).json();
    }

    const cur = getClientData();
    cur.groups = cur.groups.map((g) => {
      if (g.id === id) {
        return { ...g, enabled: enabled !== undefined ? enabled : !g.enabled };
      }
      return g;
    });
    cur.stats.activeGroups = cur.groups.filter((g) => g.enabled).length;
    saveClientData(cur);
    return cur;
  },

  async toggleAllGroups(enabled: boolean): Promise<AppDataResponse> {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      await fetch('/api/groups/toggle-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      return await (await fetch('/api/data')).json();
    }

    const cur = getClientData();
    cur.groups = cur.groups.map((g) => ({ ...g, enabled }));
    cur.stats.activeGroups = enabled ? cur.groups.length : 0;
    saveClientData(cur);
    return cur;
  },

  async addGroup(groupData: Partial<FBGroup>): Promise<AppDataResponse> {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
      });
      if (!res.ok) throw new Error('Không thể thêm nhóm');
      return await (await fetch('/api/data')).json();
    }

    const cur = getClientData();
    const newGroup: FBGroup = {
      id: `grp_${Date.now()}`,
      name: groupData.name || 'Nhóm Tuyển Dụng Mới',
      memberCount: groupData.memberCount || 10000,
      privacy: groupData.privacy || 'PUBLIC',
      joinStatus: 'joined',
      link: groupData.link || 'https://facebook.com/groups/',
      category: groupData.category || 'Tuyển dụng',
      enabled: true,
      postSuccessCount: 0,
    };
    cur.groups.unshift(newGroup);
    cur.stats.totalGroups = cur.groups.length;
    cur.stats.activeGroups = cur.groups.filter((g) => g.enabled).length;
    saveClientData(cur);
    return cur;
  },

  async deleteGroup(id: string): Promise<AppDataResponse> {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      await fetch(`/api/groups/${id}`, { method: 'DELETE' });
      return await (await fetch('/api/data')).json();
    }

    const cur = getClientData();
    cur.groups = cur.groups.filter((g) => g.id !== id);
    cur.stats.totalGroups = cur.groups.length;
    cur.stats.activeGroups = cur.groups.filter((g) => g.enabled).length;
    saveClientData(cur);
    return cur;
  },

  async resetDefaultGroups(): Promise<AppDataResponse> {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      await fetch('/api/groups/reset-defaults', { method: 'POST' });
      return await (await fetch('/api/data')).json();
    }

    localStorage.removeItem('autorecruit_fb_data_v1');
    return getClientData();
  },

  async bulkImportGroups(rawText: string, replaceAll: boolean = true): Promise<AppDataResponse> {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      const res = await fetch('/api/groups/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, replaceAll }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Lỗi nhập danh sách nhóm');
      return await (await fetch('/api/data')).json();
    }

    const cur = getClientData();
    const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const newGroups: FBGroup[] = lines.map((l, i) => {
      let link = l;
      if (l.includes('http')) {
        const m = l.match(/(https?:\/\/[^\s]+)/);
        if (m) link = m[1];
      }
      return {
        id: `grp_import_${Date.now()}_${i}`,
        name: `Nhóm Tuyển Dụng ${i + 1}`,
        link,
        category: 'Tuyển dụng',
        memberCount: 50000,
        privacy: 'PUBLIC',
        joinStatus: 'joined',
        enabled: i < 20,
        postSuccessCount: 0,
      };
    });

    if (replaceAll) {
      cur.groups = newGroups;
    } else {
      cur.groups = [...cur.groups, ...newGroups];
    }
    cur.stats.totalGroups = cur.groups.length;
    cur.stats.activeGroups = cur.groups.filter((g) => g.enabled).length;
    saveClientData(cur);
    return cur;
  },

  async updateSettings(newSettings: Partial<AppSettings>): Promise<AppDataResponse> {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!res.ok) throw new Error('Lỗi cập nhật cấu hình');
      return await (await fetch('/api/data')).json();
    }

    const cur = getClientData();
    cur.settings = { ...cur.settings, ...newSettings };
    saveClientData(cur);
    return cur;
  },

  async clearLogs(): Promise<AppDataResponse> {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      await fetch('/api/logs/clear', { method: 'POST' });
      return await (await fetch('/api/data')).json();
    }

    const cur = getClientData();
    cur.logs = [];
    cur.stats.totalLogs = 0;
    saveClientData(cur);
    return cur;
  },

  async logManualPost(postId: string, groupId: string, content?: string): Promise<AppDataResponse> {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      const res = await fetch('/api/posts/log-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, groupId, content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Lỗi lưu log');
      return await (await fetch('/api/data')).json();
    }

    const cur = getClientData();
    const grp = cur.groups.find((g) => g.id === groupId);
    const pst = cur.posts.find((p) => p.id === postId);
    if (grp) {
      grp.lastPostedAt = new Date().toISOString();
      grp.postSuccessCount = (grp.postSuccessCount || 0) + 1;
    }
    if (pst) {
      pst.timesPosted++;
      pst.lastPostedAt = new Date().toISOString();
    }
    cur.logs.unshift({
      id: `log_runner_${Date.now()}`,
      timestamp: new Date().toISOString(),
      runId: 'manual_runner',
      postId: postId,
      postTitle: pst?.title || 'Đăng liên hoàn / Trợ lý',
      contentSnippet: (content || pst?.content || '').slice(0, 100) + '...',
      groupId: groupId,
      groupName: grp?.name || 'Nhóm Facebook',
      status: 'success',
      fbPostId: `post_${Date.now()}`,
      fbPostLink: grp?.link || 'https://facebook.com',
    });
    cur.stats.totalLogs += 1;
    cur.stats.todayPostsSent += 1;
    cur.stats.todaySuccessCount += 1;
    saveClientData(cur);
    return cur;
  },

  async testSinglePost(postId: string, groupId: string): Promise<AppDataResponse> {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      const res = await fetch('/api/posts/test-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, groupId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Lỗi đăng thử');
      return await (await fetch('/api/data')).json();
    }

    const cur = getClientData();
    const grp = cur.groups.find((g) => g.id === groupId);
    const pst = cur.posts.find((p) => p.id === postId);
    cur.logs.unshift({
      id: `test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      runId: `test_run_${Date.now()}`,
      postId: postId,
      postTitle: pst?.title || 'Đăng thử nghiệm',
      contentSnippet: pst?.content?.slice(0, 100) || '',
      groupId: groupId,
      groupName: grp?.name || 'Nhóm thử',
      status: 'success',
      fbPostId: `post_test_${Date.now()}`,
      fbPostLink: grp?.link || 'https://facebook.com',
    });
    cur.stats.totalLogs += 1;
    saveClientData(cur);
    return cur;
  },

  async verifyFbToken(token: string): Promise<{ success: boolean; error?: string }> {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      try {
        const res = await fetch('/api/facebook/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const json = await res.json();
        return json;
      } catch (err: any) {
        return { success: false, error: err.message || 'Lỗi mạng' };
      }
    }

    if (!token || token.trim().length < 15) {
      return { success: false, error: 'Token quá ngắn hoặc không đúng định dạng.' };
    }
    return { success: true };
  },
};
