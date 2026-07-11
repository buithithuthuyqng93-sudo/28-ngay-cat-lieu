# Implementation Plan: Kết nối cổng thanh toán PayOS thật

**Branch**: `002-payos-payment-integration` | **Date**: 2026-07-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-payos-payment-integration/spec.md`

## Summary

Thay luồng thanh toán giả lập (`markAsPaid`) bằng luồng thật với PayOS: học viên bấm
thanh toán trên `/thanh-toan` → server action tạo một `Order` (bảng mới) và gọi PayOS tạo
payment link (VietQR) → hiển thị QR/checkout link → PayOS gửi webhook khi thanh toán xong
→ Route Handler xác thực chữ ký bằng SDK, cập nhật `Order.status = "paid"` và
`User.paidAt` trong một transaction, idempotent theo `Order.id`. Trang `/thanh-toan` đọc
lại order gần nhất của học viên để hiển thị đúng trạng thái (chưa có đơn / đang chờ / đã
hết hạn / đã thanh toán).

## Technical Context

**Language/Version**: TypeScript 5, Node.js 20+ (yêu cầu tối thiểu của `@payos/node`, đã
thỏa mãn vì Vercel + local dev đang dùng Node 24)

**Primary Dependencies**: `@payos/node` (SDK chính thức PayOS) thêm mới; giữ nguyên
Next.js 16, Prisma 7 + `@prisma/adapter-neon`, Tailwind v4, `jose` cho session

**Storage**: PostgreSQL (Neon) qua Prisma — thêm model `Order` mới

**Testing**: Không có test suite tự động trong dự án hiện tại (xác nhận thủ công qua
`npm run build` + curl/browser theo quy ước đã có trong constitution); `quickstart.md`
mô tả kịch bản xác nhận thủ công bằng PayOS sandbox/test webhook

**Target Platform**: Vercel serverless (Node.js runtime) cho cả trang web và webhook
Route Handler

**Project Type**: Web application (Next.js App Router, một project duy nhất — không tách
frontend/backend riêng)

**Performance Goals**: Đạt SC-001 (QR hiển thị trong 3 giây) và SC-002 (mở khóa trong 30
giây sau khi webhook tới) — không có yêu cầu throughput cao vì lưu lượng thanh toán của
sản phẩm nhỏ (một người vận hành, một chương trình)

**Constraints**: Route Handler webhook PHẢI public (không qua session cookie/proxy auth
hiện có) nhưng PHẢI tự xác thực bằng chữ ký PayOS trước khi tin bất kỳ dữ liệu nào trong
payload — đúng Nguyên tắc II của constitution (server là nguồn sự thật, không tin dữ
liệu chưa xác thực)

**Scale/Scope**: Một sản phẩm, một mức giá cố định (299.000đ), quy mô học viên nhỏ/vừa —
không cần hàng đợi (queue) hay xử lý webhook bất đồng bộ ngoài chính request PayOS gửi tới

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. An toàn nội dung y dược**: Không áp dụng — tính năng này không đụng tới nội dung
  y dược. PASS.
- **II. Máy chủ là nguồn sự thật duy nhất cho quyền truy cập**: Thiết kế tuân thủ trực
  tiếp — `paidAt` chỉ được set từ webhook đã xác thực chữ ký, chạy hoàn toàn phía server
  (Route Handler), không có đường nào cho client tự đặt `paidAt`. `lib/progress.ts` giữ
  nguyên, tiếp tục là nguồn sự thật duy nhất cho việc mở khóa bài học. PASS.
- **III. Tiếng Việt trước tiên**: Toàn bộ UI trang `/thanh-toan` (thông báo trạng thái
  đơn hàng, lỗi, nút bấm) viết tiếng Việt, giữ giọng điệu hiện có. PASS.
- **IV. Đơn giản, không trừu tượng hoá sớm**: Thêm đúng một bảng `Order` — đây chính là
  trường hợp constitution nêu rõ là được phép ("cho tới khi có cổng thanh toán thật").
  Không thêm bảng `Payment`/`Transaction` riêng vì `Order` đã đủ biểu diễn vòng đời một
  lần mua. PASS.
- **V. Mobile-first & khả năng tiếp cận**: Trang thanh toán/QR dùng lại layout, component
  UI (`Card`, `Button`) và Tailwind hiện có — không đổi hướng thiết kế. PASS.
- **VI. Minh bạch phần chưa hoàn thiện**: Sau khi hoàn thành, xoá bỏ mọi dấu vết luồng
  demo (`markAsPaid`) và cập nhật lại phần "đang demo" trong `CLAUDE.md`/README nếu có
  nhắc tới. PASS (hành động dọn dẹp nằm trong tasks).
- **Ràng buộc công nghệ — schema Prisma**: Thêm `Order` model MUST đi kèm
  `prisma migrate dev` + `prisma generate` + `npm run build` xanh trước khi commit. Ghi
  vào tasks.

Không có vi phạm nào cần biện minh trong Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-payos-payment-integration/
├── plan.md              # File này
├── research.md          # Phase 0 — quyết định kỹ thuật & API PayOS đã xác minh
├── data-model.md         # Phase 1 — model Order
├── quickstart.md        # Phase 1 — kịch bản xác nhận thủ công đầu-cuối
├── contracts/           # Phase 1 — hợp đồng webhook & server actions
│   ├── payos-webhook.md
│   └── checkout-actions.md
└── tasks.md             # Phase 2 (/speckit-tasks) — chưa tạo ở bước này
```

### Source Code (repository root)

```text
prisma/
├── schema.prisma              # + model Order
└── migrations/                # + migration mới cho Order

lib/
├── payos.ts                   # (mới) khởi tạo PayOS client dùng chung (singleton)
├── actions/
│   ├── payment.ts             # sửa: bỏ markAsPaid, thêm createPayOSOrder action
│   └── (không đổi các action khác)
└── progress.ts                # KHÔNG đổi — vẫn là nguồn sự thật cho mở khóa bài học

app/
├── api/
│   └── webhook/
│       └── payos/
│           └── route.ts       # (mới) Route Handler nhận + xác thực webhook PayOS
└── (app)/
    └── thanh-toan/
        └── page.tsx            # sửa: đọc Order gần nhất, hiển thị đúng trạng thái

.env.example                   # + PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY,
                                #   PAYOS_WEBHOOK_URL (để chạy script đăng ký webhook)
```

**Structure Decision**: Giữ nguyên cấu trúc Next.js App Router một project hiện có
(không tách backend/frontend). Webhook đặt dưới `app/api/webhook/payos/route.ts` vì đây
là Route Handler — quy ước chuẩn của Next.js cho endpoint HTTP thuần (không phải Server
Action) khi caller là bên thứ ba ngoài trình duyệt của học viên.

## Complexity Tracking

*Không có vi phạm Constitution Check cần biện minh — bảng này để trống.*
