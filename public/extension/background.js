// background.js - Điều phối Đăng Bài 20 Nhóm Facebook Tự Động
// Hỗ trợ: Dừng tức thì 100%, Chống lặp bài, Đính kèm ảnh an toàn, Tự động lưu tiến trình

let isRunning = false;
let shouldStop = false;
let activeTabId = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Ngủ có thể ngắt ngay lập tức khi bấm DỪNG (Kiểm tra shouldStop mỗi 100ms)
async function interruptibleSleep(ms) {
  const step = 100;
  let elapsed = 0;
  while (elapsed < ms) {
    if (shouldStop) return;
    await sleep(Math.min(step, ms - elapsed));
    elapsed += step;
  }
}

// Cập nhật trạng thái tiến trình vào storage
async function updateStatus(status) {
  try {
    await chrome.storage.local.set({ postJobState: status });
  } catch (e) {}
}

// Lắng nghe lệnh từ popup.js / dashboard.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 1. BẮT ĐẦU ĐĂNG BÀI
  if (request.action === 'START_BATCH_POSTING') {
    if (isRunning) {
      sendResponse({ success: false, message: 'Đang có một tiến trình đang chạy!' });
      return true;
    }

    const payload = request.payload || request;
    const groups = payload.groups || [];
    const content = payload.content || payload.postContent || '';
    const images = payload.images || [];
    const isSpintaxEnabled = payload.isSpintaxEnabled !== undefined ? payload.isSpintaxEnabled : true;
    const delaySec = parseInt(payload.delaySec, 10) || 20;
    const shouldShuffle = payload.shouldShuffle !== undefined ? payload.shouldShuffle : true;

    if (!groups.length) {
      sendResponse({ success: false, message: 'Danh sách nhóm trống!' });
      return true;
    }

    isRunning = true;
    shouldStop = false;

    runBatchPosting(groups, content, images, isSpintaxEnabled, delaySec, shouldShuffle)
      .then(() => {
        isRunning = false;
        activeTabId = null;
      })
      .catch((err) => {
        console.error('[AutoRecruit Background] Lỗi tiến trình:', err);
        isRunning = false;
        activeTabId = null;
      });

    sendResponse({ success: true, message: 'Đã bắt đầu đăng tự động!' });
    return true;
  }

  // 2. DỪNG TIẾN TRÌNH LẬP TỨC (DỪNG NGAY 100%)
  if (request.action === 'STOP_BATCH_POSTING') {
    console.log('[AutoRecruit Background] Nhận lệnh DỪNG TIẾN TRÌNH!');
    shouldStop = true;
    isRunning = false;

    // Đóng tab đang mở ngay lập tức nếu có
    if (activeTabId) {
      chrome.tabs.remove(activeTabId).catch(() => {});
      activeTabId = null;
    }

    updateStatus({
      isRunning: false,
      currentIndex: 0,
      totalGroups: 0,
      statusText: '⏹️ Đã dừng tiến trình theo yêu cầu của bạn.',
    });

    sendResponse({ success: true, message: 'Đã dừng ngay lập tức.' });
    return true;
  }

  // 3. Cài đặt hẹn giờ
  if (request.action === 'SCHEDULE_AUTO_POST') {
    handleSetSchedule(request.payload || request);
    sendResponse({ success: true });
    return true;
  }

  // 4. Hủy hẹn giờ
  if (request.action === 'CANCEL_SCHEDULE') {
    chrome.alarms.clearAll(() => {
      chrome.storage.local.set({ isScheduleActive: false });
    });
    sendResponse({ success: true });
    return true;
  }

  // 5. Nhận dữ liệu đồng bộ thời gian thực từ Web App (nếu có dùng Web App)
  if (request.action === 'REALTIME_WEBAPP_SYNC' || request.action === 'SYNC_FROM_WEBAPP_PAGE') {
    const { posts, groups, settings, activePost, url } = request.payload || {};
    if (posts && posts.length) {
      const targetPost = activePost || posts.find((p) => p.status === 'active') || posts[0];
      const hasImage = !!(targetPost?.images && targetPost.images.length > 0 && targetPost.images[0]);
      chrome.storage.local.set({
        savedPosts: posts || [],
        savedGroups: (groups && groups.length > 0) ? groups : [],
        savedTimes: (settings && settings.postTimes) ? settings.postTimes : ['08:30', '11:30', '17:30', '20:00'],
        attachedImageUrl: targetPost?.images?.[0] || '',
        attachedImages: (targetPost?.images || []).slice(0, 3),
        customPostText: targetPost?.content || '',
        isAttachImageEnabled: hasImage,
        lastSyncedFromUrl: url || 'dang-bai-fb.pages.dev',
        lastSyncTimestamp: Date.now(),
      });
      console.log('[AutoRecruit Background] ✓ Đã nhận dữ liệu đồng bộ');
    }
    sendResponse({ success: true });
    return true;
  }
});

// Hẹn giờ bằng Alarms
function handleSetSchedule(config) {
  chrome.alarms.clearAll();
  const times = config.times || ['08:30', '11:30', '17:30', '20:00'];
  chrome.storage.local.set({
    isScheduleActive: true,
    scheduledTimes: times,
    scheduleConfigPayload: config,
  });

  times.forEach((timeStr, idx) => {
    chrome.alarms.create(`autorecruit_alarm_${idx}_${timeStr}`, {
      periodInMinutes: 1440,
    });
  });
  console.log('[AutoRecruit Background] Đã cài đặt', times.length, 'mốc giờ đăng.');
}

// Chuyển URL ảnh thành DataURL trực tiếp trong Background
async function urlToDataUrl(url) {
  if (!url) return '';
  if (url.startsWith('data:image')) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('[AutoRecruit Background] Lỗi nạp URL ảnh:', err);
    return url;
  }
}

