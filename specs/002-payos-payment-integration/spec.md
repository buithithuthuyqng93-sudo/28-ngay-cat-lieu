# Feature Specification: Kết nối cổng thanh toán PayOS thật

**Feature Branch**: `002-payos-payment-integration`

**Created**: 2026-07-11

**Status**: Draft

**Input**: User description: "Kết nối cổng thanh toán PayOS thật để thay thế nút thanh
toán giả lập (markAsPaid) hiện tại. Học viên sau khi học thử Ngày 1 miễn phí, vào trang
/thanh-toan, bấm thanh toán sẽ được tạo một link/QR thanh toán PayOS thật (chuyển khoản
ngân hàng qua VietQR) cho số tiền 299.000đ. Sau khi học viên thanh toán thành công, hệ
thống phải tự động xác nhận qua webhook PayOS (không cần duyệt tay) và mở khóa toàn bộ
chương trình cho đúng tài khoản đó (set paidAt), rồi học viên được điều hướng về trang
xác nhận thành công. Cần xử lý các trường hợp: học viên rời trang trước khi thanh toán
xong (link hết hạn), thanh toán bị huỷ, webhook gọi trùng lặp (idempotency), và xác thực
chữ ký webhook để đảm bảo request đến từ PayOS thật chứ không phải giả mạo. Học viên cũng
cần trang xem lại trạng thái đơn hàng của mình nếu thanh toán đang chờ xử lý."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Thanh toán và tự động mở khóa (Priority: P1)

Một học viên đã học thử Ngày 1 miễn phí, vào trang Thanh toán, bấm nút thanh toán, được
đưa cho một mã QR/link chuyển khoản ngân hàng trị giá 299.000đ. Sau khi chuyển khoản xong
bằng app ngân hàng, học viên không cần làm gì thêm — chương trình tự mở khóa và học viên
được đưa tới trang xác nhận đã mở khóa thành công.

**Why this priority**: Đây là vòng lặp doanh thu cốt lõi. Nếu vòng lặp này không hoạt
động, sản phẩm không thu được tiền thật, mọi tính năng khác trở nên vô nghĩa về mặt kinh
doanh.

**Independent Test**: Đăng nhập bằng một tài khoản chưa thanh toán, vào trang Thanh toán,
bấm thanh toán, hoàn tất chuyển khoản qua QR thật (hoặc mô phỏng bằng webhook thử nghiệm
của PayOS), xác nhận tài khoản được mở khóa trong vòng dưới 1 phút mà không cần thao tác
thủ công nào từ người vận hành.

**Acceptance Scenarios**:

1. **Given** học viên đã đăng nhập và chưa thanh toán, **When** học viên bấm "Xác nhận
   thanh toán" trên trang Thanh toán, **Then** hệ thống hiển thị mã QR/link chuyển khoản
   VietQR đúng số tiền 299.000đ trong vòng vài giây.
2. **Given** học viên đã quét mã và chuyển khoản thành công, **When** PayOS gửi thông báo
   thanh toán thành công về hệ thống, **Then** tài khoản học viên được đánh dấu đã thanh
   toán và toàn bộ 28 ngày được mở khóa mà không cần ai duyệt tay.
3. **Given** tài khoản vừa được mở khóa, **When** hệ thống xử lý xong thông báo thanh
   toán, **Then** lần tiếp theo học viên tải lại trang bất kỳ trong app, học viên thấy
   ngay trạng thái đã mở khóa (Lộ trình, Dashboard, Thử thách không còn hiển thị khóa do
   thanh toán).

---

### User Story 2 - Theo dõi trạng thái đơn hàng đang chờ (Priority: P2)

Một học viên đã bấm thanh toán nhưng chưa kịp chuyển khoản (hoặc đang chờ ngân hàng xử
lý), rời trang rồi quay lại sau. Học viên cần thấy lại đúng trạng thái đơn hàng của mình
thay vì phải tạo một đơn hàng mới hoặc không biết chuyển khoản đã được ghi nhận chưa.

**Why this priority**: Trải nghiệm chờ thanh toán mơ hồ là nguyên nhân phổ biến khiến
khách hàng bỏ ngang hoặc chuyển khoản nhầm/chuyển khoản hai lần vì tưởng lần đầu thất
bại.

**Independent Test**: Tạo một đơn hàng, không thanh toán, rời trang rồi quay lại trang
Thanh toán — xác nhận thấy đúng trạng thái "đang chờ thanh toán" kèm lại mã QR/link cũ
(nếu còn hiệu lực) thay vì bị yêu cầu tạo đơn mới hoặc thấy giao diện trống.

**Acceptance Scenarios**:

1. **Given** học viên có một đơn hàng đang ở trạng thái chờ thanh toán và còn hiệu lực,
   **When** học viên quay lại trang Thanh toán, **Then** hệ thống hiển thị lại đúng
   đơn hàng đó (không tạo đơn hàng trùng lặp).
