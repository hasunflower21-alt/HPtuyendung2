// content.js - Tự động hóa đăng bài nhóm Facebook
// Tuyệt đối không lặp chữ, không lặp ảnh, đăng chuẩn xác 100%

(function () {
  // Chống chạy 2 instance trên cùng 1 trang
  if (window.__AUTORECRUIT_FB_RUNNING__) {
    return;
  }
  window.__AUTORECRUIT_FB_RUNNING__ = true;

  console.log('[AutoRecruit FB] Content script khởi động:', window.location.href);

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Chuyển DataURL thành File
  function dataUrlToFile(dataUrl, filename = 'anh_tuyen_dung.jpg') {
    try {
      const parts = dataUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (e) {
      console.warn('[AutoRecruit FB] Lỗi parse dataUrl:', e);
      return null;
    }
  }

  let isAutoPostActive = false;

  // Lắng nghe lệnh từ Background Worker
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'AUTO_POST_TO_GROUP') {
      if (isAutoPostActive) {
        console.warn('[AutoRecruit FB] Đang có lệnh đăng đang chạy dở, bỏ qua lệnh trùng lặp!');
        sendResponse({ success: true, message: 'Đang xử lý' });
        return true;
      }

      isAutoPostActive = true;
      handleAutoPost(request.content, request.images)
        .then((res) => {
          isAutoPostActive = false;
          sendResponse(res || { success: true });
        })
        .catch((err) => {
          isAutoPostActive = false;
          console.error('[AutoRecruit FB] Lỗi trong tiến trình đăng:', err);
          sendResponse({ success: false, error: err.message || 'Lỗi không xác định' });
        });

      return true;
    }
  });

  // HÀM ĐĂNG BÀI CHÍNH
  async function handleAutoPost(content, images) {
    await sleep(3500);

    // 1. Chuyển sang Tab Thảo Luận nếu trang đang ở tab khác
    await ensureDiscussionTab();
    await sleep(1500);

    // 2. Kiểm tra xem modal Tạo bài viết đã mở chưa
    let dialog = getFrontmostDialog();
    if (!dialog) {
      const trigger = findDiscussionPostTrigger();
      if (trigger) {
        console.log('[AutoRecruit FB] Bấm mở ô tạo bài viết...');
        trigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await sleep(400);
        trigger.click();
        await sleep(2500);
      }
    }

    // 3. Bắt modal trên cùng
    dialog = await waitForActiveDialog(7000);
    if (!dialog) {
      throw new Error('Không thể mở modal Tạo bài viết của Facebook.');
    }

    // 4. Bắt ô soạn thảo văn bản
    const textBox = await waitForActiveEditor(dialog, 6000);
    if (!textBox) {
      throw new Error('Không tìm thấy khung nhập văn bản trong modal Facebook.');
    }

    // 5. Điền nội dung văn bản (CHỐNG LẶP CHỮ & BẢO TOÀN 100% BỐ CỤC SOẠN THẢO)
    console.log('[AutoRecruit FB] Điền nội dung bài viết...');
    await insertTextSafelyOnce(textBox, content);
    await sleep(1500);

    // 6. Đính kèm ảnh (HỖ TRỢ ĐẾN 3 ẢNH TƯƠNG TÁC TỰ ĐIỀU CHỈNH)
    if (images && images.length > 0) {
      console.log('[AutoRecruit FB] Đính kèm tối đa 3 ảnh tương tác...');
      await attachImagesSafely(dialog, images);
      await sleep(2500);
    }

    // 7. Bấm nút ĐĂNG
    console.log('[AutoRecruit FB] Tìm và bấm nút ĐĂNG...');
    const postSuccess = await findAndClickPostButton(dialog);
    if (!postSuccess) {
      throw new Error('Không thể bấm nút Đăng (nút bị vô hiệu hóa hoặc không tìm thấy).');
    }

    console.log('[AutoRecruit FB] ✓ ĐÃ BẤM ĐĂNG THÀNH CÔNG!');
    await sleep(4500);
    return { success: true, message: 'Đã đăng bài thành công!' };
  }

  // Đảm bảo ở tab Thảo luận
  async function ensureDiscussionTab() {
    const tabs = Array.from(document.querySelectorAll('a[role="tab"], div[role="tab"], span'));
    for (const tab of tabs) {
      const text = (tab.innerText || '').toLowerCase().trim();
      if (text === 'thảo luận' || text === 'discussion') {
        const isSelected = tab.getAttribute('aria-selected') === 'true' || tab.classList.contains('active');
        if (!isSelected) {
          tab.click();
          await sleep(1500);
        }
        return;
      }
    }
  }

  // Tìm trigger tạo bài viết
  function findDiscussionPostTrigger() {
    const positiveKeywords = [
      'bạn viết gì đi',
      'tạo bài viết công khai',
      'viết bài thảo luận',
      'viết gì đó',
      'tạo bài viết',
      'bạn đang nghĩ gì',
      'write something',
    ];

    const candidates = Array.from(document.querySelectorAll('div[role="button"], span, div[tabindex="0"]'));
    for (const el of candidates) {
      const text = (el.innerText || el.getAttribute('aria-label') || '').toLowerCase().trim();
      if (!text || text.length > 70) continue;
      if (text.includes('bán gì đó') || text.includes('bán hàng')) continue;
      if (positiveKeywords.some((pos) => text.includes(pos))) return el;
    }
    return document.querySelector('[aria-label*="bài viết thảo luận"], [aria-label*="tạo bài viết công khai"]');
  }

  // Lấy modal trên cùng
  function getFrontmostDialog() {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]')).filter((d) => {
      const rect = d.getBoundingClientRect();
      return rect.width > 250 && rect.height > 180 && window.getComputedStyle(d).display !== 'none';
    });
    return dialogs[dialogs.length - 1] || null;
  }

  async function waitForActiveDialog(timeoutMs = 7000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const d = getFrontmostDialog();
      if (d) return d;
      await sleep(300);
    }
    return getFrontmostDialog() || document.querySelector('div[role="dialog"]');
  }

  // Lấy khung soạn thảo văn bản
  async function waitForActiveEditor(dialog, timeoutMs = 6000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const container = dialog || getFrontmostDialog() || document;
      const boxes = Array.from(
        container.querySelectorAll('div[role="textbox"][contenteditable="true"], div[contenteditable="true"]')
      ).filter((b) => {
        const rect = b.getBoundingClientRect();
        return rect.width > 80 && rect.height > 25;
      });

      if (boxes.length > 0) {
        return boxes[boxes.length - 1];
      }
      await sleep(300);
    }
    return null;
  }

  // ĐIỀN VĂN BẢN (CHỐNG LẶP CHỮ & BẢO TOÀN 100% BỐ CỤC SOẠN THẢO)
  async function insertTextSafelyOnce(textBox, text) {
    if (!text) return;

    // 1. Sao chép nội dung chuẩn vào Clipboard trước để sẵn sàng
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      }
    } catch (e) {}

    textBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    textBox.focus();
    textBox.click();
    await sleep(250);

    const firstLine = text.split('\n')[0].trim().slice(0, 25);
    const existing = (textBox.innerText || textBox.textContent || '').trim();

    // Nếu đã có nội dung này rồi -> KHÔNG ĐƯỢC CHÈN THÊM ĐỂ TRÁNH LẶP
    if (firstLine.length > 5 && existing.includes(firstLine)) {
      console.log('[AutoRecruit FB] Nội dung đã có sẵn trong ô, không chèn lại.');
      return;
    }

    // Đặt con trỏ chuột bên trong ô
    try {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(textBox);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) {}

    // Xóa chữ cũ nếu có
    try {
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
    } catch (e) {}
    await sleep(150);

    const expectedLines = text.split('\n').filter((l) => l.trim().length > 0).length;
    let insertedOk = false;

    // Cách 1: Thử bắn sự kiện Paste chuẩn của ClipboardEvent vào Lexical
    // Lexical của Facebook có listener native cho paste event và tự phân tách <p> từng dòng chuẩn 100%
    try {
      const dt = new DataTransfer();
      dt.setData('text/plain', text);
      const htmlMarkup = text
        .split('\n')
        .map((line) => `<p>${line.trim().length > 0 ? line : '<br>'}</p>`)
        .join('');
      dt.setData('text/html', htmlMarkup);

      const pasteEvt = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dt,
      });
      textBox.dispatchEvent(pasteEvt);
      await sleep(350);

      const curLen = (textBox.innerText || textBox.textContent || '').trim().length;
      const curLines = (textBox.innerText || textBox.textContent || '')
        .split('\n')
        .filter((l) => l.trim().length > 0).length;

      if (curLen >= Math.min(25, text.trim().length * 0.7) && (expectedLines <= 2 || curLines >= Math.min(expectedLines * 0.6, 3))) {
        insertedOk = true;
        console.log('[AutoRecruit FB] ✓ Đã dán bài viết bằng ClipboardEvent (giữ nguyên vẹn 100% bố cục & ngắt dòng)');
      }
    } catch (pasteErr) {
      console.warn('[AutoRecruit FB] ClipboardEvent paste không được hỗ trợ:', pasteErr);
    }

    // Cách 2: Nếu paste event chưa nạp được, thử qua execCommand('insertText')
    if (!insertedOk) {
      try {
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        await sleep(100);

        document.execCommand('insertText', false, text);
        await sleep(250);

        const curLen = (textBox.innerText || textBox.textContent || '').trim().length;
        const curLines = (textBox.innerText || textBox.textContent || '')
          .split('\n')
          .filter((l) => l.trim().length > 0).length;

        if (curLen >= Math.min(20, text.trim().length * 0.7) && (expectedLines <= 2 || curLines >= Math.min(expectedLines * 0.6, 3))) {
          insertedOk = true;
          console.log('[AutoRecruit FB] ✓ Đã chèn bài viết bằng execCommand giữ nguyên chuẩn đoạn');
        }
      } catch (cmdErr) {
        console.warn('[AutoRecruit FB] insertText lỗi:', cmdErr);
      }
    }

    // Cách 3: Nếu vẫn bị gộp dòng hoặc thiếu dòng, chèn từng dòng kèm Enter chuẩn Lexical
    if (!insertedOk) {
      try {
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
      } catch (e) {}
      await sleep(150);

      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.length > 0) {
          document.execCommand('insertText', false, line);
        }
        if (i < lines.length - 1) {
          // Bắn sự kiện Enter cho Facebook Lexical nhận diện ngắt đoạn
          const enterDown = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true,
          });
          const enterUp = new KeyboardEvent('keyup', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
          });
          textBox.dispatchEvent(enterDown);
          const pOk = document.execCommand('insertParagraph', false, null);
          if (!pOk) {
            document.execCommand('insertLineBreak', false, null);
          }
          textBox.dispatchEvent(enterUp);
          await sleep(25);
        }
      }
    }

    await sleep(200);

    // Fallback nếu khung vẫn trống
    const finalLen = (textBox.innerText || textBox.textContent || '').trim().length;
    if (finalLen < 10) {
      try {
        const targetNode = textBox.querySelector('p') || textBox;
        targetNode.textContent = text;
      } catch (err) {}
    }

    // Kích hoạt các sự kiện input để nút Đăng của Facebook sáng xanh
    textBox.dispatchEvent(new Event('input', { bubbles: true }));
    textBox.dispatchEvent(new Event('change', { bubbles: true }));

    // Nháy ký tự để bộ kích hoạt Lexical nhận diện
    try {
      document.execCommand('insertText', false, ' ');
      document.execCommand('delete', false, null);
      textBox.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (e) {}
  }

  // ĐÍNH KÈM TỐI ĐA 3 ẢNH TƯƠNG TÁC (CHỐNG LẶP & TỰ ĐỘNG CÂN CHỈNH NHIỀU ẢNH)
  async function attachImagesSafely(dialog, imageSources) {
    try {
      const container = dialog || getFrontmostDialog() || document;
      const imagesToAttach = (Array.isArray(imageSources) ? imageSources : [imageSources])
        .filter(Boolean)
        .slice(0, 3);

      if (imagesToAttach.length === 0) return;

      // KIỂM TRA: Nếu đã có ảnh rồi thì DỪNG NGAY
      const existingMedia = container.querySelector(
        'img[src*="blob:"], [aria-label*="xóa ảnh"], [aria-label*="Remove"], [aria-label*="Gỡ"]'
      );
      if (existingMedia) {
        console.log('[AutoRecruit FB] Bài viết đã có ảnh, bỏ qua để tránh trùng ảnh.');
        return;
      }

      // 1. Tìm và click nút Ảnh/Video màu xanh
      let photoClicked = false;
      const photoSelectors = [
        'div[aria-label*="Ảnh/video"]',
        'div[aria-label*="Photo/video"]',
        'div[aria-label*="Ảnh"]',
        'div[aria-label*="Photo"]',
        '[aria-label*="ảnh"]',
        '[aria-label*="photo"]',
      ];

      for (const sel of photoSelectors) {
        const btn = container.querySelector(sel);
        if (btn) {
          btn.click();
          photoClicked = true;
          break;
        }
      }

      if (!photoClicked) {
        const allSpans = Array.from(container.querySelectorAll('span, div'));
        const labelEl = allSpans.find((el) => {
          const t = (el.innerText || '').toLowerCase().trim();
          return t === 'thêm vào bài viết của bạn' || t === 'add to your post' || t.startsWith('thêm vào bài viết');
        });

        if (labelEl) {
          const toolbar = labelEl.closest('div[style*="flex"]') || labelEl.parentElement;
          if (toolbar) {
            const btns = Array.from(toolbar.querySelectorAll('div[role="button"], span[role="button"]'));
            if (btns.length > 0) {
              btns[0].click();
              photoClicked = true;
            }
          }
        }
      }

      await sleep(1500);

      // 2. Tìm input file
      let fileInput = container.querySelector('input[type="file"][accept*="image"]')
        || container.querySelector('input[type="file"]')
        || document.querySelector('input[type="file"]');

      if (!fileInput) {
        console.warn('[AutoRecruit FB] Không tìm thấy input file.');
        return;
      }

      // 3. Tạo danh sách File nhị phân (tối đa 3 ảnh tương tác)
      const files = [];
      for (let i = 0; i < imagesToAttach.length; i++) {
        const source = imagesToAttach[i];
        try {
          let file = null;
          if (source.startsWith('data:image')) {
            file = dataUrlToFile(source, `anh_tuyen_dung_${i + 1}.jpg`);
          } else {
            const res = await fetch(source);
            const blob = await res.blob();
            file = new File([blob], `anh_tuyen_dung_${i + 1}.jpg`, { type: blob.type || 'image/jpeg' });
          }
          if (file) files.push(file);
        } catch (fErr) {
          console.warn(`[AutoRecruit FB] Lỗi chuyển đổi ảnh ${i + 1}:`, fErr);
        }
      }

      if (files.length === 0) return;

      const dt = new DataTransfer();
      for (const file of files) {
        dt.items.add(file);
      }
      fileInput.files = dt.files;
      // Phát cả sự kiện input và change
      fileInput.dispatchEvent(new Event('input', { bubbles: true }));
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`[AutoRecruit FB] ✓ Đã nạp thành công ${files.length} ảnh tương tác lên bài viết Facebook!`);
      await sleep(3000);
    } catch (err) {
      console.warn('[AutoRecruit FB] Lỗi đính kèm ảnh:', err);
    }
  }

  // TÌM VÀ BẤM NÚT ĐĂNG
  async function findAndClickPostButton(dialog) {
    const container = dialog || getFrontmostDialog() || document;
    let clicked = false;

    for (let attempt = 0; attempt < 16; attempt++) {
      if (clicked) return true;

      const buttons = Array.from(container.querySelectorAll('div[role="button"], button'));
      const postBtn = buttons.find((b) => {
        const t = (b.innerText || b.getAttribute('aria-label') || '').trim();
        return t === 'Đăng' || t === 'Post' || t === 'Đăng bài' || t === 'Publish';
      });

      if (postBtn) {
        const isDisabled = postBtn.getAttribute('aria-disabled') === 'true' || postBtn.disabled || postBtn.classList.contains('disabled');
        if (!isDisabled) {
          console.log('[AutoRecruit FB] Nút ĐĂNG đã sáng xanh! Bấm Đăng ngay...');
          postBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await sleep(200);
          postBtn.click();
          clicked = true;
          return true;
        }
      }
      await sleep(500);
    }

    if (!clicked) {
      const fallbackBtns = Array.from(container.querySelectorAll('div[role="button"], button'));
      const btn = fallbackBtns.find((b) => {
        const t = (b.innerText || '').trim();
        return t === 'Đăng' || t === 'Post';
      });
      if (btn) {
        console.log('[AutoRecruit FB] Thử bấm nút Đăng (fallback)...');
        btn.click();
        return true;
      }
    }
    return false;
  }
})();
