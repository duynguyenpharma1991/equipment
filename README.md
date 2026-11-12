# Equipment — Catalog thiết bị sản xuất dược phẩm

Website + PWA giới thiệu và bán thiết bị cho nhà máy dược phẩm. Song ngữ Việt / Anh, có trang quản trị để CRUD dữ liệu.

- **Frontend:** Next.js 16 (App Router, Cache Components) + React 19 + TypeScript
- **Database / Auth / Storage:** Supabase (project `djqnmpkbvvmyrdjfawqh`)
- **Deploy:** Vercel
- **Giao diện:** tham khảo bố cục hlyj.net (xanh `#007338`, đỏ `#e21a22`, navy `#04326e`)

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `/vi`, `/en` | Trang chủ (banner, danh mục, sản phẩm nổi bật, tin tức) |
| `/{lang}/products`, `/category/[slug]`, `/product/[slug]` | Danh sách, danh mục, chi tiết sản phẩm (thông số, đặc điểm, form báo giá) |
| `/{lang}/news`, `/videos`, `/about`, `/contact`, `/search` | Tin tức, video, giới thiệu, liên hệ, tìm kiếm |
| `/admin` | Quản trị: sản phẩm, danh mục, tin tức, banner, video, yêu cầu báo giá, cài đặt chung |
| `/api/inquiries` | Nhận form báo giá → bảng `inquiries` |
| `public/sw.js`, `src/app/manifest.ts` | PWA (cài đặt được, có trang offline) |

Quản trị được cấu hình hoá trong [src/lib/admin/entities.ts](src/lib/admin/entities.ts): thêm/sửa một trường ở đó là form, danh sách, validate và lưu DB đều cập nhật theo.

## Chạy local

```bash
npm install
cp .env.example .env.local   # điền NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm run dev                  # http://localhost:3000
```

## Thiết lập Supabase (một lần)

Schema, RLS, bucket lưu ảnh nằm trong `supabase/migrations/`. Dữ liệu demo nằm ở `supabase/seed/demo_data.sql`.

```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_..."     # Supabase → Account → Access Tokens (có thể thu hồi sau khi xong)
$env:ADMIN_EMAIL           = "admin@example.com"
$env:ADMIN_PASSWORD        = "mat-khau-manh"
node scripts/setup-supabase.mjs --seed
```

Script chạy migration, nạp dữ liệu demo (`--seed`), tạo tài khoản admin, ghi vào bảng `admins` và tắt đăng ký công khai. Chạy lại nhiều lần vẫn an toàn.

## Bảo mật

- Mọi thao tác ghi đi qua RLS: chỉ user có trong bảng `admins` (`public.is_admin()`) mới ghi được.
- Khách chỉ đọc được bản ghi đã xuất bản / đang hiển thị, và chỉ **thêm** được `inquiries`.
- Ứng dụng **không dùng** service_role key khi chạy. Không đặt key bí mật vào biến `NEXT_PUBLIC_*`.
- Mọi trang/action admin đều tự kiểm tra quyền (`requireAdmin`), không chỉ dựa vào layout.

## Deploy lên Vercel

1. Import repo GitHub `equipment` vào Vercel (Framework: Next.js, mặc định).
2. Đặt Environment Variables (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` = tên miền chính thức (vd `https://ten-mien.vn`)
   - `NEXT_PUBLIC_CONTACT_EMAIL` (tuỳ chọn)
3. Deploy. Nội dung được cache theo tag; sửa trong `/admin` sẽ cập nhật website ngay.

## Thay logo / icon PWA

Sửa SVG trong `scripts/generate-icons.mjs` (hoặc thay bằng logo thật) rồi chạy `node scripts/generate-icons.mjs`.
