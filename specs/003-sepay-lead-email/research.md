# Phase 0 Research: SePay + Lead + Resend

## Decision: Tự sinh ảnh QR VietQR bằng URL công khai, không gọi API PayOS-style

SePay không có endpoint "tạo payment link" như PayOS. Cách chuẩn: dựng URL ảnh QR động:

```text
https://qr.sepay.vn/img?acc=4168686077&bank=MBBank&amount=299000&des=<orderCode>&template=compact
```

(tương thích chuẩn `vietqr.app/img` — SePay dùng chung engine VietQR). App ngân hàng quét
mã sẽ tự điền số tài khoản, số tiền, nội dung chuyển khoản. Không cần gọi API, không cần
API key để tạo ảnh này — chỉ là một URL ảnh tĩnh theo tham số.

**Rationale**: Không có lựa chọn nào khác — đây là cách duy nhất SePay hỗ trợ tạo QR động
theo đơn hàng khi không dùng API "Tài khoản ảo" (VA) trả phí/yêu cầu ngân hàng hỗ trợ.

**Alternatives considered**: API "Tạo VA theo đơn hàng" của SePay (mỗi đơn hàng có một số
tài khoản ảo riêng) — bị loại vì cần gói/ngân hàng hỗ trợ VA mà chủ dự án chưa xác nhận có,
phức tạp hơn không cần thiết cho quy mô hiện tại (Nguyên tắc IV).

