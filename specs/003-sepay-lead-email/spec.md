# Feature Specification: Chuyển sang SePay, thu thập lead và email xác nhận

**Feature Branch**: `003-sepay-lead-email`

**Created**: 2026-07-11

**Status**: Draft

**Input**: User description: "Thay thế hoàn toàn luồng thanh toán PayOS hiện tại bằng
SePay (theo dõi biến động số dư tài khoản MBBank thật, không có API tạo link thanh toán —
tự sinh QR VietQR động, xác nhận qua webhook có API Key). Thêm form bắt buộc thu thập số
điện thoại, tên nhà thuốc và 2 câu khảo sát ngay trước khi hiện QR, lưu thành lead riêng
dùng chăm sóc khách hàng sau này. Sau khi thanh toán thành công, tự động gửi email xác
nhận kèm link vào thử thách qua Resend, dùng domain duocsithuthuy.com."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Thanh toán qua SePay và tự động mở khóa (Priority: P1)

Một học viên đã học thử Ngày 1, vào trang Thanh toán. Trước khi thấy mã QR, học viên phải
điền số điện thoại, tên nhà thuốc/quầy thuốc và trả lời 2 câu hỏi ngắn. Sau khi điền xong,
học viên thấy mã QR chuyển khoản ngân hàng thật (MBBank). Chuyển khoản xong, tài khoản tự
động mở khóa mà không cần ai duyệt tay.

**Why this priority**: Đây là vòng lặp doanh thu cốt lõi — nếu không hoạt động, sản phẩm
không thu được tiền. Việc thu thập thông tin liên hệ đã trở thành một bước bắt buộc trong
chính luồng này (không phải tính năng tách rời), nên nằm chung ở P1.

**Independent Test**: Đăng nhập tài khoản chưa thanh toán, vào trang Thanh toán, điền đủ
form, thấy mã QR, chuyển khoản đúng số tiền và đúng nội dung được cung cấp — xác nhận tài
khoản mở khóa trong vòng vài phút mà không cần thao tác thủ công.

**Acceptance Scenarios**:

1. **Given** học viên chưa thanh toán và chưa từng điền form, **When** vào trang Thanh
   toán, **Then** hệ thống yêu cầu điền số điện thoại, tên nhà thuốc/quầy thuốc, và 2 câu
   khảo sát trước khi có thể thấy mã QR.
2. **Given** học viên đã điền form hợp lệ, **When** xác nhận, **Then** hệ thống hiển thị
   mã QR chuyển khoản ngân hàng đúng số tiền 299.000đ, kèm nội dung chuyển khoản chứa mã
   đơn hàng duy nhất của học viên đó.
3. **Given** học viên đã chuyển khoản đúng số tiền và đúng nội dung, **When** hệ thống
   nhận được xác nhận giao dịch, **Then** tài khoản được đánh dấu đã thanh toán và toàn
   bộ 28 ngày được mở khóa, không cần con người can thiệp.
4. **Given** học viên bỏ trống một trong các trường bắt buộc của form, **When** cố xác
   nhận, **Then** hệ thống báo rõ trường còn thiếu và không cho xem mã QR.

---

### User Story 2 - Nhận email xác nhận tự động sau khi thanh toán (Priority: P2)

Ngay sau khi hệ thống xác nhận thanh toán thành công, học viên nhận được một email xác
nhận đã tham gia thử thách, kèm đường link để bắt đầu học ngay.

**Why this priority**: Tăng trải nghiệm và độ tin cậy ("tôi đã mua thành công"), nhưng
không phải điều kiện để giá trị cốt lõi (mở khóa) hoạt động — nếu gửi email thất bại,
học viên vẫn đã được mở khóa và có thể tự vào app bình thường.

**Independent Test**: Hoàn tất một giao dịch thanh toán thật (hoặc mô phỏng sự kiện xác
nhận thanh toán) — xác nhận hộp thư của học viên nhận được email xác nhận kèm link vào
thử thách trong vòng vài phút.

**Acceptance Scenarios**:

1. **Given** hệ thống vừa xác nhận thanh toán thành công cho một học viên, **When** quá
   trình xử lý hoàn tất, **Then** một email được gửi tới đúng địa chỉ email của học viên
   đó, nội dung xác nhận tham gia thành công và có link vào lộ trình học.
2. **Given** việc gửi email gặp lỗi (dịch vụ email tạm thời không phản hồi), **When** lỗi
   xảy ra, **Then** việc mở khóa tài khoản của học viên vẫn đã hoàn tất bình thường — lỗi
   gửi email không được làm hỏng hay lùi lại việc mở khóa.

---

### User Story 3 - Đơn hàng hết hạn và đối chiếu lại khi quay lại trang (Priority: P3)

