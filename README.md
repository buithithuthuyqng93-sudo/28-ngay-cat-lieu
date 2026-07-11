# 28 Ngày Thử Thách Cắt Liều

Nền tảng học tập dạng microlearning + gamified challenge dành cho dược sĩ, sinh viên ngành Dược và nhân sự nhà thuốc/quầy thuốc — rèn tư duy cắt liều thực chiến qua hành trình 28 ngày.

Live: https://28-ngay-cat-lieu.vercel.app

## Tính năng

- Học thử miễn phí bài Ngày 1 không cần đăng nhập (`/hoc-thu`); trước khi thanh toán cần điền form thu thập lead (SĐT, tên nhà thuốc, khảo sát); thanh toán qua SePay (chuyển khoản VietQR, tự động xác nhận qua webhook) để mở khóa toàn bộ chương trình, tự động gửi email xác nhận qua Resend
- Đăng ký / đăng nhập, phiên đăng nhập bảo mật (session cookie ký bằng JWT)
- Dashboard cá nhân: tiến độ tổng, streak, bài học tiếp theo, thử thách hôm nay, badge
- Lộ trình 28 ngày chia 4 tuần, mở khóa tuần tự theo nhịp (theo lịch hoặc theo thời điểm thanh toán)
- Trang bài học: mục tiêu, video, tóm tắt, checklist tư vấn, prompt mẫu, thử thách nhỏ
- Nộp thử thách dạng văn bản hoặc link, theo dõi trạng thái đã nộp
- Thư viện tình huống thực chiến theo 6 nhóm bệnh (hô hấp, tiêu hóa, da liễu, phụ khoa, trẻ em, người già/bệnh nền)
- Tài nguyên tải về: checklist, bộ câu hỏi khai thác, mẫu quy trình, mẫu dặn dò
- Trang cộng đồng: link nhóm, bài ghim, lịch live, Q&A, bài nộp nổi bật
- Trang tiến độ cá nhân: ngày hoàn thành, số thử thách đã nộp, streak, badge, gợi ý học tiếp
- Landing page có animation (scroll reveal, đếm số, hiệu ứng nổi) bằng `motion`

## Công nghệ

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · Prisma 7 + PostgreSQL (Neon, qua `@prisma/adapter-neon`) · session tự quản lý bằng `jose` (JWT) theo pattern chính thức của Next.js · deploy trên Vercel.

## Bắt đầu

```bash
npm install
cp .env.example .env   # điền DATABASE_URL (Postgres), tự sinh SESSION_SECRET (openssl rand -base64 32),
                        # và điền SEPAY_*/RESEND_API_KEY/EMAIL_FROM (xem bên dưới)
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

Tài khoản demo sau khi seed: `demo@capliu28ngay.vn` / `hoctap123` (đã ở trạng thái đã
thanh toán để xem đúng trải nghiệm học viên đã mua).

### Kết nối thanh toán SePay + email Resend (production)

1. **SePay** (my.sepay.vn), tài khoản ngân hàng đã kết nối:
   - Công ty → Cấu hình chung → Cấu trúc mã thanh toán → đặt tiền tố `CATLIEU`.
   - Tích hợp WebHooks → tạo webhook trỏ về `https://<domain>/api/webhook/sepay`, xác
     thực kiểu **API Key** → lấy giá trị cho `SEPAY_WEBHOOK_API_KEY`.
   - API (đọc giao dịch) → lấy token cho `SEPAY_USER_API_TOKEN`.
   - `SEPAY_BANK_ACCOUNT`/`SEPAY_BANK_NAME` là số tài khoản/tên ngân hàng đã kết nối
     (không phải secret, hiển thị công khai trên QR).
2. **Resend** (resend.com): thêm domain gửi email, xác minh DNS, lấy `RESEND_API_KEY`,
   đặt `EMAIL_FROM` trên domain đã xác minh.
3. Thêm toàn bộ biến trên vào Vercel (Production/Preview/Development) — không dán giá trị
   thật vào commit hay chat.
4. Chi tiết luồng, các trạng thái đơn hàng, và 7 kịch bản kiểm thử thủ công xem
   `specs/003-sepay-lead-email/quickstart.md`.

## Phát triển tính năng mới / sửa lỗi

Dự án dùng [Spec Kit](https://github.com/github/spec-kit) để đặc tả trước khi code, thay
vì để yêu cầu chỉ nằm trong lịch sử chat. Xem `CLAUDE.md` để biết quy trình chi tiết —
tóm tắt:

1. Đọc `.specify/memory/constitution.md` (nguyên tắc bắt buộc của dự án).
2. Đọc `specs/001-28-day-challenge-platform/spec.md` để hiểu phạm vi hiện tại.
3. Với tính năng mới không tầm thường: dùng skill `speckit-specify` để viết
   `specs/00N-ten-tinh-nang/spec.md` trước khi implement.
