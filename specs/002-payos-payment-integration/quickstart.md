# Quickstart: Xác nhận luồng thanh toán PayOS hoạt động đúng

## Chuẩn bị

1. Cài package: `npm install @payos/node`.
2. Thêm 3 biến môi trường (local `.env` và Vercel Production/Preview/Development):
   `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` (lấy từ kênh thanh toán trên
   PayOS Business, chủ dự án tự thêm — xem ghi chú bảo mật trong tasks, không dán giá trị
   thật vào chat/commit).
3. Đăng ký webhook URL trên PayOS trỏ về `https://<domain-production>/api/webhook/payos`
   (qua `payos.webhooks.confirm()` chạy một lần, hoặc qua dashboard PayOS nếu hỗ trợ).
4. `npx prisma migrate dev` để áp dụng migration `Order` mới, `npx prisma generate`.

## Kịch bản 1 — Tạo đơn hàng và thấy QR (User Story 1, phần đầu)

1. Đăng nhập bằng một tài khoản demo mới (chưa thanh toán) hoặc tài khoản test riêng.
2. Vào `/thanh-toan`, bấm "Xác nhận thanh toán".
3. **Kỳ vọng**: trong vài giây thấy QR/link thanh toán thật của PayOS, số tiền hiển thị
   đúng 299.000đ.
4. Kiểm tra DB: có đúng 1 bản ghi `Order` mới, `status = "pending"`, `userId` đúng tài
   khoản vừa test.

## Kịch bản 2 — Thanh toán thật và tự động mở khóa (User Story 1, đầu-cuối)

1. Từ Kịch bản 1, quét mã QR bằng app ngân hàng thật, chuyển khoản số tiền chính xác
   (dùng số tiền nhỏ nếu PayOS sandbox cho phép test số tiền tuỳ ý — nếu không, dùng môi
   trường PayOS test/sandbox theo hướng dẫn PayOS cung cấp, không dùng tiền thật để test
   trừ khi chủ dự án chủ động muốn xác nhận bằng giao dịch thật).
2. **Kỳ vọng**: trong vòng 30 giây, tài khoản test được mở khóa — vào `/lo-trinh` thấy
   Ngày 2 trở đi không còn khoá do thanh toán.
3. Kiểm tra DB: `Order.status = "paid"`, `User.paidAt` đã được set, đúng thời điểm gần
   với `transactionDateTime` PayOS trả về.

## Kịch bản 3 — Webhook trùng lặp không mở khóa hai lần (FR-005/SC-003)

1. Sau Kịch bản 2, dùng công cụ gọi lại thủ công request webhook giống hệt lần đầu (cùng
   `orderCode`, chữ ký hợp lệ) tới `/api/webhook/payos` — ví dụ bằng `curl` với payload đã
   ghi log lại từ lần thật, hoặc dùng tính năng "gửi lại webhook test" của PayOS dashboard
   nếu có.
2. **Kỳ vọng**: response trả về `200`, không có lỗi, `User.paidAt` không đổi so với lần
   xử lý đầu tiên (không bị ghi đè thời điểm mới).

## Kịch bản 4 — Từ chối webhook giả mạo (FR-004/SC-004)

1. Gọi `POST /api/webhook/payos` với một payload tự chế (chữ ký sai hoặc thiếu trường
   `signature`).
2. **Kỳ vọng**: response trả về `400`, không có bản ghi `Order`/`User` nào bị thay đổi.

## Kịch bản 5 — Đơn hàng hết hạn cho phép tạo lại (User Story 3)

1. Tạo một order, không thanh toán, đợi qua thời điểm `expiresAt` (hoặc set thủ công
   `expiresAt` về quá khứ trong DB test để không phải chờ thật).
2. Vào lại `/thanh-toan`.
3. **Kỳ vọng**: hệ thống báo đơn cũ hết hạn, cho bấm tạo đơn hàng mới; tạo được order thứ
   hai bình thường.

## Kịch bản 6 — Không cho tạo trùng đơn hàng đang chờ (FR-009)

1. Từ Kịch bản 1 (order đang `pending`, còn hạn), bấm "Xác nhận thanh toán" thêm lần nữa
   (ví dụ bấm nhanh 2 lần, hoặc tải lại trang rồi bấm lại).
2. **Kỳ vọng**: không có order thứ hai nào được tạo — hệ thống hiển thị lại đúng order
   đang chờ ban đầu.

## Dọn dẹp sau khi implement xong

- Xoá `markAsPaid` khỏi `lib/actions/payment.ts` và mọi chỗ còn import nó.
- Xác nhận `npm run build` xanh, không còn cảnh báo unused import liên quan.
- Cập nhật `.specify/memory/constitution.md` Nguyên tắc VI nếu còn nhắc "nút thanh toán
  giả lập" như một trạng thái đang tồn tại (nay đã không còn đúng).
