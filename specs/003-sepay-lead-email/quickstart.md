# Quickstart: Xác nhận luồng SePay + Lead + Email hoạt động đúng

## Chuẩn bị (thao tác của chủ dự án, không thể tự động hoá thay)

1. **SePay Dashboard**:
   - Công ty → Cấu hình chung → Cấu trúc mã thanh toán → đặt tiền tố `CATLIEU`.
   - Tích hợp WebHooks → tạo webhook mới trỏ về `https://<domain>/api/webhook/sepay`,
     chọn xác thực **API Key**, tự sinh một key — copy giá trị này.
   - Lấy **API Token** riêng cho Transactions API (mục API trong Dashboard) — quyền đọc
     giao dịch là đủ.
2. **Resend**: tạo tài khoản, thêm domain `duocsithuthuy.com`, thêm các bản ghi DNS Resend
   yêu cầu, đợi trạng thái "Verified". Lấy API Key.
3. Thêm vào `.env` (local) và Vercel (Production/Preview/Development):
   `SEPAY_WEBHOOK_API_KEY`, `SEPAY_USER_API_TOKEN`, `SEPAY_BANK_ACCOUNT=4168686077`,
   `SEPAY_BANK_NAME=MBBank`, `RESEND_API_KEY`, `EMAIL_FROM=noreply@duocsithuthuy.com`.
4. `npm install`, `npx prisma migrate dev`, `npx prisma generate`.

## Kịch bản 1 — Form Lead bắt buộc trước khi thấy QR (US1)

1. Đăng nhập tài khoản chưa thanh toán và chưa từng điền Lead.
2. Vào `/thanh-toan`.
3. **Kỳ vọng**: thấy form yêu cầu SĐT, tên nhà thuốc, 2 câu khảo sát — chưa thấy nút thanh
   toán/QR nào.
4. Bỏ trống một trường, bấm gửi → thấy lỗi rõ ràng, không cho qua.
5. Điền đủ, gửi → chuyển sang giao diện tạo đơn hàng như bình thường.
6. Tải lại trang `/thanh-toan` → **không** thấy lại form Lead (đã lưu).

## Kịch bản 2 — Tạo đơn và thấy QR thật (US1)

1. Từ Kịch bản 1, bấm "Xác nhận thanh toán".
2. **Kỳ vọng**: thấy ảnh QR VietQR thật trong vài giây, đúng số tiền 299.000đ, tài khoản
   nhận đúng MBBank 4168686077.
3. Kiểm tra DB: một `Order` mới, `status = "pending"`, `orderCode` bắt đầu bằng `CATLIEU`.

## Kịch bản 3 — Thanh toán thật, tự động mở khóa + nhận email (US1 + US2)

1. Quét mã QR bằng app ngân hàng thật, chuyển khoản đúng số tiền (khuyến nghị test với số
   tiền nhỏ trước nếu muốn xác nhận cơ chế trước khi dùng số tiền thật 299.000đ, miễn nội
   dung chuyển khoản vẫn giữ đúng mã đơn hàng QR đã sinh).
2. **Kỳ vọng**: trong vòng 2 phút, tài khoản được mở khóa — `/lo-trinh` không còn khoá do
   thanh toán.
3. Kiểm tra hộp thư email của tài khoản test: nhận được email xác nhận trong vòng 5 phút,
   có link `${APP_URL}/lo-trinh` hoạt động đúng.
4. Kiểm tra DB: `Order.status = "paid"`, `User.paidAt` đã set.

## Kịch bản 4 — Webhook trùng lặp không mở khóa/gửi email hai lần (FR-007)

1. Sau Kịch bản 3, gọi lại thủ công cùng payload webhook (cùng `code`, cùng API Key hợp
   lệ) tới `/api/webhook/sepay`.
2. **Kỳ vọng**: trả `200`, `User.paidAt` không đổi, không có email thứ hai được gửi.

## Kịch bản 5 — Từ chối webhook không có API Key hợp lệ (FR-006)

1. Gọi `POST /api/webhook/sepay` không có header `Authorization` hoặc sai giá trị.
2. **Kỳ vọng**: trả `401`, không có `Order`/`User` nào bị thay đổi.

## Kịch bản 6 — Đơn hết hạn cho tạo lại, không bắt điền lại Lead (US3)

1. Tạo một order, không thanh toán, set thủ công `expiresAt` về quá khứ trong DB test (hoặc
   đợi thật 30 phút).
2. Vào lại `/thanh-toan`.
3. **Kỳ vọng**: hệ thống báo đơn cũ hết hạn, cho tạo đơn mới — **không** hiện lại form
   Lead (đã có từ trước).

## Kịch bản 7 — Đối chiếu dự phòng khi webhook bị trễ/mất (US3, FR-011)

1. Tạo order, thanh toán thật, nhưng giả lập webhook không tới (ví dụ tạm thời chưa đăng
   ký webhook URL trên SePay Dashboard trong lúc test).
2. Tải lại `/thanh-toan`.
3. **Kỳ vọng**: hệ thống tự gọi SePay Transactions API, phát hiện giao dịch đã khớp, tự
   chuyển `Order.status = "paid"` và mở khóa — không cần webhook.

## Dọn dẹp sau khi implement xong

- Xoá `@payos/node` khỏi `package.json`, xoá `lib/payos.ts`,
  `app/api/webhook/payos/`, `scripts/register-payos-webhook.ts`.
- Xác nhận `npm run build` xanh, không còn import nào trỏ tới PayOS.
- Cập nhật `README.md` phần "Kết nối thanh toán" sang hướng dẫn SePay + Resend, thay cho
  hướng dẫn PayOS cũ.