// Xử lý đảo Spintax {A|B|C}
function generateShuffledContent(text, index, isSpintaxEnabled) {
  if (!text) return '';
  if (!isSpintaxEnabled) {
    return text.replace(/\{([^{}]+)\}/g, (m, c) => c.split('|')[0]);
  }
  return text.replace(/\{([^{}]+)\}/g, (match, choices) => {
    const parts = choices.split('|');
    return parts[Math.floor(Math.random() * parts.length)];
  });
}

// Hàm xáo trộn mảng Fisher-Yates
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// TIẾN TRÌNH ĐĂNG LIÊN HOÀN 20 NHÓM (HỖ TRỢ DỪNG TỨC THÌ & TRỘN THỨ TỰ NHÓM)
async function runBatchPosting(groups, baseContent, images, isSpintaxEnabled, delaySec, shouldShuffle = true) {
  // Trộn ngẫu nhiên thứ tự nhóm nếu được bật (Tránh đăng lặp lại trang đầu tiên)
  let groupsToRun = groups;
  if (shouldShuffle && groups.length > 1) {
    groupsToRun = shuffleArray(groups);
    console.log('[AutoRecruit Background] 🎲 Đã trộn ngẫu nhiên thứ tự', groupsToRun.length, 'nhóm cho lượt này!');
  } else {
    console.log('[AutoRecruit Background] Bắt đầu duyệt', groups.length, 'nhóm theo thứ tự gốc.');
  }

  // Chuẩn bị tối đa 3 ảnh tương tác
  let processedImages = [];
  if (images && images.length > 0) {
    const rawList = images.slice(0, 3);
    for (let j = 0; j < rawList.length; j++) {
      if (rawList[j]) {
        try {
          const dataUrl = await urlToDataUrl(rawList[j]);
          if (dataUrl) processedImages.push(dataUrl);
        } catch (imgErr) {
          console.warn('Lỗi nạp ảnh nền:', imgErr);
        }
      }
    }
  }

  for (let i = 0; i < groupsToRun.length; i++) {
    // 1. Kiểm tra lệnh dừng
    if (shouldStop) {
      console.log('[AutoRecruit Background] Đã dừng lại.');
      break;
    }

    const group = groupsToRun[i];
    const groupContent = generateShuffledContent(baseContent, i, isSpintaxEnabled);

    let groupUrl = group.link;
    if (!groupUrl.startsWith('http')) {
      groupUrl = `https://www.facebook.com/groups/${groupUrl.replace(/^groups\//, '')}/`;
    }

    // Cập nhật trạng thái
    await updateStatus({
      isRunning: true,
      currentIndex: i + 1,
      totalGroups: groupsToRun.length,
      currentGroupName: group.name,
      statusText: `Đang mở nhóm ${i + 1}/${groupsToRun.length} (Đã trộn): ${group.name}...`,
    });

    let tab = null;
    try {
      // Mở tab nhóm
      tab = await chrome.tabs.create({ url: groupUrl, active: true });
      activeTabId = tab.id;

      // Chờ trang tải (có thể ngắt ngay nếu bấm DỪNG)
      await interruptibleSleep(5500);
      if (shouldStop) {
        if (tab && tab.id) chrome.tabs.remove(tab.id).catch(() => {});
        break;
      }

      // Cập nhật trạng thái
      await updateStatus({
        isRunning: true,
        currentIndex: i + 1,
        totalGroups: groups.length,
        currentGroupName: group.name,
        statusText: `Đang điền nội dung & tải ảnh vào: ${group.name}...`,
      });

      // Gửi lệnh đăng tới content script
      const sendPromise = chrome.tabs.sendMessage(tab.id, {
        action: 'AUTO_POST_TO_GROUP',
        content: groupContent,
        images: processedImages.length > 0 ? processedImages : (images || []),
      });

      // Giới hạn thời gian tối đa 35 giây mỗi nhóm
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Hết thời gian chờ phản hồi (35s)')), 35000)
      );

      const response = await Promise.race([sendPromise, timeoutPromise]);
      console.log('[AutoRecruit Background] Kết quả nhóm:', group.name, response);

      // Chờ 3.5s rồi đóng tab
      await interruptibleSleep(3500);
      if (tab && tab.id) {
        chrome.tabs.remove(tab.id).catch(() => {});
        activeTabId = null;
      }

    } catch (err) {
      console.error('[AutoRecruit Background] Lỗi nhóm:', group.name, err);
      if (tab && tab.id) {
        chrome.tabs.remove(tab.id).catch(() => {});
        activeTabId = null;
      }
    }

    if (shouldStop) break;

    // Giãn cách an toàn giữa 2 nhóm liên tiếp
    if (i < groups.length - 1) {
      const waitTime = Math.max(10, delaySec);
      for (let sec = waitTime; sec > 0; sec--) {
        if (shouldStop) break;
        await updateStatus({
          isRunning: true,
          currentIndex: i + 1,
          totalGroups: groups.length,
          currentGroupName: group.name,
          statusText: `Đã xong nhóm ${i + 1}/${groups.length}. Nghỉ an toàn ${sec}s trước khi đăng nhóm tiếp theo...`,
        });
        await interruptibleSleep(1000);
      }
    }
  }

  // Kết thúc tiến trình
  isRunning = false;
  activeTabId = null;
  const finalMsg = shouldStop ? '⏹️ Đã dừng tiến trình theo yêu cầu của bạn.' : '✓ Đã hoàn thành đăng tất cả các nhóm đã chọn!';
  await updateStatus({
    isRunning: false,
    currentIndex: groups.length,
    totalGroups: groups.length,
    statusText: finalMsg,
  });
}
