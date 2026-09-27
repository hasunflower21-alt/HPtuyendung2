// web_bridge.js - CẦU NỐI THỜI GIAN THỰC 2 CHIỀU GIỮA WEB APP VÀ CHROME EXTENSION
// Mọi thao tác sửa bài, đổi ảnh, chỉnh nhóm trên Web App sẽ tự động đẩy ngay lập tức sang Extension!

(function () {
  // Chỉ chạy trên các trang AutoRecruit FB (dang-bai-fb.pages.dev, localhost, run.app...)
  const isTarget = 
    window.location.href.includes('dang-bai-fb') ||
    window.location.href.includes('pages.dev') ||
    window.location.href.includes('run.app') ||
    window.location.href.includes('localhost') ||
    document.title.includes('AutoRecruit');

  if (!isTarget) return;

  console.log('[AutoRecruit Real-time Bridge] Khởi động cầu nối thời gian thực trên:', window.location.href);

  // Đánh dấu để Web App nhận diện Extension đã cài đặt
  try {
    document.documentElement.setAttribute('data-autorecruit-extension', 'true');
    window.__AUTORECRUIT_EXTENSION_INSTALLED__ = true;
  } catch (e) {}

  let lastSentHash = '';

  // Hàm đồng bộ ngay lập tức sang background service worker
  function broadcastUpdateToExtension(customPayload = null) {
    try {
      let payload = customPayload;
      if (!payload) {
        const raw = localStorage.getItem('autorecruit_fb_data_v1');
        if (raw) {
          try { payload = JSON.parse(raw); } catch (e) {}
        }
      }

      if (!payload || !payload.posts) return;

      const posts = payload.posts || [];
      const groups = payload.groups || [];
      const settings = payload.settings || {};
      const activePost = payload.activePost || posts.find((p) => p.status === 'active') || posts[0];

      const currentHash = JSON.stringify({
        postCount: posts.length,
        activePostTitle: activePost?.title,
        activePostContent: activePost?.content?.slice(0, 100),
        activePostImg: activePost?.images?.[0],
        groupCount: groups.length,
      });

      // Tránh gửi lặp nếu nội dung không đổi
      if (currentHash === lastSentHash && !customPayload) return;
      lastSentHash = currentHash;

      chrome.runtime.sendMessage({
        action: 'REALTIME_WEBAPP_SYNC',
        payload: {
          posts,
          groups: groups.filter((g) => g.enabled).length ? groups.filter((g) => g.enabled) : groups,
          settings,
          activePost,
          url: window.location.href,
          timestamp: Date.now(),
        },
      }, (res) => {
        if (!chrome.runtime.lastError) {
          console.log('[AutoRecruit Real-time Bridge] ✓ Đã tự động cập nhật Extension theo thay đổi của Web App!');
        }
      });
    } catch (err) {
      console.warn('[AutoRecruit Real-time Bridge] Lỗi đồng bộ:', err);
    }
  }

  // 1. Phản hồi Ping từ Web App
  window.addEventListener('AUTORECRUIT_WEBAPP_PING', () => {
    window.dispatchEvent(new CustomEvent('AUTORECRUIT_EXTENSION_PONG'));
    broadcastUpdateToExtension();
  });

  // 2. Lắng nghe sự kiện Web App vừa sửa dữ liệu (Real-time Event)
  window.addEventListener('AUTORECRUIT_DATA_CHANGE', (event) => {
    console.log('[AutoRecruit Real-time Bridge] Nhận tín hiệu Web App sửa dữ liệu:', event.detail);
    broadcastUpdateToExtension(event.detail);
  });

  window.addEventListener('message', (event) => {
    if (event.data && (event.data.type === 'AUTORECRUIT_DATA_CHANGE' || event.data.type === 'AUTORECRUIT_PUSH_TO_EXTENSION')) {
      broadcastUpdateToExtension(event.detail || event.data.payload);
    }
  });

  // 3. Lắng nghe thay đổi của localStorage
  window.addEventListener('storage', (event) => {
    if (event.key === 'autorecruit_fb_data_v1') {
      broadcastUpdateToExtension();
    }
  });

  // 4. Quét định kỳ kiểm tra thay đổi
  setInterval(broadcastUpdateToExtension, 2500);

  // 5. Chạy ngay khi tải xong
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('AUTORECRUIT_EXTENSION_READY'));
    broadcastUpdateToExtension();
  }, 1000);
})();
