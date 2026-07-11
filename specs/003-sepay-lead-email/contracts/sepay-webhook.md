# Contract: SePay webhook receiver

**Endpoint**: `POST /api/webhook/sepay` (thay thế hoàn toàn `POST /api/webhook/payos`, đã
xoá)

**Caller**: SePay servers — nằm ngoài `proxy.ts`, tự xác thực bằng API Key thay vì session.

## Request

Header bắt buộc: `Authorization: Apikey <giá trị khớp SEPAY_WEBHOOK_API_KEY>`.

Body (xem đầy đủ ở `research.md`):

```json
{
  "id": 92704,
  "gateway": "MBBank",
  "transactionDate": "2026-07-11 11:08:33",
  "accountNumber": "4168686077",
  "code": "CATLIEUAB12CD34",
  "content": "CATLIEUAB12CD34 chuyen tien",
  "transferType": "in",
  "transferAmount": 299000,
  "referenceCode": "FT24012345678"
}
```

## Xử lý (theo thứ tự bắt buộc)

1. Đọc header `Authorization`. So sánh với `SEPAY_WEBHOOK_API_KEY` bằng so sánh chuỗi an
   toàn theo thời gian (timing-safe). Không khớp hoặc thiếu header → dừng ngay, trả `401`,
   **không đọc/không dùng bất kỳ field nào trong body**. Đáp ứng FR-006.
2. Chỉ xử lý khi `transferType === "in"` (tiền vào) — bỏ qua giao dịch tiền ra (`"out"`),
   trả `200` ngay (không phải lỗi, chỉ không liên quan).
3. Tìm `orderCode` khớp: ưu tiên field `code` nếu có giá trị; nếu rỗng/null, tìm chuỗi
   khớp mẫu `CATLIEU[A-Za-z0-9]+` bên trong `content` làm phương án dự phòng (trường hợp
   chủ dự án chưa/quên cấu hình tiền tố mã thanh toán trong SePay Dashboard).
4. Không tìm được `orderCode` nào hợp lệ trong payload → no-op, trả `200` (không phải mọi
   giao dịch vào tài khoản đều liên quan tới hệ thống này — tài khoản có thể nhận tiền từ
   nguồn khác).
5. Tìm `Order` theo `orderCode`.
   - Không thấy → no-op, trả `200`, ghi log mức thông tin.
   - Thấy nhưng `status === "paid"` → no-op, trả `200` (đã xử lý trước đó — FR-007).
   - Thấy và `status === "pending"`: kiểm tra `transferAmount === order.amount`; nếu số
     tiền không khớp, no-op và ghi log cảnh báo (không tự xử lý sai lệch số tiền, xem
     Edge Cases của spec) — nếu khớp, trong một transaction: `order.status = "paid"`,
     `order.paidAt = now`, `user.paidAt = now`. Đáp ứng FR-005.
6. Sau khi transaction xác nhận thanh toán thành công (không phải no-op), gọi gửi email
   xác nhận (xem `lead-and-checkout-actions.md` phần Email) trong try/catch riêng — lỗi
   gửi email chỉ log, không throw, không đổi response. Đáp ứng FR-008/FR-009.
7. Ghi log tối thiểu cho mọi lượt webhook tới dù kết quả thế nào (orderCode nếu đọc được,
   thời điểm, kết quả xử lý) — đáp ứng FR-012.

## Response

| Tình huống                                        | Status code | Body                          |
| --------------------------------------------------- | ----------- | ------------------------------ |
| API Key hợp lệ, xử lý xong (kể cả no-op)             | `200`       | `{ "success": true }`          |
| Thiếu/sai API Key                                    | `401`       | `{ "success": false, "error": "unauthorized" }` |
| Lỗi hệ thống ngoài dự kiến khi đang xử lý             | `500`       | `{ "success": false, "error": "internal error" }` (SePay tự retry) |

Lưu ý: SePay mong đợi body có `{"success": true}` cho trường hợp thành công (khác PayOS
dùng `{"received": true}`) — tuân theo đúng quy ước SePay để tránh bị coi là lỗi và bị
retry không cần thiết.

## Ghi chú bảo mật

- Không tin bất kỳ field nào trong body cho tới khi bước 1 (xác thực API Key) qua.
- So sánh API Key MUST dùng hàm so sánh an toàn theo thời gian (vd `crypto.timingSafeEqual`
  sau khi đưa hai chuỗi về cùng độ dài bằng đệm, hoặc thư viện tương đương) — không dùng
  `===` trực tiếp trên chuỗi bí mật để tránh timing attack, dù rủi ro thực tế thấp ở quy mô
  này, đây vẫn là thực hành đúng khi so sánh secret.
