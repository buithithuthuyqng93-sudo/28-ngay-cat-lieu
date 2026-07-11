# Contract: Trang `/thanh-toan` và server actions liên quan

## Đọc trạng thái khi tải trang (Server Component, không phải action)

Trang `/thanh-toan` (server component, đã có sẵn, yêu cầu đăng nhập qua `proxy.ts`) khi
render MUST:

1. Lấy `user` hiện tại (đã có qua `getCurrentUser()`).
2. Nếu `user.paidAt !== null` → hiển thị trạng thái "đã mở khóa toàn bộ chương trình"
   (UI hiện có), KHÔNG truy vấn/gọi PayOS gì thêm.
3. Nếu chưa thanh toán → tìm `Order` gần nhất của user (`findFirst` sắp `createdAt desc`).
   - Không có order nào, hoặc order gần nhất ở trạng thái cuối (`paid`/`cancelled`/
     `expired`) → hiển thị nút "Xác nhận thanh toán" để tạo order mới (như hiện tại,
     nhưng gọi action thật thay vì `markAsPaid`).
   - Có order `pending` và chưa quá `expiresAt` → hiển thị lại đúng QR/`checkoutUrl` của
     order đó kèm trạng thái "đang chờ thanh toán", KHÔNG tạo order mới.
   - Có order `pending` nhưng đã quá `expiresAt` → coi như hết hạn, hiển thị thông báo và
     nút tạo order mới (đồng thời cập nhật `status = "expired"` cho order đó, không bắt
     buộc chặn nếu việc cập nhật fail — đây chỉ là dọn dẹp hiển thị).

## Server Action: `createPayOSOrder`

Thay thế hoàn toàn `markAsPaid` (xoá khỏi `lib/actions/payment.ts`).

**Input**: không cần tham số — lấy user từ session (`verifySession()`).

**Tiền điều kiện (MUST kiểm tra, trả lỗi rõ ràng nếu vi phạm — không throw không rõ lý
do)**:
- User đã đăng nhập (đã đảm bảo bởi `verifySession()`).
- `user.paidAt === null` (FR-010) — nếu không, trả lỗi "đã thanh toán rồi", không tạo
  order.
- Không tồn tại `Order` nào của user đang ở trạng thái `pending` và chưa hết hạn
  (FR-009) — nếu có, trả về chính order đó thay vì tạo mới (idempotent theo hướng UX,
  không phải lỗi).

**Hành động**:
1. Sinh `payosOrderCode` (số nguyên, `Date.now()`).
2. Gọi `payos.paymentRequests.create({ orderCode, amount: 299000, description, returnUrl,
   cancelUrl })`.
3. Tạo bản ghi `Order` với `status = "pending"` và các field trả về từ PayOS
   (`checkoutUrl`, `qrCode`, `paymentLinkId`, `expiresAt` nếu có).
4. `revalidatePath("/thanh-toan")`.

**Lỗi cần xử lý**: PayOS API lỗi/timeout khi tạo link → KHÔNG tạo `Order` (hoặc tạo rồi
đánh dấu hỏng — chọn phương án không tạo record khi PayOS call thất bại, đơn giản hơn),
trả thông báo tiếng Việt thân thiện để học viên thử lại, không để trang trắng/crash.

## returnUrl / cancelUrl

- `returnUrl`: đưa học viên quay lại `/thanh-toan?status=success` — trang vẫn tự đọc lại
  trạng thái thật từ DB (không tin query param để quyết định mở khóa hay không, đúng
  Nguyên tắc II) — query param chỉ dùng để hiển thị thông điệp "đang xác nhận..." trong
  lúc chờ webhook tới (webhook thường tới trước hoặc gần như đồng thời với lúc học viên
  được redirect về).
- `cancelUrl`: đưa học viên về `/thanh-toan?status=cancelled` — trang hiển thị thông báo
  đã huỷ và cho thử lại; không tự ý set `Order.status = "cancelled"` chỉ vì query param
  này (vẫn phải chờ xác nhận thật từ PayOS phía webhook hoặc lần đọc lại trạng thái order
  tiếp theo), tránh trường hợp học viên sửa URL tay để đánh lừa UI.