2. **Given** học viên đã thanh toán thành công trước đó, **When** học viên vào lại trang
   Thanh toán, **Then** hệ thống hiển thị trạng thái "đã mở khóa toàn bộ chương trình"
   thay vì cho tạo đơn hàng mới.
3. **Given** học viên bấm nút thanh toán nhiều lần liên tiếp trong lúc trang đang tải,
   **When** hệ thống xử lý các lượt bấm đó, **Then** chỉ một đơn hàng đang chờ được tạo
   ra cho học viên tại một thời điểm.

---

### User Story 3 - Xử lý đơn hàng hết hạn hoặc bị huỷ (Priority: P3)

Một học viên tạo đơn hàng nhưng không hoàn tất thanh toán (đóng app ngân hàng giữa
chừng, hoặc để link quá lâu không dùng). Học viên cần có cách bắt đầu lại mà không bị
kẹt ở một đơn hàng "chết".

**Why this priority**: Ảnh hưởng đến tỷ lệ chuyển đổi nhưng tần suất thấp hơn luồng
thanh toán chính; vẫn cần thiết để không mất doanh thu từ những học viên có ý định mua
nhưng lỡ nhịp lần đầu.

**Independent Test**: Tạo một đơn hàng, để hết hạn (hoặc huỷ thủ công qua PayOS), quay
lại trang Thanh toán — xác nhận hệ thống nhận biết đơn hàng cũ không còn hiệu lực và cho
phép tạo đơn hàng mới ngay trên cùng một màn hình.

**Acceptance Scenarios**:

1. **Given** đơn hàng đang chờ đã hết hạn hoặc bị huỷ, **When** học viên vào trang Thanh
   toán, **Then** hệ thống hiển thị rõ đơn hàng cũ không còn hiệu lực và cho phép tạo
   đơn hàng thanh toán mới.
2. **Given** học viên vừa tạo đơn hàng mới sau khi đơn cũ hết hạn, **When** học viên hoàn
   tất thanh toán cho đơn mới, **Then** tài khoản được mở khóa bình thường như User Story
   1, không bị ảnh hưởng bởi đơn hàng cũ đã hết hạn.

---

### Edge Cases

- Webhook PayOS gọi lại nhiều lần cho cùng một sự kiện thanh toán (do PayOS tự động retry
  khi chưa nhận phản hồi kịp) — hệ thống không được mở khóa lặp lại hay tạo hiệu ứng phụ
  nhiều lần.
- Request gửi tới endpoint webhook có chữ ký không hợp lệ hoặc không có chữ ký — hệ thống
  phải từ chối, không thay đổi trạng thái bất kỳ tài khoản nào, và ghi nhận lại để tra
  soát khi cần.
- Webhook báo thanh toán cho một mã đơn hàng không tồn tại trong hệ thống (dữ liệu không
  khớp) — hệ thống phải từ chối một cách an toàn, không được lỗi trang hay crash.
- Học viên đã thanh toán rồi cố tình gọi lại hành động tạo đơn hàng (qua thao tác bất
  thường) — hệ thống phải chặn, không tạo thêm đơn hàng hay yêu cầu trả tiền lần hai.
- PayOS báo trạng thái "đã huỷ" cho một đơn hàng đang chờ (học viên tự đóng giao dịch
  phía ngân hàng) — đơn hàng phải chuyển đúng trạng thái đã huỷ, không bị treo mãi ở
  "đang chờ".
- Học viên chuyển khoản sai số tiền (thiếu/thừa so với 299.000đ) — nằm ngoài phạm vi tự
  động hoá của đặc tả này; xem mục Assumptions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống MUST cho phép học viên đã đăng nhập và chưa thanh toán khởi tạo
  một đơn hàng thanh toán trị giá 299.000đ từ trang Thanh toán.
- **FR-002**: Hệ thống MUST hiển thị cho học viên một link/mã QR chuyển khoản ngân hàng
  (VietQR) gắn với đúng đơn hàng vừa tạo để hoàn tất thanh toán.
- **FR-003**: Hệ thống MUST tự động xác nhận thanh toán và mở khóa toàn bộ chương trình
  (đặt thời điểm thanh toán cho tài khoản) ngay khi nhận được xác nhận thanh toán thành
  công từ PayOS, không cần con người can thiệp hay duyệt tay.
- **FR-004**: Hệ thống MUST xác thực chữ ký của mọi request thông báo thanh toán trước
  khi xử lý; request có chữ ký không hợp lệ MUST bị từ chối và không được phép làm thay
  đổi trạng thái của bất kỳ tài khoản nào.
- **FR-005**: Hệ thống MUST đảm bảo mỗi đơn hàng chỉ dẫn đến việc mở khóa đúng một lần,
  kể cả khi thông báo thanh toán cho đơn hàng đó được gửi tới nhiều hơn một lần.
