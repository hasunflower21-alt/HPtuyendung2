# HƯỚNG DẪN TRIỂN KHAI CLOUDFLARE PAGES (CHUẨN 100%)

## NGUYÊN NHÂN LỖI TRƯỚC ĐÓ:
1. Thư viện Vite 8 & Plugin React yêu cầu Node phiên bản `^20.19.0 || >=22.12.0`. Khi Cloudflare dùng Node `20.18.0`, hệ thống cảnh báo EBADENGINE và thiếu gói biên dịch `binding-linux-x64-gnu`.
2. Hệ thống đã được cấu hình tự động:
   - Thêm gói native `@rolldown/binding-linux-x64-gnu` vào `optionalDependencies`.
   - Cập nhật `.nvmrc` và `.node-version` sang **`22`**.

---

## CẤU HÌNH TRÊN CLOUDFLARE PAGES:

1. **Framework preset**: Chọn `Vite` (hoặc `None`)
2. **Build command**: `npm run build`
3. **Build output directory**: `dist`
4. **Root directory**: **Để trống hoàn toàn**
5. **Environment variables (Biến môi trường)**:
   - **Variable name**: `NODE_VERSION`
   - **Value**: `22` (Chuyển từ `20` thành `22`)

Bấm **Save and Deploy** là hệ thống sẽ tải Node 22 LTS và build thành công ngay lập tức!
