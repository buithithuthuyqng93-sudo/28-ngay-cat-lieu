# Contract: Form Lead, tạo đơn hàng SePay, và email xác nhận

## Đọc trạng thái khi tải trang `/thanh-toan` (Server Component)

Thứ tự kiểm tra khi render:

1. `user.paidAt !== null` → hiển thị trạng thái "đã mở khóa" như hiện có, dừng ở đây.
2. Chưa có `Lead` của user (`getLeadForUser(userId)` trả `null`) → hiển thị `LeadForm`,
   **chưa** hiển thị bất kỳ thông tin Order/QR nào (FR-001).
3. Đã có `Lead` → tiếp tục luồng Order như cũ: không có order/order ở trạng thái cuối thì
   hiện nút tạo đơn; có order `pending` còn hạn thì hiện QR; đối chiếu qua SePay
   Transactions API nếu đang `pending` (thay cho `payos.paymentRequests.get()` cũ).

## Server Action: `saveLead`

**Input**: `phone`, `pharmacyName`, `surveyRole` (một trong 4 giá trị enum), `surveyChallenge`.

**Validate**: cả 4 trường bắt buộc không rỗng; `surveyRole` phải thuộc tập giá trị hợp lệ.
Lỗi validate trả về message tiếng Việt tương ứng trường sai (dùng `useActionState`, theo
đúng pattern `LoginForm`/`SignupForm` hiện có).

**Hành động**: `prisma.lead.create({ userId, phone, pharmacyName, surveyRole,
surveyChallenge })`. Nếu đã tồn tại Lead cho user (đụng unique constraint — trường hợp
race hiếm khi bấm gửi 2 lần) → coi như thành công, không báo lỗi (idempotent theo hướng
UX). `revalidatePath("/thanh-toan")`.

## Server Action: `createSepayOrder` (đổi tên/thay thế `createPayOSOrder`)

**Tiền điều kiện** (giữ nguyên tinh thần feature 002, đổi cách tạo QR):
- User đã có `Lead` (nếu chưa, action MUST từ chối — phòng trường hợp gọi trực tiếp bỏ
  qua UI).
- `user.paidAt === null`.
- Không có `Order` nào `pending` và chưa hết hạn — nếu có, trả về chính order đó (FR "không
  tạo trùng", giữ từ feature 002).

**Hành động**:
1. Sinh `orderCode` = `"CATLIEU" + Order.id tương lai` — vì `id` chỉ có sau khi tạo record,
   dùng thứ tự: tạo `orderCode` tạm từ `cuid()` độc lập trước
   (`"CATLIEU" + createId().slice(0, 10)`), dùng chuỗi đó làm cả `orderCode` lẫn một phần
   `id` gợi ý, hoặc đơn giản hơn: tạo record trước với `orderCode` rỗng tạm, update ngay
   sau — chọn phương án **tạo `orderCode` độc lập trước bằng hàm sinh riêng** (không phụ
   thuộc `Order.id`) để tránh 2 bước ghi DB. Cụ thể hoá ở `tasks.md`.
2. Build `qrImageUrl` theo công thức ở `research.md` (nhúng `orderCode` vào `des`).
3. Tạo `Order` với `status = "pending"`, `expiresAt = now + 30 phút`.
4. `revalidatePath("/thanh-toan")`.

Không còn bước gọi API bên ngoài để "tạo link" (khác feature 002) — vì vậy hành động này
không có nhánh lỗi "PayOS API thất bại" nữa, chỉ có lỗi ghi DB thông thường.

## Đối chiếu dự phòng: `syncOrderStatus` (sửa từ feature 002)

Thay lệnh gọi `payos.paymentRequests.get()` bằng gọi SePay Transactions API (xem
`research.md`), tìm giao dịch khớp `orderCode` + `amount`. Tìm thấy → xác nhận thanh toán
qua cùng hàm idempotent `confirmOrderPaid` dùng chung với webhook (bao gồm cả bước gửi
email — hàm `confirmOrderPaid` MUST tự gửi email khi nó thực sự chuyển một order từ
`pending` sang `paid`, bất kể được gọi từ webhook hay từ đường đối chiếu này, để không bị
thiếu email nếu webhook lỡ mất và học viên được xác nhận qua đường dự phòng).

## Email xác nhận

Hàm `sendChallengeConfirmationEmail(user: { email, name })` trong `lib/email.ts`, gọi từ
bên trong `confirmOrderPaid` (không phải ở route webhook riêng) — đảm bảo gửi đúng một lần
dù được kích hoạt từ webhook hay từ đối chiếu dự phòng, vì `confirmOrderPaid` đã tự
idempotent (chỉ chạy nhánh chuyển trạng thái khi order thực sự đang `pending`).

Nội dung tối thiểu: lời chào theo tên, xác nhận đã thanh toán thành công, nút/link
`${APP_URL}/lo-trinh`, giọng điệu tiếng Việt chuyên nghiệp nhất quán với phần còn lại của
sản phẩm (đúng Nguyên tắc III).
