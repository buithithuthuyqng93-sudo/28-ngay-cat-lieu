# 28 Ngày Thử Thách Cắt Liều

Nền tảng học tập dạng microlearning + gamified challenge dành cho dược sĩ, sinh viên ngành Dược và nhân sự nhà thuốc/quầy thuốc — rèn tư duy cắt liều thực chiến qua hành trình 28 ngày.

## Tính năng

- Đăng ký / đăng nhập, phiên đăng nhập bảo mật (session cookie ký bằng JWT)
- Dashboard cá nhân: tiến độ tổng, streak, bài học tiếp theo, thử thách hôm nay, badge
- Lộ trình 28 ngày chia 4 tuần, mở khóa tuần tự
- Trang bài học: mục tiêu, video, tóm tắt, checklist tư vấn, prompt mẫu, thử thách nhỏ
- Nộp thử thách dạng văn bản hoặc link, theo dõi trạng thái đã nộp
- Thư viện tình huống thực chiến theo 6 nhóm bệnh (hô hấp, tiêu hóa, da liễu, phụ khoa, trẻ em, người già/bệnh nền)
- Tài nguyên tải về: checklist, bộ câu hỏi khai thác, mẫu quy trình, mẫu dặn dò
- Trang cộng đồng: link nhóm, bài ghim, lịch live, Q&A, bài nộp nổi bật
- Trang tiến độ cá nhân: ngày hoàn thành, số thử thách đã nộp, streak, badge, gợi ý học tiếp

## Công nghệ

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · Prisma 7 + SQLite (better-sqlite3 adapter) · session tự quản lý bằng `jose` (JWT) theo pattern chính thức của Next.js.

## Bắt đầu

```bash
npm install
cp .env.example .env   # rồi tự sinh SESSION_SECRET, ví dụ: openssl rand -base64 32
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

Tài khoản demo sau khi seed: `demo@capliu28ngay.vn` / `hoctap123`.
