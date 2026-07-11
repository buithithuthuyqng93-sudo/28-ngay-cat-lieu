# Phase 1 Data Model: PayOS payment integration

## Order

Đại diện một lần học viên khởi tạo ý định thanh toán (đúng 1 payment link PayOS).

| Field           | Type       | Notes                                                                 |
| --------------- | ---------- | ---------------------------------------------------------------------- |
| `id`            | String (cuid, PK) | Khóa chính nội bộ, dùng xuyên suốt app                         |
| `userId`        | String (FK → User) | Học viên sở hữu đơn hàng                                       |
| `payosOrderCode`| BigInt/Int, unique | Mã số nguyên gửi cho PayOS (`Date.now()` lúc tạo), dùng để đối chiếu khi webhook trả về |
| `amount`        | Int        | Số tiền VND tại thời điểm tạo (299000) — lưu lại thay vì đọc hằng số runtime, để tra soát lịch sử đúng giá tại thời điểm mua |
| `status`        | String     | `pending` \| `paid` \| `expired` \| `cancelled`                        |
| `checkoutUrl`   | String     | Link trang thanh toán PayOS trả về lúc tạo                             |
| `qrCode`        | String     | Dữ liệu/URL QR PayOS trả về lúc tạo                                     |
| `paymentLinkId` | String, nullable | ID payment link phía PayOS, dùng khi cần tra soát/gọi lại API PayOS |
| `expiresAt`     | DateTime, nullable | Thời điểm hết hạn dự kiến của link (nếu PayOS trả về)             |
| `paidAt`        | DateTime, nullable | Thời điểm webhook xác nhận thanh toán thành công cho đơn này     |
| `createdAt`     | DateTime   | Mặc định `now()`                                                       |

**Quan hệ**: `Order.userId → User.id` (một User có thể có nhiều Order theo thời gian —
ví dụ một order cũ hết hạn rồi tạo order mới — nhưng chỉ tối đa một order ở trạng thái
`pending` tại một thời điểm, theo FR-009).

**Ràng buộc suy ra từ Requirements**:
- FR-006, FR-007: cần đọc "order gần nhất" của một user → nên có index trên
  `(userId, createdAt desc)` hoặc đơn giản là query `findFirst` sắp xếp theo `createdAt`.
- FR-009: tại tầng application (server action), MUST kiểm tra không tồn tại order
  `pending` chưa hết hạn nào của user trước khi tạo order mới (không cần ràng buộc DB
  phức tạp — kiểm tra ở action là đủ cho quy mô này, nhất quán với Nguyên tắc IV).
- FR-010: server action tạo order MUST kiểm tra `User.paidAt` trước, nếu đã có thì từ
  chối tạo order mới.
- FR-005: unique trên `payosOrderCode` + transaction "claim-then-act" mô tả ở
  `research.md` đảm bảo idempotency, không cần thêm bảng log riêng.

## User (đã tồn tại — không đổi cấu trúc)

Chỉ liên quan ở đây vì `paidAt` (đã có sẵn từ trước) là trường duy nhất được cập nhật khi
một `Order` chuyển sang `status = "paid"`. Không thêm field mới vào `User` trong tính
năng này.

## State Transitions — Order.status

```text
(tạo mới) → pending
pending → paid       [webhook xác nhận thanh toán thành công, chữ ký hợp lệ]
pending → cancelled  [webhook báo huỷ, hoặc học viên bấm huỷ trên trang PayOS rồi quay lại]
pending → expired    [quá expiresAt, phát hiện khi học viên tải lại trang /thanh-toan]
paid, cancelled, expired → (trạng thái cuối, không tự chuyển tiếp)
```

Không có đường nào cho phép chuyển ngược lại `pending` từ trạng thái cuối — muốn thanh
toán lại thì tạo `Order` mới (đúng User Story 3).
