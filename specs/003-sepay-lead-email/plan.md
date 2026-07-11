# Implementation Plan: Chuyển sang SePay, thu thập lead và email xác nhận

**Branch**: `003-sepay-lead-email` | **Date**: 2026-07-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-sepay-lead-email/spec.md`

## Summary

Gỡ bỏ toàn bộ tích hợp PayOS (feature 002), thay bằng SePay: hệ thống tự sinh ảnh QR
VietQR (không gọi API tạo link), Order lưu `orderCode` tự sinh nhúng vào nội dung chuyển
khoản, webhook `app/api/webhook/sepay/route.ts` xác thực bằng API Key tĩnh trong header,
đối chiếu dự phòng qua SePay Transactions API khi học viên quay lại trang. Thêm bảng
`Lead` thu thập số điện thoại/tên nhà thuốc/khảo sát ngay trước bước hiện QR. Sau khi
webhook xác nhận thanh toán, gửi email qua Resend — lỗi gửi email không được chặn việc mở
khóa.

## Technical Context

**Language/Version**: TypeScript 5, Node.js 20+ (không đổi)

**Primary Dependencies**: Thêm `resend`; gỡ `@payos/node`. Giữ nguyên Next.js 16, Prisma 7
+ `@prisma/adapter-neon`, Tailwind v4

**Storage**: PostgreSQL (Neon) qua Prisma — sửa model `Order` (đổi trường theo SePay),
thêm model `Lead`

**Testing**: Không có test suite tự động (như feature 002) — `quickstart.md` là căn cứ
xác nhận thủ công

**Target Platform**: Vercel serverless (Node.js runtime)

**Project Type**: Web application (Next.js App Router, một project)

**Performance Goals**: Đạt SC-001 (QR trong 1 phút) và SC-002 (mở khóa trong 2 phút sau
khi webhook/đối chiếu tới) — quy mô nhỏ, không cần queue/throughput cao

**Constraints**:
- Webhook SePay PHẢI public (ngoài `proxy.ts`) nhưng PHẢI tự xác thực bằng API Key trước
  khi tin payload — đúng Nguyên tắc II constitution.
- SePay không có API "tạo link thanh toán" và không trả `expiresAt` — hệ thống PHẢI tự
  quản lý thời hạn đơn hàng (30 phút, chọn ở research.md).
- SePay không đẩy sự kiện huỷ giao dịch (giống nhận định ở feature 002 cho PayOS, nhưng
  ở đây thậm chí không có khái niệm "huỷ QR" vì QR không phải tạo qua API có trạng thái
  — chỉ có "hết hạn tự quy định" hoặc "đã có giao dịch khớp").
- Gửi email KHÔNG được nằm trên đường găng của việc mở khóa — lỗi Resend chỉ log, webhook
  vẫn trả 200 và tài khoản vẫn đã mở khóa.

**Scale/Scope**: Một sản phẩm, một mức giá cố định, quy mô nhỏ/vừa — không cần hạ tầng
polling/queue riêng ngoài chính webhook và lần đối chiếu khi tải trang.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. An toàn nội dung y dược**: Không áp dụng. PASS.
- **II. Máy chủ là nguồn sự thật duy nhất cho quyền truy cập**: `paidAt` chỉ được set từ
  webhook đã xác thực API Key hoặc từ lần đối chiếu server-to-server qua SePay Transactions
  API (dùng token riêng của hệ thống, không phải dữ liệu client cung cấp) — không có
  đường nào cho client tự đặt `paidAt`. PASS.
- **III. Tiếng Việt trước tiên**: Form lead, thông báo trạng thái đơn hàng, email xác
  nhận — toàn bộ tiếng Việt, giữ giọng điệu hiện có. PASS.
- **IV. Đơn giản, không trừu tượng hoá sớm**: Sửa lại `Order` hiện có thay vì tạo bảng
  song song cho SePay; thêm đúng một bảng `Lead` mới vì đây là nhu cầu dữ liệu thực sự
  khác biệt (thông tin liên hệ, không phải trạng thái đơn hàng). Không thêm bảng
  "EmailLog" hay hàng đợi riêng cho việc gửi email — gọi Resend trực tiếp trong webhook,
  đủ cho quy mô hiện tại. PASS.
- **V. Mobile-first & khả năng tiếp cận**: Form lead dùng lại component input/Card/Button
  hiện có, không đổi hướng thiết kế. PASS.
- **VI. Minh bạch phần chưa hoàn thiện**: Sau khi hoàn thành, không còn luồng PayOS nào
  sót lại gây hiểu nhầm là vẫn đang dùng song song. PASS.
- **Ràng buộc công nghệ — schema Prisma**: Sửa `Order` + thêm `Lead` MUST đi kèm
  `prisma migrate dev` + `prisma generate` + `npm run build` xanh trước khi commit.

Không có vi phạm nào cần biện minh trong Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/003-sepay-lead-email/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── sepay-webhook.md
│   └── lead-and-checkout-actions.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
prisma/
├── schema.prisma              # Sửa Order (bỏ field kiểu PayOS, thêm orderCode/qrImageUrl),
│                               # thêm model Lead
└── migrations/                # + migration mới

lib/
├── sepay.ts                    # (mới) helper gọi SePay Transactions API + sinh QR URL
├── payos.ts                    # XOÁ
├── actions/
│   ├── payment.ts              # sửa: tạo Order kiểu SePay thay vì gọi PayOS
│   └── lead.ts                 # (mới) server action lưu Lead
├── leads.ts                     # (mới) getLeadForUser(userId)
├── email.ts                     # (mới) sendChallengeConfirmationEmail(user)
└── orders.ts                   # sửa: syncOrderStatus dùng SePay Transactions API

app/
├── api/
│   └── webhook/
│       ├── sepay/
│       │   └── route.ts        # (mới) nhận + xác thực webhook SePay
│       └── payos/               # XOÁ
└── (app)/
    └── thanh-toan/
        └── page.tsx              # sửa: gate qua LeadForm nếu chưa có Lead, rồi mới tới
                                    #      bước Order/QR như cũ

components/
└── payment/
    ├── CreateOrderButton.tsx     # giữ, chỉnh nhẹ nếu cần
    └── LeadForm.tsx              # (mới) form thu thập SĐT/tên nhà thuốc/khảo sát

scripts/
└── register-payos-webhook.ts   # XOÁ (không còn cần đăng ký webhook qua API cho SePay —
                                  # SePay cấu hình webhook URL qua Dashboard, không qua SDK)

.env.example                     # + SEPAY_*, RESEND_API_KEY, EMAIL_FROM; - PAYOS_*
```

**Structure Decision**: Giữ cấu trúc Next.js App Router một project hiện có. Webhook SePay
thay thế hoàn toàn vị trí webhook PayOS cũ (xoá thư mục cũ, không giữ song song).

## Complexity Tracking

*Không có vi phạm Constitution Check cần biện minh — bảng này để trống.*
