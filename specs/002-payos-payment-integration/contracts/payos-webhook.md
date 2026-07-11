# Contract: PayOS webhook receiver

**Endpoint**: `POST /api/webhook/payos`

**Caller**: PayOS servers (bên thứ ba, không phải trình duyệt học viên) — endpoint này
PHẢI nằm ngoài `proxy.ts` (không yêu cầu session cookie), tự xác thực bằng chữ ký PayOS
thay vì auth thông thường.

## Request

Body: JSON, đúng theo shape PayOS gửi (xem `research.md`):

```json
{
  "code": "00",
  "desc": "success",
  "success": true,
  "data": {
    "orderCode": 1731300000000,
    "amount": 299000,
    "description": "CATLIEU ab12cd34",
    "transactionDateTime": "2026-07-11 10:00:00",
    "...": "các field khác PayOS trả — xem research.md"
  },
  "signature": "..."
}
```

## Xử lý (theo thứ tự bắt buộc)

1. Đọc raw body, gọi `payos.webhooks.verify(body)`.
   - Nếu ném lỗi (chữ ký sai/không hợp lệ) → dừng ngay, **không đọc/không dùng bất kỳ
     field nào trong `data`**, trả response lỗi (xem bên dưới). Đáp ứng FR-004, SC-004.
2. Với `data` đã xác thực, tìm `Order` theo `payosOrderCode = data.orderCode`.
   - Không tìm thấy → no-op an toàn (có thể là request kiểm tra lúc đăng ký webhook, hoặc
     đơn hàng từ môi trường khác) → trả 2xx, không lỗi, có ghi log ở mức thông tin.
   - Tìm thấy nhưng `order.status` đã là `"paid"` → no-op (đã xử lý trước đó, webhook gọi
     lại) → trả 2xx. Đáp ứng FR-005, SC-003.
   - Tìm thấy và `order.status === "pending"` → trong một transaction: cập nhật
     `order.status = "paid"`, `order.paidAt = now`, và `user.paidAt = now` cho đúng
     `order.userId`. Đáp ứng FR-003.
3. Ghi log tối thiểu cho mọi lần webhook tới dù kết quả thế nào (mã đơn hàng nếu đọc được,
   thời điểm, kết quả xử lý) — phục vụ FR-012/SC-006. Không log toàn bộ payload thô có
   khả năng chứa dữ liệu nhạy cảm về sau; log các field nghiệp vụ cần cho tra soát là đủ.

## Response

| Tình huống                                   | Status code | Body                          |
| --------------------------------------------- | ----------- | ------------------------------ |
| Chữ ký hợp lệ, xử lý xong (kể cả no-op)        | `200`       | `{ "received": true }`         |
| Chữ ký không hợp lệ / thiếu / lỗi parse        | `400`       | `{ "error": "invalid signature" }` |
| Lỗi hệ thống ngoài dự kiến khi đang xử lý       | `500`       | `{ "error": "internal error" }` (PayOS sẽ tự retry theo lịch của họ) |

**Không bao giờ** trả 200 khi chữ ký không hợp lệ — kể cả khi điều đó khiến PayOS retry
nhiều lần; retry là chấp nhận được, mở khóa nhầm thì không.

## Ghi chú bảo mật

- Route Handler này KHÔNG được đọc/tin bất kỳ header hay field nào để xác định danh tính
  học viên — danh tính chỉ suy ra gián tiếp qua `Order.userId` sau khi đã xác thực chữ ký
  và tra được `Order` tương ứng. Không có state phía client nào được tin ở endpoint này,
  đúng Nguyên tắc II của constitution.
