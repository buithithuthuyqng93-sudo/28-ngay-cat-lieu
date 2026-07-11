# Phase 1 Data Model: SePay + Lead + Email

## Order (sửa từ feature 002 — không tạo bảng mới)

| Field           | Type                | Notes                                                                 |
| --------------- | ------------------- | ---------------------------------------------------------------------- |
| `id`            | String (cuid, PK)   | Không đổi                                                              |
| `userId`        | String (FK → User)  | Không đổi                                                              |
| ~~`payosOrderCode`~~ → `orderCode` | String, unique | Đổi kiểu: chuỗi (vd `CATLIEUab12cd34`) thay vì số nguyên PayOS |
| `amount`        | Int                 | Không đổi (299000)                                                     |
| `status`        | String              | `pending` \| `paid` \| `expired` (bỏ `cancelled` — SePay không có khái niệm huỷ QR) |
| ~~`checkoutUrl`~~ → `qrImageUrl` | String | URL ảnh QR tự sinh (xem research.md), thay cho link PayOS lưu trữ |
| ~~`qrCode`~~     | *(xoá)*             | Không còn cần — SePay không trả chuỗi QR data riêng, chỉ có ảnh        |
| ~~`paymentLinkId`~~ | *(xoá)*          | Khái niệm riêng của PayOS, không áp dụng                               |
| `expiresAt`     | DateTime            | Không đổi kiểu, nhưng nay do hệ thống tự đặt (`createdAt + 30 phút`) thay vì lấy từ gateway |
| `paidAt`        | DateTime, nullable  | Không đổi                                                              |
| `createdAt`     | DateTime            | Không đổi                                                              |

**Migration**: đổi tên cột `payosOrderCode` → `orderCode` (đổi kiểu Int → String), đổi tên
`checkoutUrl` → `qrImageUrl`, xoá cột `qrCode` và `paymentLinkId`. Bảng đang trống dữ liệu
thật (chưa có giao dịch PayOS thật nào xảy ra ngoài seed), nên không cần script chuyển đổi
dữ liệu — migration có thể `DROP COLUMN`/`ADD COLUMN` trực tiếp.

## Lead (mới)

| Field           | Type       | Notes                                                                 |
| --------------- | ---------- | ---------------------------------------------------------------------- |
| `id`            | String (cuid, PK) |                                                                  |
| `userId`        | String (FK → User), unique | Một User tối đa một Lead (FR-003)                      |
| `phone`         | String     | Số điện thoại                                                          |
| `pharmacyName`  | String     | Tên nhà thuốc/quầy thuốc                                                |
| `surveyRole`    | String     | `nha-thuoc` \| `quay-thuoc` \| `sinh-vien` \| `khac`                    |
| `surveyChallenge` | String   | Câu trả lời tự luận ngắn (khó khăn khi tư vấn)                          |
| `createdAt`     | DateTime   | Mặc định `now()`                                                       |

**Quan hệ**: `Lead.userId → User.id`, `@@unique([userId])`.

**Ràng buộc suy ra từ Requirements**: FR-001/FR-003 — trang `/thanh-toan` MUST kiểm tra
tồn tại `Lead` của user trước khi cho qua bước tạo `Order`/hiện QR; nếu đã có, bỏ qua form,
vào thẳng bước thanh toán như bình thường.

## User (không đổi cấu trúc)

Không thêm field mới. `paidAt` vẫn là nguồn sự thật duy nhất cho việc mở khóa, `email` dùng
để gửi email xác nhận (đã có sẵn, không cần trường mới).

## State Transitions — Order.status (sửa so với feature 002)

```text
(tạo mới) → pending
pending → paid       [webhook SePay xác thực + khớp orderCode, hoặc đối chiếu qua
                       Transactions API tìm thấy giao dịch khớp]
pending → expired    [quá expiresAt tự đặt, phát hiện khi học viên tải lại /thanh-toan]
paid, expired → (trạng thái cuối, không tự chuyển tiếp)
```

Bỏ trạng thái `cancelled` so với feature 002 — SePay không có API "huỷ" một QR tĩnh, chỉ có
"chưa ai chuyển khoản" (vẫn `pending` cho tới khi hết hạn tự quy định).