Một học viên tạo đơn hàng nhưng không chuyển khoản kịp trong thời gian hợp lý, hoặc rời
trang trước khi hệ thống kịp xác nhận. Học viên cần thấy đúng trạng thái khi quay lại,
và có thể bắt đầu lại nếu đơn cũ đã quá lâu.

**Why this priority**: Ảnh hưởng tỷ lệ chuyển đổi ở nhóm học viên lỡ nhịp lần đầu, tần
suất thấp hơn luồng chính.

**Independent Test**: Tạo một đơn hàng, không chuyển khoản, đợi quá thời hạn quy định,
quay lại trang Thanh toán — xác nhận hệ thống báo đơn cũ hết hiệu lực và cho tạo đơn mới;
tạo đơn mới và hoàn tất thanh toán thành công bình thường.

**Acceptance Scenarios**:

1. **Given** đơn hàng đang chờ đã quá thời hạn quy định mà chưa nhận được chuyển khoản,
   **When** học viên quay lại trang Thanh toán, **Then** hệ thống báo rõ đơn cũ đã hết
   hạn và cho phép tạo đơn hàng mới (không cần điền lại form đã điền ở lần trước).
2. **Given** học viên đã chuyển khoản nhưng xác nhận tự động bị trễ, **When** học viên
   tải lại trang Thanh toán, **Then** hệ thống chủ động kiểm tra lại và cập nhật đúng
   trạng thái nếu giao dịch thực ra đã thành công, không bắt học viên chờ vô thời hạn.

---

### Edge Cases

- Học viên chuyển khoản đúng số tiền nhưng sai/thiếu nội dung chuyển khoản (không chứa mã
  đơn hàng) — hệ thống không tự khớp được, nằm ngoài phạm vi tự động của đặc tả này (xử
  lý thủ công qua liên hệ hỗ trợ).
- Có giao dịch chuyển khoản vào tài khoản ngân hàng với nội dung trùng khớp ngẫu nhiên
  nhưng không phải của học viên nào trong hệ thống (không khớp đơn hàng nào) — hệ thống
  phải bỏ qua an toàn, không gán nhầm cho tài khoản khác.
- Request xác nhận giao dịch gửi tới hệ thống không có khóa xác thực hợp lệ — phải bị từ
  chối, không được phép làm thay đổi trạng thái bất kỳ tài khoản nào.
- Xác nhận giao dịch cho cùng một đơn hàng được gửi tới nhiều lần (do dịch vụ ngân hàng tự
  gửi lại) — không được mở khóa lặp lại hay gửi email xác nhận nhiều lần.
- Học viên đã từng điền form lead ở một đơn hàng trước (đã hết hạn), nay tạo đơn hàng mới
  — không bắt điền lại từ đầu, dùng lại thông tin đã có.
- Học viên không có địa chỉ email hợp lệ để nhận email xác nhận — nằm ngoài phạm vi (địa
  chỉ email lấy từ tài khoản đã đăng ký, coi như luôn hợp lệ vì đã xác thực lúc đăng ký).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống MUST yêu cầu học viên hoàn tất một form gồm số điện thoại, tên nhà
  thuốc/quầy thuốc và trả lời 2 câu khảo sát trước khi hiển thị mã QR thanh toán, nếu học
  viên chưa từng cung cấp các thông tin này trước đó.
- **FR-002**: Hệ thống MUST lưu lại thông tin form nói trên thành một bản ghi lead gắn với
  đúng tài khoản học viên, độc lập với việc học viên có hoàn tất thanh toán hay không.
- **FR-003**: Hệ thống MUST không bắt học viên điền lại form nếu đã từng cung cấp thông
  tin này ở một lần trước đó (kể cả khi tạo đơn hàng mới sau khi đơn cũ hết hạn).
- **FR-004**: Hệ thống MUST tạo mã QR chuyển khoản ngân hàng cho đúng số tiền 299.000đ,
  kèm nội dung chuyển khoản chứa mã đơn hàng riêng biệt, duy nhất cho mỗi đơn hàng.
- **FR-005**: Hệ thống MUST tự động xác nhận thanh toán và mở khóa toàn bộ chương trình
  ngay khi nhận được xác nhận giao dịch chuyển khoản khớp đúng đơn hàng, không cần con
  người duyệt tay.
- **FR-006**: Hệ thống MUST xác thực mọi request xác nhận giao dịch gửi tới bằng khóa bí
  mật trước khi xử lý; request không có khóa hợp lệ MUST bị từ chối và không được phép làm
  thay đổi trạng thái bất kỳ tài khoản nào.