Nguồn: [developer.sepay.vn — Tạo QR và Form thanh toán](https://developer.sepay.vn/vi/sepay-webhooks/tao-qr-va-form-thanh-toan)

## Decision: Mã đơn hàng (`orderCode`) tự sinh, nhúng vào nội dung chuyển khoản

Format: `CATLIEU` + 8 ký tự cuối của `Order.id` (cuid), ví dụ `CATLIEUab12cd34`. Đây là
chuỗi vừa dùng làm `des` trong URL QR, vừa là chuỗi hệ thống tìm trong `content`/`code` của
webhook để khớp đơn hàng.

**Điều kiện bắt buộc phía SePay Dashboard** (chủ dự án tự làm, ghi rõ trong quickstart):
vào **Công ty → Cấu hình chung → Cấu trúc mã thanh toán**, đặt tiền tố `CATLIEU` để SePay
tự trích xuất đúng field `code` trong webhook. Nếu không cấu hình, hệ thống vẫn có thể tự
tìm chuỗi `orderCode` bên trong `content` thô làm phương án dự phòng (xem hợp đồng
webhook).

## Decision: Webhook xác thực bằng API Key tĩnh trong header

SePay hỗ trợ 4 kiểu xác thực webhook (API Key, HMAC-SHA256, OAuth2, không xác thực) — chọn
**API Key** (`Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>`) vì đơn giản, đủ an toàn khi
kết hợp so sánh chuỗi hằng thời gian (timing-safe compare), và là lựa chọn người dùng đã
chọn tường minh. Key này tự tạo trong SePay Dashboard → Tích hợp WebHooks, dán vào cùng
giá trị ở biến môi trường `SEPAY_WEBHOOK_API_KEY` của hệ thống.

Payload webhook xác nhận (đã kiểm chứng qua tài liệu chính thức):

```json
{
  "id": 92704,
  "gateway": "MBBank",
  "transactionDate": "2026-07-11 11:08:33",
  "accountNumber": "4168686077",
  "subAccount": "",
  "code": "CATLIEUAB12CD34",
  "content": "CATLIEUAB12CD34 chuyen tien",
  "transferType": "in",
  "description": "NGUYEN VAN A chuyen tien",
  "transferAmount": 299000,
  "accumulated": 105000000,
  "referenceCode": "FT24012345678"
}
```

Merchant server MUST trả về `200`/`201` với body `{"success": true}` trong vòng 30 giây,
nếu không SePay tự động thử lại (tối đa 7 lần trong 5 giờ) — route handler MUST xử lý
nhanh, không block trên tác vụ chậm (gửi email đặt sau khi đã cập nhật DB, không await
chặn response nếu có thể, nhưng chấp nhận await đơn giản vì khối lượng nhỏ).

Nguồn:
[docs.sepay.vn — Tích hợp WebHooks](https://docs.sepay.vn/tich-hop-webhooks.html)

## Decision: Đối chiếu dự phòng bằng SePay Transactions API

```text
GET https://my.sepay.vn/userapi/transactions/list?account_number=4168686077&limit=20
Authorization: Bearer <SEPAY_USER_API_TOKEN>
```

Trả về danh sách giao dịch gần nhất, mỗi giao dịch có `code`, `transaction_content`,
`amount_in`, `reference_number`. Khi học viên tải lại `/thanh-toan` với một `Order` đang
`pending`, hệ thống gọi API này, tìm giao dịch có `code` hoặc `transaction_content` chứa
`orderCode` của đơn hàng và `amount_in` khớp số tiền — nếu thấy, xác nhận thanh toán qua
cùng hàm idempotent dùng cho webhook (phòng trường hợp webhook bị trễ/mất, không phải
đường xác nhận chính).

`SEPAY_USER_API_TOKEN` là token khác với `SEPAY_WEBHOOK_API_KEY` — token này lấy tại SePay
Dashboard → API (mục "SePay API riêng cho tài khoản"), quyền tối thiểu đọc giao dịch.

Nguồn:
[developer.sepay.vn — API Giao dịch](https://developer.sepay.vn/vi/sepay-api/v1/api-giao-dich)

## Decision: Thời hạn đơn hàng tự quy định 30 phút

SePay không trả về thời hạn hiệu lực cho một QR (khác PayOS có `expiredAt`). Vì QR chỉ là
một ảnh tĩnh không có "trạng thái" phía SePay, hệ thống tự đặt `Order.expiresAt = createdAt
+ 30 phút` ngay lúc tạo — sau mốc này, coi đơn hết hạn cho mục đích hiển thị/cho tạo đơn
mới, dù về mặt kỹ thuật khách vẫn có thể chuyển khoản trễ và giao dịch đó sẽ không khớp
đơn nào còn `pending` (chấp nhận được, xử lý thủ công qua liên hệ hỗ trợ — đã nêu ở
Assumptions của spec).

**Alternatives considered**: Không đặt thời hạn, để đơn `pending` mãi mãi — bị loại vì vi
phạm FR-010 (spec yêu cầu học viên phải tạo lại được đơn mới khi lỡ nhịp).

## Decision: Gửi email qua Resend, không thêm hàng đợi/EmailLog

```ts
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: `28 Ngày Cắt Liều <${process.env.EMAIL_FROM}>`,
  to: user.email,
  subject: "...",
  html: "...",
});
```

Gọi trực tiếp trong Route Handler webhook, ngay sau khi transaction cập nhật `paidAt`
thành công. Bọc try/catch riêng — lỗi chỉ `console.error`, không throw, không ảnh hưởng
response `200` đã định trả cho SePay (đúng FR-009).

**Rationale**: Khối lượng gửi nhỏ (một email/một lần mua), không cần hàng đợi retry riêng;
nếu Resend lỗi, học viên vẫn đã được mở khóa và có thể tự vào app — hậu quả của việc mất
một email là thấp, không đáng để thêm hạ tầng (Nguyên tắc IV).

**Domain**: `duocsithuthuy.com` — chủ dự án tự xác minh trong Resend Dashboard (thêm DNS
record theo hướng dẫn Resend hiển thị khi thêm domain) trước khi gửi được từ địa chỉ
`@duocsithuthuy.com`; nằm ngoài phạm vi mã nguồn.

Nguồn: [resend.com/docs/send-with-nextjs](https://resend.com/docs/send-with-nextjs)

## Tổng kết — không còn NEEDS CLARIFICATION

Toàn bộ quyết định kỹ thuật đã được xác minh qua tài liệu chính thức của SePay và Resend,
không có mục nào còn để ngỏ chờ thực nghiệm ngoài việc chủ dự án tự cấu hình 2 bước phía
SePay Dashboard (tiền tố mã thanh toán, API Key webhook) và xác minh domain Resend — cả
hai đều đã ghi rõ trong `quickstart.md`.
