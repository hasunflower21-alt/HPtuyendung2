// dashboard.js - Bảng Điều Khiển Toàn Diện (100% Độc Lập)
// Tự động lưu 100% mọi thao tác, dừng tức thì khi bấm Dừng

const DEFAULT_POST = {
  id: 'post_hp_01',
  title: 'CÔNG TY CP HOA PHƯỢNG ME - TUYỂN DỤNG CÁN BỘ HỒ SƠ / QS / M&E',
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
  images: [
    'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  ],
};

let posts = [DEFAULT_POST];
let groups = [];
let scheduledTimes = ['08:30', '11:30', '17:30', '20:00'];
let selectedPostIdx = 0;
let autoSaveTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Elements Cột 1
  const postSelect = document.getElementById('postSelect');
  const btnNewPost = document.getElementById('btnNewPost');
  const btnSavePost = document.getElementById('btnSavePost');
  const btnDeletePost = document.getElementById('btnDeletePost');
  const postTitle = document.getElementById('postTitle');
  const postContent = document.getElementById('postContent');
  const btnSpintax = document.getElementById('btnSpintax');
  const btnPickFile = document.getElementById('btnPickFile');
  const filePicker = document.getElementById('filePicker');
  const postImageUrl = document.getElementById('postImageUrl');
  const btnAddDashImageUrl = document.getElementById('btnAddDashImageUrl');
  const btnClearDashImages = document.getElementById('btnClearDashImages');
  const dashImageBadge = document.getElementById('dashImageBadge');
  const previewText = document.getElementById('previewText');
  const previewImagesGrid = document.getElementById('previewImagesGrid');
  const btnRandomPreview = document.getElementById('btnRandomPreview');

  // Elements Cột 2
  const groupTotalBadge = document.getElementById('groupTotalBadge');
  const newGroupName = document.getElementById('newGroupName');
  const newGroupLink = document.getElementById('newGroupLink');
  const btnAddGroup = document.getElementById('btnAddGroup');
  const groupList = document.getElementById('groupList');
  const bulkLinksInput = document.getElementById('bulkLinksInput');
  const btnSaveBulkLinks = document.getElementById('btnSaveBulkLinks');

  // Elements Cột 3
  const delayInput = document.getElementById('delayInput');
  const timeTagsContainer = document.getElementById('timeTagsContainer');
  const timeInput = document.getElementById('timeInput');
  const btnAddTime = document.getElementById('btnAddTime');
  const btnGoldenHours = document.getElementById('btnGoldenHours');
  const scheduleToggle = document.getElementById('scheduleToggle');
  const btnStartRun = document.getElementById('btnStartRun');
  const btnStopRun = document.getElementById('btnStopRun');
  const progressArea = document.getElementById('progressArea');
  const statusLabel = document.getElementById('statusLabel');
  const progressBar = document.getElementById('progressBar');
  const toast = document.getElementById('toast');

  function showToast(msg) {
    if (!toast) return;
    toast.innerText = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2800);
  }

  // HÀM HIỂN THỊ 3 KHUNG ẢNH TƯƠNG TÁC
  function renderDashImageSlots() {
    const post = posts[selectedPostIdx];
    const imgs = (post && Array.isArray(post.images)) ? post.images.filter(Boolean).slice(0, 3) : [];
    if (post) post.images = imgs;

    for (let slot = 0; slot < 3; slot++) {
      const thumb = document.getElementById(`dashThumb${slot + 1}`);
      const label = document.getElementById(`dashLabel${slot + 1}`);
      const slotDiv = document.getElementById(`dashSlot${slot + 1}`);
      const delBtn = slotDiv?.querySelector('.dash-del-btn');

      if (imgs[slot]) {
        if (thumb) {
          thumb.src = imgs[slot];
          thumb.style.display = 'block';
        }
        if (label) label.style.display = 'none';
        if (delBtn) delBtn.style.display = 'block';
        if (slotDiv) slotDiv.style.border = '1px solid #0284c7';
      } else {
        if (thumb) {
          thumb.src = '';
          thumb.style.display = 'none';
        }
        if (label) label.style.display = 'block';
        if (delBtn) delBtn.style.display = 'none';
        if (slotDiv) slotDiv.style.border = '1px dashed #475569';
      }
    }

    if (dashImageBadge) {
      dashImageBadge.innerText = `${imgs.length}/3 ảnh`;
      dashImageBadge.style.color = imgs.length > 0 ? '#38bdf8' : '#94a3b8';
    }

    // Cập nhật preview mockup 3 ảnh
    if (previewImagesGrid) {
      previewImagesGrid.innerHTML = '';
      if (imgs.length > 0) {
        previewImagesGrid.style.display = 'grid';
        imgs.forEach((imgSrc) => {
          const imgEl = document.createElement('img');
          imgEl.src = imgSrc;
          imgEl.style.width = '100%';
          imgEl.style.height = '65px';
          imgEl.style.objectFit = 'cover';
          imgEl.style.borderRadius = '6px';
          previewImagesGrid.appendChild(imgEl);
        });
      } else {
        previewImagesGrid.style.display = 'none';
      }
    }
  }

  // Bắt sự kiện xóa slot
  document.querySelectorAll('.dash-del-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const slotIdx = parseInt(btn.getAttribute('data-slot'), 10);
      const post = posts[selectedPostIdx];
      if (post && Array.isArray(post.images)) {
        post.images.splice(slotIdx, 1);
        renderDashImageSlots();
        triggerAutoSave();
        showToast('✓ Đã xóa ảnh khỏi slot.');
      }
    });
  });

  btnClearDashImages?.addEventListener('click', () => {
    const post = posts[selectedPostIdx];
    if (post) {
      post.images = [];
      renderDashImageSlots();
      triggerAutoSave();
      showToast('Đã xóa tất cả ảnh của bài này.');
    }
  });

  function triggerAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      if (posts[selectedPostIdx]) {
        posts[selectedPostIdx].title = postTitle.value.trim() || 'Bài Tuyển Dụng';
        posts[selectedPostIdx].content = postContent.value;
        if (!Array.isArray(posts[selectedPostIdx].images)) {
          posts[selectedPostIdx].images = [];
        }
      }

      const activePostObj = posts[selectedPostIdx];
      const activeImgs = (activePostObj?.images || []).slice(0, 3);

      chrome.storage.local.set({
        savedPosts: posts,
        savedGroups: groups,
        savedTimes: scheduledTimes,
        selectedPostIdx: selectedPostIdx,
        customPostText: postContent.value,
        attachedImageUrl: activeImgs[0] || '',
        attachedImages: activeImgs,
        delaySec: parseInt(delayInput.value, 10) || 20,
        isScheduleActive: scheduleToggle.checked,
      }, () => {
        if (postSelect && postSelect.options[selectedPostIdx]) {
          postSelect.options[selectedPostIdx].innerText = `Bài ${selectedPostIdx + 1}: ${postTitle.value.trim() || 'Bài Tuyển Dụng'}`;
        }
      });
    }, 300);
  }

  // Tải dữ liệu ban đầu
  try {
    const preloaded = await fetch(chrome.runtime.getURL('preloaded_data.json')).then((r) => r.json()).catch(() => null);
    if (preloaded) {
      if (preloaded.groups?.length) groups = preloaded.groups;
      if (preloaded.posts?.length) posts = preloaded.posts;
    }
  } catch (e) {}

  chrome.storage.local.get(
    ['savedPosts', 'savedGroups', 'savedTimes', 'selectedPostIdx', 'isScheduleActive', 'delaySec'],
    (res) => {
      if (res.savedPosts?.length) posts = res.savedPosts;
      if (res.savedGroups?.length) groups = res.savedGroups;
      if (res.savedTimes?.length) scheduledTimes = res.savedTimes;
      if (res.isScheduleActive !== undefined) scheduleToggle.checked = res.isScheduleActive;
      if (res.delaySec !== undefined) delayInput.value = res.delaySec;
      if (res.selectedPostIdx !== undefined && res.selectedPostIdx < posts.length) {
        selectedPostIdx = res.selectedPostIdx;
      }

      renderPostDropdown();
      loadPost(selectedPostIdx, false);
      renderGroupList();
      renderTimes();
    }
  );

  // 1. Quản lý bài viết
  function renderPostDropdown() {
    postSelect.innerHTML = '';
    posts.forEach((p, idx) => {
      const opt = document.createElement('option');
      opt.value = idx.toString();
      opt.innerText = `Bài ${idx + 1}: ${p.title || 'Bài Tuyển Dụng'}`;
      if (idx === selectedPostIdx) opt.selected = true;
      postSelect.appendChild(opt);
    });
  }

  function loadPost(idx, shouldSave = true) {
    if (!posts[idx]) return;
    selectedPostIdx = idx;
    const p = posts[idx];

    postTitle.value = p.title || '';
    postContent.value = p.content || '';

    if (!Array.isArray(p.images)) {
      p.images = [];
    }

    renderDashImageSlots();

    if (shouldSave) triggerAutoSave();
    updatePreview();
  }

  // File picker multi-upload
  btnPickFile?.addEventListener('click', () => {
    filePicker.click();
  });

  filePicker?.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const p = posts[selectedPostIdx];
    if (!p) return;
    if (!Array.isArray(p.images)) p.images = [];

    const availableSlots = 3 - p.images.length;
    if (availableSlots <= 0) {
      alert('Đã đủ 3 ảnh tương tác. Bấm "✕" ở ảnh cũ để thay ảnh mới!');
      return;
    }

    const filesToRead = files.slice(0, availableSlots);
    let loadedCount = 0;

    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (dataUrl && p.images.length < 3) {
          p.images.push(dataUrl);
        }
        loadedCount++;
        if (loadedCount === filesToRead.length) {
          renderDashImageSlots();
          triggerAutoSave();
          showToast(`✓ Đã nạp ${filesToRead.length} ảnh từ máy tính (Tổng: ${p.images.length}/3 ảnh)!`);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  });

  btnAddDashImageUrl?.addEventListener('click', () => {
    const url = postImageUrl.value.trim();
    if (!url) return;
    const p = posts[selectedPostIdx];
    if (!p) return;
    if (!Array.isArray(p.images)) p.images = [];

    if (p.images.length >= 3) {
      alert('Đã đủ 3 ảnh tương tác. Xóa bớt ảnh cũ trước khi thêm URL mới!');
      return;
    }

    p.images.push(url);
    postImageUrl.value = '';
    renderDashImageSlots();
    triggerAutoSave();
    showToast(`✓ Đã thêm ảnh (${p.images.length}/3)!`);
  });

  postImageUrl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      btnAddDashImageUrl?.click();
    }
  });

  postSelect.addEventListener('change', (e) => {
    loadPost(parseInt(e.target.value, 10), true);
  });

  postTitle.addEventListener('input', triggerAutoSave);
  postContent.addEventListener('input', () => {
    updatePreview();
    triggerAutoSave();
  });
  delayInput.addEventListener('input', triggerAutoSave);
  delayInput.addEventListener('change', triggerAutoSave);

  btnNewPost.addEventListener('click', () => {
    const newP = {
      id: `post_${Date.now()}`,
      title: `Bài Tuyển Dụng ${posts.length + 1}`,
      content: `🔥 THÔNG BÁO TUYỂN DỤNG GẤP\n📍 Địa điểm: Hà Nội\n💰 Lương: 12 - 20 Triệu\n📞 Hotline / Zalo: 0966.203.310`,
      images: [],
    };
    posts.push(newP);
    selectedPostIdx = posts.length - 1;
    renderPostDropdown();
    loadPost(selectedPostIdx, true);
    showToast('✓ Đã thêm bài viết mới!');
    postTitle.focus();
  });

  btnSavePost.addEventListener('click', () => {
    triggerAutoSave();
    showToast('✓ Đã lưu cài đặt bài viết thành công!');
  });

  btnDeletePost.addEventListener('click', () => {
    if (posts.length <= 1) {
      alert('Phải giữ ít nhất 1 bài viết trong danh sách!');
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa bài "${posts[selectedPostIdx]?.title}"?`)) {
      posts.splice(selectedPostIdx, 1);
      selectedPostIdx = 0;
      renderPostDropdown();
      loadPost(0, true);
      showToast('✓ Đã xóa bài viết.');
    }
  });

  function resolveSpintax(t) {
    if (!t) return '';
    return t.replace(/\{([^{}]+)\}/g, (m, c) => {
      const parts = c.split('|');
      return parts[Math.floor(Math.random() * parts.length)];
    });
  }

  function updatePreview() {
    previewText.innerText = resolveSpintax(postContent.value);
  }
  btnRandomPreview.addEventListener('click', updatePreview);

  btnSpintax.addEventListener('click', () => {
    let t = postContent.value;
    if (!t) return;
    t = t.replace(/(CÔNG TY THÔNG BÁO TUYỂN DỤNG|TUYỂN DỤNG|TUYỂN GẤP)/gi, '{CÔNG TY THÔNG BÁO TUYỂN DỤNG|THÔNG TIN TUYỂN DỤNG GẤP|CƠ HỘI NGHỀ NGHIỆP HẤP DẪN}');
    t = t.replace(/(Mức lương|Thu nhập|Lương cứng)/gi, '{Mức lương|Thu nhập|Mức đãi ngộ}');
    t = t.replace(/(Yêu cầu|Yêu cầu công việc)/gi, '{Yêu cầu công việc|Tiêu chuẩn ứng tuyển}');
    t = t.replace(/(Địa điểm làm việc|Địa chỉ|Nơi làm việc)/gi, '{Địa điểm làm việc|Nơi làm việc|Khu vực làm việc}');
    postContent.value = t;
    updatePreview();
    triggerAutoSave();
    showToast('✓ Đã tự động tạo các biến thể Spintax!');
  });

  // 2. Quản lý nhóm
  function renderGroupList() {
    groupList.innerHTML = '';
    groupTotalBadge.innerText = `${groups.length} Nhóm`;

    groups.forEach((g, idx) => {
      const row = document.createElement('div');
      row.className = 'group-item';

      const left = document.createElement('div');
      left.style.display = 'flex';
      left.style.alignItems = 'center';
      left.style.gap = '8px';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = g.enabled !== false;
      cb.style.accentColor = '#0284c7';
      cb.addEventListener('change', () => {
        g.enabled = cb.checked;
        triggerAutoSave();
      });

      const name = document.createElement('span');
      name.className = 'group-name';
      name.innerText = `${idx + 1}. ${g.name || 'Nhóm Facebook'}`;

      left.appendChild(cb);
      left.appendChild(name);

      const right = document.createElement('div');
      right.style.display = 'flex';
      right.style.alignItems = 'center';
      right.style.gap = '8px';

      const link = document.createElement('a');
      link.href = g.link;
      link.target = '_blank';
      link.innerText = 'Mở nhóm ↗';
      link.style.color = '#38bdf8';
      link.style.textDecoration = 'none';

      const delBtn = document.createElement('button');
      delBtn.innerText = '✕';
      delBtn.className = 'btn btn-sub';
      delBtn.style.padding = '2px 6px';
      delBtn.style.color = '#ef4444';
      delBtn.addEventListener('click', () => {
        groups.splice(idx, 1);
        triggerAutoSave();
        renderGroupList();
      });

      right.appendChild(link);
      right.appendChild(delBtn);

      row.appendChild(left);
      row.appendChild(right);
      groupList.appendChild(row);
    });
  }

  btnAddGroup.addEventListener('click', () => {
    const name = newGroupName.value.trim() || `Nhóm Tuyển Dụng ${groups.length + 1}`;
    const link = newGroupLink.value.trim();
    if (!link.startsWith('http')) {
      alert('Vui lòng nhập link nhóm Facebook hợp lệ (https://www.facebook.com/groups/...)');
      return;
    }
    groups.push({ id: `grp_${Date.now()}`, name, link, enabled: true });
    triggerAutoSave();
    renderGroupList();
    newGroupName.value = '';
    newGroupLink.value = '';
    showToast('✓ Đã thêm nhóm mới!');
  });

  btnSaveBulkLinks.addEventListener('click', () => {
    const raw = bulkLinksInput.value.trim();
    if (!raw) return;
    const lines = raw.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('http'));
    groups = lines.map((url, i) => ({
      id: `grp_custom_${i + 1}`,
      name: `Nhóm Tuyển Dụng ${i + 1}`,
      link: url,
      enabled: true,
    }));
    triggerAutoSave();
    renderGroupList();
    bulkLinksInput.value = '';
    showToast(`✓ Đã lưu ${groups.length} nhóm!`);
  });

  const btnShuffleDashboardGroups = document.getElementById('btnShuffleDashboardGroups');
  btnShuffleDashboardGroups?.addEventListener('click', () => {
    if (!groups || groups.length <= 1) return;
    for (let i = groups.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [groups[i], groups[j]] = [groups[j], groups[i]];
    }
    triggerAutoSave();
    renderGroupList();
    showToast('🎲 Đã xáo trộn ngẫu nhiên thứ tự các nhóm!');
  });

  // 3. Giờ đăng
  function renderTimes() {
    timeTagsContainer.innerHTML = '';
    scheduledTimes.forEach((t, i) => {
      const tag = document.createElement('div');
      tag.className = 'time-tag';
      tag.innerHTML = `<span>⏰ ${t}</span><span class="del" data-i="${i}">✕</span>`;
      timeTagsContainer.appendChild(tag);
    });

    document.querySelectorAll('.time-tag .del').forEach((el) => {
      el.addEventListener('click', (e) => {
        const i = parseInt(e.target.getAttribute('data-i'), 10);
        scheduledTimes.splice(i, 1);
        triggerAutoSave();
        renderTimes();
      });
    });
  }

  btnAddTime.addEventListener('click', () => {
    const val = timeInput.value.trim();
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(val)) {
      alert('Vui lòng nhập đúng định dạng HH:mm (Ví dụ: 09:30)');
      return;
    }
    if (!scheduledTimes.includes(val)) {
      scheduledTimes.push(val);
      scheduledTimes.sort();
      triggerAutoSave();
      renderTimes();
      timeInput.value = '';
    }
  });

  btnGoldenHours.addEventListener('click', () => {
    scheduledTimes = ['08:30', '11:30', '17:30', '20:00'];
    triggerAutoSave();
    renderTimes();
    showToast('✓ Đã nạp 4 mốc giờ vàng!');
  });

  scheduleToggle.addEventListener('change', () => {
    const isChecked = scheduleToggle.checked;
    triggerAutoSave();
    if (isChecked) {
      chrome.runtime.sendMessage({
        action: 'SCHEDULE_AUTO_POST',
        payload: {
          times: scheduledTimes,
          delaySec: parseInt(delayInput.value, 10) || 20,
          isSpintaxEnabled: true,
        },
      });
      showToast('✓ Đã bật hẹn giờ đăng tự động!');
    } else {
      chrome.runtime.sendMessage({ action: 'CANCEL_SCHEDULE' });
      showToast('Đã tắt hẹn giờ.');
    }
  });

  // 4. Bắt đầu đăng liên hoàn
  btnStartRun.addEventListener('click', () => {
    const activeGrps = groups.filter((g) => g.enabled !== false);
    if (!activeGrps.length) {
      alert('Vui lòng bật ít nhất 1 nhóm để đăng!');
      return;
    }
    const txt = postContent.value.trim();
    if (!txt) {
      alert('Vui lòng nhập nội dung bài viết!');
      return;
    }

    const currentPostObj = posts[selectedPostIdx];
    const postImgs = (currentPostObj?.images && currentPostObj.images.length > 0)
      ? currentPostObj.images.slice(0, 3)
      : (postImageUrl.value.trim() ? [postImageUrl.value.trim()] : []);

    btnStartRun.style.display = 'none';
    btnStopRun.style.display = 'block';
    progressArea.style.display = 'block';
    statusLabel.innerText = 'Đang bắt đầu...';
    progressBar.style.width = '5%';

    chrome.runtime.sendMessage({
      action: 'START_BATCH_POSTING',
      payload: {
        groups: activeGrps,
        content: txt,
        images: postImgs,
        isSpintaxEnabled: true,
        delaySec: parseInt(delayInput.value, 10) || 20,
        shouldShuffle: true,
      },
    });
  });

  // DỪNG TỨC THÌ
  btnStopRun.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'STOP_BATCH_POSTING' }, () => {
      btnStartRun.style.display = 'block';
      btnStopRun.style.display = 'none';
      statusLabel.innerText = '⏹️ Đã dừng tiến trình!';
      progressBar.style.width = '0%';
      showToast('⏹️ Đã dừng tiến trình ngay lập tức!');
    });
  });

  setInterval(() => {
    chrome.storage.local.get(['postJobState'], (res) => {
      const state = res.postJobState;
      if (!state) return;
      if (state.isRunning) {
        btnStartRun.style.display = 'none';
        btnStopRun.style.display = 'block';
        progressArea.style.display = 'block';
        statusLabel.innerText = state.statusText || 'Đang đăng...';
        const percent = Math.min(100, Math.round(((state.currentIndex || 0) / (state.totalGroups || 1)) * 100));
        progressBar.style.width = `${percent}%`;
      } else {
        btnStartRun.style.display = 'block';
        btnStopRun.style.display = 'none';
        if (state.statusText) {
          statusLabel.innerText = state.statusText;
        }
      }
    });
  }, 800);
});