- **FR-007**: Hệ thống MUST đảm bảo mỗi đơn hàng chỉ dẫn đến việc mở khóa đúng một lần, kể
  cả khi xác nhận giao dịch cho đơn hàng đó được gửi tới nhiều hơn một lần.
- **FR-008**: Hệ thống MUST tự động gửi một email xác nhận tới địa chỉ email của học viên
  ngay sau khi xác nhận thanh toán thành công, nội dung xác nhận tham gia thử thách và kèm
  đường link để vào học.
- **FR-009**: Việc gửi email xác nhận thất bại MUST KHÔNG ảnh hưởng tới việc tài khoản đã
  được mở khóa thành công.
- **FR-010**: Hệ thống MUST cho phép học viên tạo đơn hàng thanh toán mới khi đơn hàng
  trước đó đã quá thời hạn quy định mà chưa được xác nhận thanh toán.
- **FR-011**: Hệ thống MUST tự kiểm tra lại trạng thái đơn hàng đang chờ khi học viên quay
  lại trang Thanh toán, để phát hiện các trường hợp giao dịch đã thành công nhưng xác nhận
  tự động bị trễ hoặc chưa tới.
- **FR-012**: Hệ thống MUST ghi lại đủ thông tin tối thiểu của mỗi lần nhận xác nhận giao
  dịch (mã đơn hàng, thời điểm, kết quả xử lý) để phục vụ tra soát khi có khiếu nại.

### Key Entities

- **Lead**: Thông tin liên hệ và khảo sát của một học viên — số điện thoại, tên nhà
  thuốc/quầy thuốc, câu trả lời cho 2 câu khảo sát. Gắn với đúng một tài khoản học viên,
  tồn tại độc lập với trạng thái thanh toán.
- **Đơn hàng thanh toán (Order)**: Không đổi bản chất so với trước — thuộc về một học
  viên, có số tiền, mã đơn hàng duy nhất, trạng thái (đang chờ/đã thanh toán/đã hết hạn),
  thời điểm tạo, thời điểm thanh toán thành công.
- **Tài khoản học viên (User)**: Có thời điểm thanh toán (`paidAt`) và địa chỉ email dùng
  để gửi email xác nhận.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Học viên hoàn tất form và thấy mã QR trong vòng dưới 1 phút kể từ khi vào
  trang Thanh toán lần đầu.
- **SC-002**: Sau khi chuyển khoản đúng số tiền và nội dung, chương trình được mở khóa
  trong vòng 2 phút, không cần thao tác thủ công từ người vận hành.
- **SC-003**: Học viên nhận được email xác nhận trong vòng 5 phút sau khi được mở khóa.
- **SC-004**: 100% request xác nhận giao dịch không có khóa hợp lệ bị từ chối, không có
  trường hợp tài khoản bị mở khóa nhầm do request giả mạo.
- **SC-005**: 100% các lần xác nhận giao dịch trùng lặp cho cùng một đơn hàng không gây
  mở khóa nhiều lần hay gửi nhiều email xác nhận.
- **SC-006**: 100% lead (số điện thoại, tên nhà thuốc, khảo sát) được lưu lại đầy đủ ngay
  cả với học viên chưa hoàn tất thanh toán.
- **SC-007**: Người vận hành có thể tra cứu lại toàn bộ lead đã thu thập được để phục vụ
  chăm sóc khách hàng, không cần công cụ ngoài hệ thống.

## Assumptions

- SePay thay thế hoàn toàn PayOS — không giữ song song hai cổng thanh toán.
- Chủ dự án đã kết nối tài khoản ngân hàng thật (MBBank, số tài khoản 4168686077) với
  SePay và sẽ tự cấu hình tiền tố mã thanh toán trong SePay Dashboard để hệ thống của
  SePay nhận diện đúng mã đơn hàng từ nội dung chuyển khoản.
- Email xác nhận gửi qua Resend, dùng domain đã được chủ dự án xác minh
  (duocsithuthuy.com); việc xác minh domain nằm ngoài phạm vi đặc tả này (thao tác một
  lần của chủ dự án).
- Thời hạn hiệu lực của một đơn hàng đang chờ do hệ thống tự quy định (không phải do SePay
  cung cấp, vì SePay không có khái niệm "hết hạn link" như PayOS) — mặc định 30 phút, có
  thể điều chỉnh sau.
- 2 câu khảo sát dùng nội dung mẫu đã thống nhất: (1) đối tượng công việc — Nhà thuốc/Quầy
  thuốc/Sinh viên Dược/Khác; (2) câu hỏi tự luận ngắn về khó khăn lớn nhất khi tư vấn
  khách hàng hiện nay.
- Không có yêu cầu cho phép học viên sửa lại thông tin lead đã điền trong phạm vi đặc tả
  này (có thể bổ sung sau nếu cần).