- **FR-006**: Hệ thống MUST lưu lại trạng thái của từng đơn hàng thanh toán (đang chờ, đã
  thanh toán, đã hết hạn, đã huỷ), gắn đúng với tài khoản học viên đã khởi tạo đơn hàng
  đó.
- **FR-007**: Học viên MUST xem được trạng thái đơn hàng gần nhất của mình khi quay lại
  trang Thanh toán, bao gồm cả trường hợp đang chờ thanh toán và đã thanh toán xong.
- **FR-008**: Khi đơn hàng đang chờ của học viên đã hết hạn hoặc đã bị huỷ, hệ thống MUST
  cho phép học viên khởi tạo một đơn hàng thanh toán mới.
- **FR-009**: Hệ thống MUST ngăn việc tạo nhiều hơn một đơn hàng đang chờ thanh toán cùng
  lúc cho cùng một học viên.
- **FR-010**: Hệ thống MUST ngăn học viên đã thanh toán thành công khởi tạo thêm đơn hàng
  thanh toán mới cho cùng chương trình.
- **FR-011**: Sau khi thanh toán được xác nhận thành công trong lúc học viên vẫn đang mở
  trang Thanh toán, hệ thống MUST đưa học viên tới trạng thái/màn hình xác nhận đã mở
  khóa thành công.
- **FR-012**: Hệ thống MUST ghi lại đủ thông tin tối thiểu của mỗi lần nhận thông báo
  thanh toán (mã đơn hàng, thời điểm, kết quả xử lý) để phục vụ tra soát khi có khiếu nại
  về giao dịch.

### Key Entities

- **Đơn hàng thanh toán (Order)**: Đại diện cho một lần học viên khởi tạo ý định thanh
  toán. Thuộc về đúng một học viên. Có số tiền, mã đơn hàng dùng để đối chiếu với PayOS,
  trạng thái (đang chờ / đã thanh toán / đã hết hạn / đã huỷ), thời điểm tạo, thời điểm
  thanh toán thành công (nếu có).
- **Tài khoản học viên (User)**: Đã tồn tại trong hệ thống, có thời điểm thanh toán
  (`paidAt`). Một đơn hàng chuyển sang trạng thái đã thanh toán là sự kiện duy nhất được
  phép cập nhật thời điểm này.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Học viên nhận được mã QR/link chuyển khoản trong vòng 3 giây sau khi bấm
  thanh toán.
- **SC-002**: Sau khi chuyển khoản thành công, chương trình được mở khóa cho học viên
  trong vòng 30 giây, không cần bất kỳ thao tác thủ công nào từ người vận hành.
- **SC-003**: 100% các lần thông báo thanh toán trùng lặp cho cùng một đơn hàng không gây
  ra việc mở khóa nhiều lần hay lỗi hiển thị cho học viên.
- **SC-004**: 100% request thông báo thanh toán có chữ ký không hợp lệ bị từ chối, không
  ghi nhận trường hợp tài khoản bị mở khóa nhầm do request giả mạo.
- **SC-005**: Học viên có đơn hàng hết hạn hoặc bị huỷ có thể tự tạo lại thanh toán mới và
  hoàn tất mà không cần liên hệ hỗ trợ.
- **SC-006**: Người vận hành có thể tra soát lại bất kỳ giao dịch thanh toán nào (đơn
  hàng nào, lúc nào, kết quả ra sao) mà không cần truy cập trực tiếp hệ thống PayOS.

## Assumptions

- PayOS là cổng thanh toán chính thức được chủ dự án lựa chọn, thay thế hoàn toàn luồng
  "thanh toán demo" (`markAsPaid`) hiện tại — không giữ song song hai luồng.
- Giá chương trình cố định 299.000đ cho một lần mua trọn gói; không có gói theo kỳ hạn
  hay đăng ký định kỳ trong phạm vi đặc tả này.
- Mỗi tài khoản chỉ mua một lần; hoàn tiền/refund và mua lại sau khi đã hoàn tiền nằm
  ngoài phạm vi đặc tả này.
- Chủ dự án đã có sẵn tài khoản merchant PayOS và các khoá xác thực cần thiết; việc đăng
  ký tài khoản PayOS nằm ngoài phạm vi đặc tả này.
- Kênh thanh toán trong phạm vi này là chuyển khoản ngân hàng qua VietQR do PayOS cung
  cấp sẵn trong link/mã thanh toán tạo ra; không tự xây thêm phương thức thanh toán khác.
- Thời hạn hiệu lực của link/mã QR theo mặc định do PayOS quy định, không tự đặt thời hạn
  tuỳ chỉnh riêng trong đặc tả này.
- Trường hợp học viên chuyển khoản sai số tiền so với giá trị đơn hàng được coi là ngoại
  lệ xử lý thủ công qua liên hệ hỗ trợ, không nằm trong luồng tự động của đặc tả này.
