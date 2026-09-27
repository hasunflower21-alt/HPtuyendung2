// popup.js - Trình Quản Lý & Đăng Bài All-in-One (Độc Lập 100%)
// Tự động lưu 100% mọi thao tác (sửa bài, đổi ảnh, chỉnh giờ, chọn nhóm)
// Dừng tức thì khi bấm DỪNG, Không bao giờ đăng lặp

const DEFAULT_HOA_PHUONG_POST = {
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

let currentPosts = [DEFAULT_HOA_PHUONG_POST];
let currentGroups = [];
let currentScheduledTimes = ['08:30', '11:30', '17:30', '20:00'];
let currentSelectedPostIndex = 0;
let autoSaveTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const toast = document.getElementById('toast');
  const btnOpenFullTab = document.getElementById('btnOpenFullTab');

  const postSelector = document.getElementById('postSelector');
  const btnAddNewPost = document.getElementById('btnAddNewPost');
  const btnSaveCurrentPost = document.getElementById('btnSaveCurrentPost');
  const btnDeleteCurrentPost = document.getElementById('btnDeleteCurrentPost');
  const postTitleInput = document.getElementById('postTitleInput');
  const postContent = document.getElementById('postContent');
  const enableSpintax = document.getElementById('enableSpintax');
  const btnAutoSpintax = document.getElementById('btnAutoSpintax');
  const previewBox = document.getElementById('previewBox');
  const btnRerollPreview = document.getElementById('btnRerollPreview');

  const enableAttachImage = document.getElementById('enableAttachImage');
  const imageUrlInput = document.getElementById('imageUrlInput');
  const btnAddImageUrl = document.getElementById('btnAddImageUrl');
  const imageStatusBadge = document.getElementById('imageStatusBadge');
  const btnPickLocalFile = document.getElementById('btnPickLocalFile');
  const localImagePicker = document.getElementById('localImagePicker');
  const btnClearAllImages = document.getElementById('btnClearAllImages');

  const delayInput = document.getElementById('delayInput');
  const timeTagsContainer = document.getElementById('timeTagsContainer');
  const newTimeInput = document.getElementById('newTimeInput');
  const btnAddTime = document.getElementById('btnAddTime');
  const btnResetGoldenHours = document.getElementById('btnResetGoldenHours');
  const enableScheduleAuto = document.getElementById('enableScheduleAuto');

  const groupBox = document.getElementById('groupBox');
  const groupCountBadge = document.getElementById('groupCountBadge');
  const shuffleGroupsToggle = document.getElementById('shuffleGroupsToggle');
  const btnShuffleGroupsNow = document.getElementById('btnShuffleGroupsNow');
  const btnEditGroups = document.getElementById('btnEditGroups');
  const editGroupArea = document.getElementById('editGroupArea');
  const groupLinksInput = document.getElementById('groupLinksInput');
  const btnSaveGroupLinks = document.getElementById('btnSaveGroupLinks');
  const btnCancelEditGroups = document.getElementById('btnCancelEditGroups');

  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const progressBox = document.getElementById('progressBox');
  const statusText = document.getElementById('statusText');
  const progressBar = document.getElementById('progressBar');

  // Mở tab toàn màn hình
  btnOpenFullTab?.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  });

  // Chuyển Tab
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId)?.classList.add('active');
    });
  });

  function showToast(msg) {
    if (!toast) return;
    toast.innerText = msg;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 2800);
  }

  // HÀM HIỂN THỊ VÀ CẬP NHẬT 3 KHUNG ẢNH TƯƠNG TÁC
  function renderImageSlots() {
    const post = currentPosts[currentSelectedPostIndex];
    const imgs = (post && Array.isArray(post.images)) ? post.images.filter(Boolean).slice(0, 3) : [];
    if (post) post.images = imgs;

    for (let slot = 0; slot < 3; slot++) {
      const thumb = document.getElementById(`thumb${slot + 1}`);
      const label = document.getElementById(`label${slot + 1}`);
      const slotDiv = document.getElementById(`slot${slot + 1}`);
      const delBtn = slotDiv?.querySelector('.del-slot-btn');

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

    if (imageStatusBadge) {
      imageStatusBadge.innerText = `${imgs.length}/3 ảnh tương tác`;
      imageStatusBadge.style.color = imgs.length > 0 ? '#38bdf8' : '#94a3b8';
    }
  }

  // HÀM TỰ ĐỘNG LƯU MỌI THAY ĐỔI VÀO STORAGE (DEBOUNCE AUTO-SAVE)
  function triggerAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      if (currentPosts[currentSelectedPostIndex]) {
        currentPosts[currentSelectedPostIndex].title = postTitleInput.value.trim() || 'Bài Tuyển Dụng';
        currentPosts[currentSelectedPostIndex].content = postContent.value;
        if (!Array.isArray(currentPosts[currentSelectedPostIndex].images)) {
          currentPosts[currentSelectedPostIndex].images = [];
        }
      }

      const activePostObj = currentPosts[currentSelectedPostIndex];
      const activeImgs = (activePostObj?.images || []).slice(0, 3);

      chrome.storage.local.set({
        savedPosts: currentPosts,
        savedGroups: currentGroups,
        savedTimes: currentScheduledTimes,
        selectedPostIdx: currentSelectedPostIndex,
        customPostText: postContent.value,
        attachedImageUrl: activeImgs[0] || '',
        attachedImages: activeImgs,
        isAttachImageEnabled: enableAttachImage.checked && activeImgs.length > 0,
        delaySec: parseInt(delayInput.value, 10) || 20,
        enableSpintax: enableSpintax.checked,
        isScheduleActive: enableScheduleAuto.checked,
        shouldShuffleGroups: shuffleGroupsToggle ? shuffleGroupsToggle.checked : true,
      }, () => {
        // Cập nhật lại dropdown title nếu có thay đổi
        if (postSelector && postSelector.options[currentSelectedPostIndex]) {
          postSelector.options[currentSelectedPostIndex].innerText = `Bài ${currentSelectedPostIndex + 1}: ${postTitleInput.value.trim() || 'Bài Tuyển Dụng'}`;
        }
      });
    }, 300);
  }

  // 1. TẢI DỮ LIỆU TỪ CHROME STORAGE
  try {
    const preloadedRes = await fetch(chrome.runtime.getURL('preloaded_data.json')).then((r) => r.json()).catch(() => null);
    if (preloadedRes) {
      if (preloadedRes.groups && preloadedRes.groups.length) currentGroups = preloadedRes.groups;
      if (preloadedRes.posts && preloadedRes.posts.length) currentPosts = preloadedRes.posts;
    }
  } catch (e) {}

  chrome.storage.local.get(
    [
      'savedGroups',
      'savedPosts',
      'savedTimes',
      'isScheduleActive',
      'selectedPostIdx',
      'customPostText',
      'attachedImageUrl',
      'isAttachImageEnabled',
      'delaySec',
      'enableSpintax',
      'shouldShuffleGroups',
    ],
    (res) => {
      if (res.savedPosts && res.savedPosts.length) currentPosts = res.savedPosts;
      if (res.savedGroups && res.savedGroups.length) currentGroups = res.savedGroups;
      if (res.savedTimes && res.savedTimes.length) currentScheduledTimes = res.savedTimes;
      if (res.isScheduleActive !== undefined) enableScheduleAuto.checked = res.isScheduleActive;
      if (res.delaySec !== undefined) delayInput.value = res.delaySec;
      if (res.enableSpintax !== undefined) enableSpintax.checked = res.enableSpintax;
      if (res.shouldShuffleGroups !== undefined && shuffleGroupsToggle) shuffleGroupsToggle.checked = res.shouldShuffleGroups;
      if (res.selectedPostIdx !== undefined && res.selectedPostIdx < currentPosts.length) {
        currentSelectedPostIndex = res.selectedPostIdx;
      }
      if (res.isAttachImageEnabled !== undefined) enableAttachImage.checked = res.isAttachImageEnabled;

      renderPostsDropdown();
      loadPostByIndex(currentSelectedPostIndex, false);
      renderGroupsList();
      renderTimeTags();
      updateLivePreview();
    }
  );

  // 2. GẮN SỰ KIỆN TỰ ĐỘNG LƯU KHI NGƯỜI DÙNG GÕ PHÍM / CHỈNH SỬA
  postTitleInput.addEventListener('input', () => {
    triggerAutoSave();
  });

  postContent.addEventListener('input', () => {
    updateLivePreview();
    triggerAutoSave();
  });

  enableSpintax.addEventListener('change', () => {
    updateLivePreview();
    triggerAutoSave();
  });

  delayInput.addEventListener('input', triggerAutoSave);
  delayInput.addEventListener('change', triggerAutoSave);

  enableAttachImage.addEventListener('change', () => {
    triggerAutoSave();
  });

  // Bắt sự kiện xóa ảnh từng slot
  document.querySelectorAll('.del-slot-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const slotIdx = parseInt(btn.getAttribute('data-slot'), 10);
      const post = currentPosts[currentSelectedPostIndex];
      if (post && Array.isArray(post.images)) {
        post.images.splice(slotIdx, 1);
        renderImageSlots();
        triggerAutoSave();
        showToast('✓ Đã xóa ảnh khỏi slot.');
      }
    });
  });

  btnClearAllImages?.addEventListener('click', () => {
    const post = currentPosts[currentSelectedPostIndex];
    if (post) {
      post.images = [];
      renderImageSlots();
      triggerAutoSave();
      showToast('Đã xóa tất cả ảnh của bài này.');
    }
  });

  // 3. CHỌN TỐI ĐA 3 ẢNH TỪ MÁY TÍNH
  btnPickLocalFile?.addEventListener('click', () => {
    localImagePicker.click();
  });

  localImagePicker?.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const post = currentPosts[currentSelectedPostIndex];
    if (!post) return;
    if (!Array.isArray(post.images)) post.images = [];

    const availableSlots = 3 - post.images.length;
    if (availableSlots <= 0) {
      alert('Đã đủ 3 ảnh tương tác. Bấm nút "✕" ở ảnh cũ để thay ảnh mới!');
      return;
    }

    const filesToRead = files.slice(0, availableSlots);
    let loadedCount = 0;

    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (dataUrl && post.images.length < 3) {
          post.images.push(dataUrl);
        }
        loadedCount++;
        if (loadedCount === filesToRead.length) {
          enableAttachImage.checked = true;
          renderImageSlots();
          triggerAutoSave();
          showToast(`✓ Đã nạp ${filesToRead.length} ảnh từ máy tính (Tổng: ${post.images.length}/3 ảnh)!`);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  });

  btnAddImageUrl?.addEventListener('click', () => {
    const url = imageUrlInput.value.trim();
    if (!url) return;
    const post = currentPosts[currentSelectedPostIndex];
    if (!post) return;
    if (!Array.isArray(post.images)) post.images = [];

    if (post.images.length >= 3) {
      alert('Đã đủ 3 ảnh tương tác. Hãy xóa bớt 1 ảnh cũ trước khi thêm URL mới!');
      return;
    }

    post.images.push(url);
    imageUrlInput.value = '';
    enableAttachImage.checked = true;
    renderImageSlots();
    triggerAutoSave();
    showToast(`✓ Đã thêm ảnh vào bộ 3 ảnh tương tác (${post.images.length}/3)!`);
  });

  imageUrlInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      btnAddImageUrl?.click();
    }
  });

  // 4. QUẢN LÝ BÀI VIẾT
  function renderPostsDropdown() {
    postSelector.innerHTML = '';
    currentPosts.forEach((p, idx) => {
      const opt = document.createElement('option');
      opt.value = idx.toString();
      opt.innerText = `Bài ${idx + 1}: ${p.title || 'Bài Tuyển Dụng'}`;
      if (idx === currentSelectedPostIndex) opt.selected = true;
      postSelector.appendChild(opt);
    });
  }

  function loadPostByIndex(idx, shouldSave = true) {
    if (!currentPosts[idx]) return;
    currentSelectedPostIndex = idx;
    const post = currentPosts[idx];

    postTitleInput.value = post.title || '';
    postContent.value = post.content || '';

    if (!Array.isArray(post.images)) {
      post.images = [];
    }

    if (post.images.length > 0 && enableAttachImage) {
      enableAttachImage.checked = true;
    }

    renderImageSlots();

    if (shouldSave) triggerAutoSave();
    updateLivePreview();
  }

  postSelector.addEventListener('change', (e) => {
    loadPostByIndex(parseInt(e.target.value, 10), true);
  });

  btnAddNewPost?.addEventListener('click', () => {
    const newPost = {
      id: `post_${Date.now()}`,
      title: `Bài Tuyển Dụng ${currentPosts.length + 1}`,
      content: `🔥 CƠ HỘI NGHỀ NGHIỆP TUYỂN DỤNG\n📍 Địa điểm: Hà Nội\n💰 Lương: 12 - 20 Triệu\n📞 Hotline / Zalo: 0966.203.310`,
      images: [],
    };
    currentPosts.push(newPost);
    currentSelectedPostIndex = currentPosts.length - 1;
    renderPostsDropdown();
    loadPostByIndex(currentSelectedPostIndex, true);
    showToast('✓ Đã tạo bài viết mới!');
    postTitleInput.focus();
  });

  btnSaveCurrentPost?.addEventListener('click', () => {
    triggerAutoSave();
    showToast('✓ Đã lưu cài đặt bài viết thành công!');
  });

  btnDeleteCurrentPost?.addEventListener('click', () => {
    if (currentPosts.length <= 1) {
      alert('Bạn cần giữ ít nhất 1 bài viết trong danh sách!');
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa bài "${currentPosts[currentSelectedPostIndex]?.title}"?`)) {
      currentPosts.splice(currentSelectedPostIndex, 1);
      currentSelectedPostIndex = 0;
      renderPostsDropdown();
      loadPostByIndex(0, true);
      showToast('✓ Đã xóa bài viết.');
    }
  });

  // 5. SPINTAX & PREVIEW
  function resolveSpintax(text) {
    if (!text) return '';
    return text.replace(/\{([^{}]+)\}/g, (match, choices) => {
      const parts = choices.split('|');
      return parts[Math.floor(Math.random() * parts.length)];
    });
  }

  function updateLivePreview() {
    const raw = postContent.value;
    if (enableSpintax.checked) {
      previewBox.innerText = resolveSpintax(raw);
    } else {
      previewBox.innerText = raw.replace(/\{([^{}]+)\}/g, (m, c) => c.split('|')[0]);
    }
  }

  btnRerollPreview?.addEventListener('click', updateLivePreview);

  btnAutoSpintax?.addEventListener('click', () => {
    let t = postContent.value;
    if (!t) return;
    t = t.replace(/(CÔNG TY THÔNG BÁO TUYỂN DỤNG|TUYỂN DỤNG|TUYỂN GẤP)/gi, '{CÔNG TY THÔNG BÁO TUYỂN DỤNG|THÔNG TIN TUYỂN DỤNG GẤP|CƠ HỘI NGHỀ NGHIỆP HẤP DẪN}');
    t = t.replace(/(Mức lương|Thu nhập|Lương cứng)/gi, '{Mức lương|Thu nhập|Mức đãi ngộ}');
    t = t.replace(/(Yêu cầu|Yêu cầu công việc)/gi, '{Yêu cầu công việc|Tiêu chuẩn ứng tuyển}');
    t = t.replace(/(Địa điểm làm việc|Địa chỉ|Nơi làm việc)/gi, '{Địa điểm làm việc|Nơi làm việc|Khu vực làm việc}');
    postContent.value = t;
    updateLivePreview();
    triggerAutoSave();
    showToast('✓ Đã áp dụng cú pháp Spintax {A|B|C} và tự động lưu!');
  });

  // 6. QUẢN LÝ 20 NHÓM
  function renderGroupsList() {
    groupBox.innerHTML = '';
    groupCountBadge.innerText = `${currentGroups.length} Nhóm`;

    if (currentGroups.length === 0) {
      groupBox.innerHTML = '<div style="color: #64748b; padding: 10px; text-align: center;">Chưa có nhóm nào. Bấm Chỉnh Sửa để dán link nhóm!</div>';
      return;
    }

    currentGroups.forEach((g, idx) => {
      const row = document.createElement('div');
      row.className = 'group-item';

      const left = document.createElement('div');
      left.style.display = 'flex';
      left.style.alignItems = 'center';
      left.style.gap = '6px';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = g.enabled !== false;
      cb.style.cursor = 'pointer';
      cb.addEventListener('change', () => {
        g.enabled = cb.checked;
        triggerAutoSave();
      });

      const nameSpan = document.createElement('span');
      nameSpan.innerText = `${idx + 1}. ${g.name || 'Nhóm Facebook'}`;
      nameSpan.style.maxWidth = '180px';
      nameSpan.style.overflow = 'hidden';
      nameSpan.style.textOverflow = 'ellipsis';
      nameSpan.style.whiteSpace = 'nowrap';

      left.appendChild(cb);
      left.appendChild(nameSpan);

      const link = document.createElement('a');
      link.className = 'group-link';
      link.href = g.link;
      link.target = '_blank';
      link.innerText = 'Xem nhóm';

      row.appendChild(left);
      row.appendChild(link);
      groupBox.appendChild(row);
    });
  }

  btnEditGroups?.addEventListener('click', () => {
    editGroupArea.style.display = 'block';
    groupLinksInput.value = currentGroups.map((g) => g.link).join('\n');
    groupLinksInput.focus();
  });

  btnCancelEditGroups?.addEventListener('click', () => {
    editGroupArea.style.display = 'none';
  });

  btnSaveGroupLinks?.addEventListener('click', () => {
    const raw = groupLinksInput.value.trim();
    if (!raw) {
      alert('Vui lòng nhập ít nhất 1 link nhóm Facebook!');
      return;
    }

    const lines = raw.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('http'));
    currentGroups = lines.map((url, i) => ({
      id: `grp_custom_${i + 1}`,
      name: `Nhóm Tuyển Dụng ${i + 1}`,
      link: url,
      enabled: true,
    }));

    triggerAutoSave();
    renderGroupsList();
    editGroupArea.style.display = 'none';
    showToast(`✓ Đã lưu thành công ${currentGroups.length} nhóm!`);
  });

  // Nút xáo trộn danh sách nhóm ngay lập tức
  btnShuffleGroupsNow?.addEventListener('click', () => {
    if (!currentGroups || currentGroups.length <= 1) return;
    for (let i = currentGroups.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentGroups[i], currentGroups[j]] = [currentGroups[j], currentGroups[i]];
    }
    triggerAutoSave();
    renderGroupsList();
    showToast('🎲 Đã xáo trộn ngẫu nhiên thứ tự các nhóm!');
  });

  shuffleGroupsToggle?.addEventListener('change', () => {
    triggerAutoSave();
  });

  // 7. CÀI ĐẶT THỜI GIAN & HẸN GIỜ
  function renderTimeTags() {
    timeTagsContainer.innerHTML = '';
    currentScheduledTimes.forEach((time, index) => {
      const tag = document.createElement('div');
      tag.className = 'time-tag';
      tag.innerHTML = `<span>⏰ ${time}</span><span class="del-time" data-idx="${index}">✕</span>`;
      timeTagsContainer.appendChild(tag);
    });

    document.querySelectorAll('.del-time').forEach((el) => {
      el.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        currentScheduledTimes.splice(idx, 1);
        triggerAutoSave();
        renderTimeTags();
      });
    });
  }

  btnAddTime?.addEventListener('click', () => {
    const val = newTimeInput.value.trim();
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(val)) {
      alert('Vui lòng nhập đúng định dạng giờ: HH:mm (Ví dụ: 09:30 hoặc 15:45)');
      return;
    }
    if (!currentScheduledTimes.includes(val)) {
      currentScheduledTimes.push(val);
      currentScheduledTimes.sort();
      triggerAutoSave();
      renderTimeTags();
      newTimeInput.value = '';
    }
  });

  btnResetGoldenHours?.addEventListener('click', () => {
    currentScheduledTimes = ['08:30', '11:30', '17:30', '20:00'];
    triggerAutoSave();
    renderTimeTags();
    showToast('✓ Đã nạp lại 4 khung giờ vàng tuyển dụng!');
  });

  enableScheduleAuto?.addEventListener('change', () => {
    const isChecked = enableScheduleAuto.checked;
    triggerAutoSave();
    if (isChecked) {
      chrome.runtime.sendMessage({
        action: 'SCHEDULE_AUTO_POST',
        payload: {
          times: currentScheduledTimes,
          delaySec: parseInt(delayInput.value, 10) || 20,
          isSpintaxEnabled: enableSpintax.checked,
        },
      });
      showToast('✓ Đã bật hẹn giờ đăng tự động!');
    } else {
      chrome.runtime.sendMessage({ action: 'CANCEL_SCHEDULE' });
      showToast('Đã tắt hẹn giờ.');
    }
  });

  // 8. BẮT ĐẦU ĐĂNG 20 NHÓM NGAY
  startBtn.addEventListener('click', async () => {
    const activeGroups = currentGroups.filter((g) => g.enabled !== false);
    if (activeGroups.length === 0) {
      alert('Chưa có nhóm nào được chọn! Vui lòng chọn ít nhất 1 nhóm.');
      return;
    }

    const contentToPost = postContent.value.trim();
    if (!contentToPost) {
      alert('Vui lòng nhập nội dung bài viết trước khi đăng!');
      return;
    }

    const activePostObj = currentPosts[currentSelectedPostIndex];
    let postImg = [];
    if (enableAttachImage.checked) {
      if (activePostObj && activePostObj.images && activePostObj.images.length > 0) {
        postImg = activePostObj.images.slice(0, 3);
      } else if (imageUrlInput.value.trim()) {
        postImg = [imageUrlInput.value.trim()];
      }
    }

    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    progressBox.style.display = 'block';
    statusText.innerText = 'Đang kích hoạt tiến trình đăng tự động...';
    progressBar.style.width = '5%';

    chrome.runtime.sendMessage({
      action: 'START_BATCH_POSTING',
      payload: {
        groups: activeGroups,
        content: contentToPost,
        images: postImg,
        isSpintaxEnabled: enableSpintax.checked,
        delaySec: parseInt(delayInput.value, 10) || 20,
        shouldShuffle: shuffleGroupsToggle ? shuffleGroupsToggle.checked : true,
      },
    });
  });

  // 9. NÚT DỪNG TIẾN TRÌNH (DỪNG TỨC THÌ 100%)
  stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'STOP_BATCH_POSTING' }, (res) => {
      startBtn.style.display = 'block';
      stopBtn.style.display = 'none';
      statusText.innerText = '⏹️ Đã dừng tiến trình đăng bài!';
      progressBar.style.width = '0%';
      showToast('⏹️ Đã dừng tiến trình ngay lập tức!');
    });
  });

  // THEO DÕI TRẠNG THÁI TIẾN TRÌNH TỪ BACKGROUND
  setInterval(() => {
    chrome.storage.local.get(['postJobState'], (res) => {
      const state = res.postJobState;
      if (!state) return;

      if (state.isRunning) {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        progressBox.style.display = 'block';

        statusText.innerText = state.statusText || 'Đang đăng...';
        const percent = Math.min(100, Math.round(((state.currentIndex || 0) / (state.totalGroups || 1)) * 100));
        progressBar.style.width = `${percent}%`;
      } else {
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
        if (state.statusText) {
          statusText.innerText = state.statusText;
        }
      }
    });
  }, 800);
});
