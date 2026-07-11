# Feature Specification: Nền tảng 28 Ngày Thử Thách Cắt Liều (baseline)

**Feature Branch**: `001-28-day-challenge-platform`

**Created**: 2026-07-11

**Status**: Retroactive baseline — mô tả lại hệ thống đã được xây dựng và đang chạy
production, dùng làm điểm neo cho các đặc tả tính năng tiếp theo.

**Input**: Ghi lại toàn bộ phạm vi sản phẩm đã triển khai tính đến 2026-07-11: nền tảng
học tập 28 ngày cho dược sĩ/sinh viên Dược/nhân sự nhà thuốc, gồm học thử miễn phí, thanh
toán mở khóa, lộ trình bài học, thử thách, thư viện case, tài nguyên, cộng đồng và tiến độ
cá nhân.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Học và theo dõi tiến độ 28 ngày (Priority: P1)

Một dược sĩ đã đăng ký và mở khóa chương trình đăng nhập, xem bài học của ngày hiện tại
(video, tóm tắt, checklist tư vấn, câu hỏi mẫu), đánh dấu hoàn thành, rồi bài học ngày kế
tiếp tự mở khóa theo đúng nhịp độ (một ngày một bài, không xả hết cùng lúc).

**Why this priority**: Đây là vòng lặp giá trị cốt lõi của sản phẩm — nếu vòng lặp này
không hoạt động, sản phẩm không còn ý nghĩa.

**Independent Test**: Đăng nhập bằng một tài khoản đã thanh toán, vào Lộ trình 28 ngày,
mở bài học đang "đang học", đánh dấu hoàn thành, xác nhận bài học kế tiếp chuyển trạng
thái đúng theo nhịp ngày.

**Acceptance Scenarios**:

1. **Given** học viên đã thanh toán và đã hoàn thành Ngày 1-3, **When** học viên mở Lộ
   trình, **Then** Ngày 1-3 hiển thị "Đã hoàn thành", Ngày 4 hiển thị "Đang học", các
   ngày sau đó hiển thị "Đã khóa" theo lịch.
2. **Given** học viên đang xem bài học "Đang học", **When** bấm "Đánh dấu hoàn thành",
   **Then** trạng thái badge, streak, tiến độ tổng trên Dashboard cập nhật ngay không
   cần tải lại trang.
3. **Given** học viên bấm nhầm "Đánh dấu hoàn thành", **When** bấm "Bỏ đánh dấu",
   **Then** bài học trở lại trạng thái trước đó và tiến độ tổng giảm tương ứng.

---

### User Story 2 - Học thử miễn phí rồi mở khóa bằng thanh toán (Priority: P1)

Một khách vãng lai (chưa có tài khoản) vào trang `/hoc-thu`, xem trọn bài học Ngày 1
không cần đăng ký. Nếu thấy phù hợp, họ đăng ký tài khoản miễn phí, vào trang thanh toán,
xác nhận thanh toán một lần, sau đó các ngày tiếp theo mở khóa dần theo đúng nhịp thử
thách (không phải mở hết 28 ngày ngay lập tức).

**Why this priority**: Đây là phễu chuyển đổi (acquisition funnel) quyết định doanh thu
sản phẩm; không có phễu này thì không có học viên trả phí.

**Independent Test**: Truy cập `/hoc-thu` ở chế độ ẩn danh (không cookie phiên) và xác
nhận xem được trọn nội dung Ngày 1; đăng ký tài khoản mới và xác nhận Ngày 2 trở đi hiển
thị trạng thái "Cần mở khóa" cho tới khi thanh toán.

**Acceptance Scenarios**:

1. **Given** một khách chưa đăng nhập, **When** truy cập `/hoc-thu`, **Then** hệ thống
   hiển thị đầy đủ nội dung bài học Ngày 1 mà không yêu cầu đăng nhập.
2. **Given** một học viên đã đăng ký nhưng chưa thanh toán, **When** học viên cố mở bài
   học Ngày 2 trở đi, **Then** hệ thống hiển thị lời nhắc mở khóa kèm giá và nút dẫn tới
   trang thanh toán, thay vì nội dung bài học.
3. **Given** học viên xác nhận thanh toán thành công, **When** học viên quay lại Lộ
   trình, **Then** Ngày 2 (và các ngày tới hạn theo lịch) chuyển sang trạng thái có thể
   học, các ngày còn lại vẫn khóa theo lịch — không mở toàn bộ 28 ngày cùng lúc.

---

### User Story 3 - Nộp thử thách và xem cộng đồng (Priority: P2)

Học viên vào trang Thử thách, nộp bài làm dạng văn bản hoặc link ứng với thử thách của
từng ngày, xem lại/hiệu chỉnh bài đã nộp, và tham khảo bài nộp nổi bật cùng bài ghim
hướng dẫn học trên trang Cộng đồng.

**Why this priority**: Củng cố việc học qua thực hành và tạo hiệu ứng xã hội (social
proof), nhưng sản phẩm vẫn dùng được nếu thiếu tính năng này trong ngắn hạn.

**Independent Test**: Nộp một bài thử thách dạng văn bản, xác nhận trạng thái chuyển
"Đã nộp"; sửa lại nội dung và xác nhận bản cập nhật được lưu.

**Acceptance Scenarios**:

1. **Given** thử thách của ngày đã mở khóa, **When** học viên nộp nội dung văn bản hoặc
   link hợp lệ, **Then** trạng thái thử thách chuyển thành "Đã nộp" và nội dung được lưu
   lại để xem/sửa sau.
2. **Given** học viên nhập một link không hợp lệ, **When** bấm nộp bài, **Then** hệ
   thống báo lỗi rõ ràng và không lưu bài nộp.
3. **Given** thử thách thuộc một ngày đang khóa, **When** học viên xem trang Thử thách,
   **Then** thử thách đó hiển thị ở trạng thái khóa, không cho nộp bài.

---

### User Story 4 - Tra cứu case thực chiến và tài nguyên (Priority: P3)

Học viên (đã đăng nhập) duyệt thư viện case theo 6 nhóm bệnh, xem chi tiết một case (câu
hỏi khai thác, hướng xử trí, dấu hiệu chuyển tuyến, cách dặn dò), và vào trang Tài nguyên
để xem/sao chép/tải checklist và mẫu quy trình.

**Why this priority**: Tính năng tham khảo hỗ trợ, không nằm trên đường găng của vòng lặp
học tập chính nhưng tăng giá trị sử dụng lâu dài.

**Independent Test**: Mở một case bất kỳ và xác nhận đủ 5 phần nội dung (mô tả, câu hỏi
khai thác, dữ kiện bổ sung, hướng xử trí, dấu hiệu chuyển tuyến, dặn dò); tải một tài
nguyên và xác nhận file `.txt` tải về khớp nội dung hiển thị.

**Acceptance Scenarios**:

1. **Given** học viên đã đăng nhập, **When** mở một case trong thư viện, **Then** trang
   hiển thị đủ mô tả, câu hỏi khai thác, dữ kiện bổ sung, hướng xử trí, dấu hiệu chuyển
   tuyến và cách dặn dò.
2. **Given** học viên ở trang Tài nguyên, **When** bấm "Sao chép", **Then** nội dung tài
   nguyên được sao chép vào clipboard và có phản hồi xác nhận trên giao diện.

### Edge Cases

- Học viên thanh toán rồi nhưng chưa hoàn thành ngày nào: hệ thống vẫn tính nhịp mở khóa
  kể từ thời điểm thanh toán, không phải thời điểm đăng ký.
- Học viên đăng ký nhưng không bao giờ thanh toán: chỉ Ngày 1 khả dụng vô thời hạn, các
  ngày khác luôn ở trạng thái "Cần mở khóa".
- Học viên đã hoàn thành hết các ngày hiện đang mở khóa theo lịch (chưa hoàn thành hết
  28 ngày): Dashboard phải phân biệt rõ "đã xong phần đang mở" và "đã xong toàn bộ 28
  ngày" — không hiển thị nhầm thông báo "đã hoàn thành chương trình".
- Học viên gửi lại bài thử thách đã nộp trước đó: hệ thống ghi đè bản nộp cũ, không tạo
  bản nộp trùng.
- Truy cập trực tiếp URL bài học chưa mở khóa (gõ tay `/bai-hoc/{ngày}`): hệ thống vẫn
  chặn và hiển thị đúng lý do khóa (theo lịch hoặc theo thanh toán), không lộ nội dung.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI cho phép người dùng ẩn danh xem trọn nội dung bài học Ngày 1
  tại `/hoc-thu` mà không cần đăng nhập.
- **FR-002**: Hệ thống PHẢI cho phép người dùng đăng ký tài khoản bằng họ tên, email, mật
  khẩu; mật khẩu PHẢI được băm trước khi lưu trữ.
- **FR-003**: Hệ thống PHẢI cho phép người dùng đăng nhập/đăng xuất bằng phiên (session)
  lưu trong cookie HttpOnly, có thời hạn.
- **FR-004**: Hệ thống PHẢI chặn truy cập mọi trang trong khu vực học viên (`/dashboard`,
  `/lo-trinh`, `/bai-hoc/*`, `/thu-thach`, `/tinh-huong`, `/tai-nguyen`, `/cong-dong`,
  `/tien-do`, `/thanh-toan`) đối với người dùng chưa đăng nhập, và chuyển hướng về trang
  đăng nhập kèm đường dẫn quay lại.
- **FR-005**: Hệ thống PHẢI hiển thị 28 bài học chia thành 4 tuần theo đúng cấu trúc:
  Tuần 1 (Ngày 1-7, nền tảng tư duy cắt liều), Tuần 2 (Ngày 8-14, nhóm bệnh thường gặp),
  Tuần 3 (Ngày 15-21, da liễu/phụ khoa/trẻ em), Tuần 4 (Ngày 22-28, thực chiến và xây quy
  trình riêng).
- **FR-006**: Với mỗi bài học, hệ thống PHẢI hiển thị: tiêu đề, mục tiêu, video bài giảng
  (hoặc placeholder nếu chưa có video), tóm tắt nội dung, checklist tư vấn, prompt/câu
  hỏi mẫu (nếu có), và một thử thách nhỏ.
- **FR-007**: Hệ thống PHẢI cho phép học viên đánh dấu hoàn thành/bỏ đánh dấu một bài
  học đã mở khóa.
- **FR-008**: Hệ thống PHẢI tính trạng thái mỗi bài học là một trong bốn giá trị: đã
  khóa, chưa học, đang học, đã hoàn thành — và việc tính toán này PHẢI thực hiện ở server,
  không dựa vào state client.
- **FR-009**: Ngày 1 PHẢI luôn ở trạng thái khả dụng (không bao giờ bị khóa vì lý do
  thanh toán) cho mọi tài khoản đã đăng nhập.
- **FR-010**: Ngày 2 trở đi PHẢI ở trạng thái "cần thanh toán" cho tới khi tài khoản đó
  ghi nhận đã thanh toán.
- **FR-011**: Sau khi thanh toán, hệ thống PHẢI mở khóa các ngày tiếp theo dần theo thời
  gian kể từ thời điểm thanh toán — không mở khóa toàn bộ 28 ngày ngay lập tức.
- **FR-012**: Hệ thống PHẢI cung cấp trang thanh toán hiển thị giá, lợi ích, và một hành
  động xác nhận thanh toán; sau khi xác nhận, tài khoản được đánh dấu đã thanh toán.
- **FR-013**: Hệ thống PHẢI hiển thị Dashboard gồm: lời chào, tiến độ tổng (%), streak
  học liên tục, bài học đang học tiếp, thử thách hôm nay, badge đã đạt, và link nhanh
  tới Lộ trình/Tài nguyên/Cộng đồng.
- **FR-014**: Hệ thống PHẢI liệt kê 28 thử thách (một thử thách/ngày), mỗi thử thách gồm
  mô tả, mức độ, thời gian ước tính, và trạng thái nộp bài của học viên hiện tại.
- **FR-015**: Hệ thống PHẢI cho phép nộp bài thử thách dạng văn bản hoặc đường link; nếu
  chọn dạng link, hệ thống PHẢI xác thực định dạng URL hợp lệ trước khi lưu.
- **FR-016**: Hệ thống PHẢI cho phép học viên cập nhật lại bài đã nộp cho cùng một thử
  thách (không tạo bản ghi trùng).
- **FR-017**: Một thử thách PHẢI ở trạng thái khóa nếu bài học cùng ngày của nó đang
  khóa (theo lịch hoặc theo thanh toán).
- **FR-018**: Hệ thống PHẢI cung cấp thư viện case thực chiến chia theo 6 nhóm: hô hấp,
  tiêu hóa, da liễu, phụ khoa, trẻ em, người già/bệnh nền.
- **FR-019**: Mỗi case PHẢI gồm: mô tả tình huống, câu hỏi khai thác, dữ kiện bổ sung,
  hướng xử trí, dấu hiệu cần chuyển tuyến, và cách dặn dò khách hàng.
- **FR-020**: Hệ thống PHẢI cung cấp trang tài nguyên phân theo 4 loại: checklist tư vấn,
  bộ câu hỏi khai thác triệu chứng, mẫu quy trình tiếp nhận ca, mẫu dặn dò khách hàng —
  mỗi tài nguyên hỗ trợ xem, sao chép, và tải xuống dạng file văn bản.
- **FR-021**: Hệ thống PHẢI cung cấp trang cộng đồng gồm: link nhóm Zalo/Facebook, bài
  ghim hướng dẫn học, lịch live/hỗ trợ, mục hỏi đáp nhanh, và danh sách bài nộp nổi bật.
- **FR-022**: Hệ thống PHẢI cung cấp trang tiến độ cá nhân gồm: số ngày hoàn thành, số
  thử thách đã nộp, streak, danh sách badge (đạt/chưa đạt), danh sách bài chưa hoàn
  thành, và gợi ý học tiếp.
- **FR-023**: Hệ thống PHẢI tính streak là số ngày liên tục gần nhất (tính đến hôm nay
  hoặc hôm qua) có ít nhất một bài học được đánh dấu hoàn thành.
- **FR-024**: Hệ thống PHẢI hiển thị landing page công khai giới thiệu chương trình, đối
  tượng phù hợp, lợi ích, cấu trúc 4 tuần, mục học thử miễn phí, và bảng giá.
- **FR-025**: Mọi nội dung hướng tới người dùng PHẢI bằng tiếng Việt.

### Key Entities

- **User**: Tài khoản học viên — họ tên, email, mật khẩu đã băm, thời điểm đăng ký, thời
  điểm thanh toán (nếu có, dùng làm mốc tính nhịp mở khóa sau khi trả phí).
- **Lesson**: Bài học của một ngày trong chương trình (1-28) — thuộc một trong 4 tuần,
  gồm tiêu đề, mục tiêu, link video, tóm tắt, checklist, prompt mẫu, thử thách nhỏ, thời
  lượng ước tính.
- **Progress**: Ghi nhận một học viên đã hoàn thành một bài học cụ thể, kèm thời điểm
  hoàn thành (dùng để tính streak).
- **Challenge**: Thử thách gắn với một ngày cụ thể — mô tả, mức độ khó, thời gian ước
  tính, có thể liên kết với một Lesson cùng ngày.
- **Submission**: Bài nộp của một học viên cho một thử thách — loại (văn bản/link), nội
  dung, thời điểm nộp, cờ đánh dấu "nổi bật" để hiển thị ở trang cộng đồng.
- **CaseStudy**: Một tình huống thực chiến thuộc một trong 6 nhóm bệnh — mô tả, câu hỏi
  khai thác, dữ kiện bổ sung, hướng xử trí, dấu hiệu chuyển tuyến, cách dặn dò.
- **Resource**: Một tài nguyên tải về thuộc một trong 4 loại — tiêu đề, mô tả, nội dung
  văn bản đầy đủ.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Một khách vãng lai có thể xem xong bài học thử Ngày 1 và hiểu được cách
  thức hoạt động của thử thách 28 ngày trong vòng 15 phút kể từ khi vào trang chủ, không
  cần liên hệ hỗ trợ.
- **SC-002**: Một học viên mới có thể hoàn tất đăng ký tài khoản trong dưới 2 phút.
- **SC-003**: Sau khi xác nhận thanh toán, học viên thấy nội dung Ngày 2 khả dụng ngay
  lập tức (không cần tải lại hoặc chờ xử lý nền).
- **SC-004**: Một học viên có thể nộp một thử thách (văn bản hoặc link) trong dưới 2
  phút kể từ khi mở trang Thử thách.
- **SC-005**: 100% các bài học ở trạng thái "đã khóa" không thể truy cập được nội dung
  dù học viên gõ thẳng URL — quyền truy cập luôn nhất quán bất kể cách điều hướng.
- **SC-006**: Học viên có thể xem đầy đủ thông tin một case thực chiến (đủ 5 phần nội
  dung) mà không cần rời trang.
- **SC-007**: Trải nghiệm mượt trên thiết bị di động — mọi trang chính hiển thị đúng bố
  cục, không tràn ngang, ở độ rộng màn hình từ 360px trở lên.

## Assumptions

- Nội dung 28 bài học, case thực chiến, tài nguyên hiện được nạp qua script seed thủ
  công (`prisma/seed.ts`), chưa có giao diện quản trị nội dung (CMS). Cập nhật nội dung
  nghĩa là sửa seed script và chạy lại.
- Có đúng một mức giá cho toàn bộ chương trình (không có gói/giá theo từng tuần).
- Cơ chế thanh toán hiện tại là giả lập (mock) — bấm "Thanh toán" là mở khóa ngay, chưa
  có giao dịch tiền thật. Đây là quyết định tạm thời đã được xác nhận với chủ sản phẩm,
  cần thay bằng cổng thanh toán thật (chuyển khoản thủ công hoặc Stripe/VNPay/Momo) trước
  khi quảng bá rộng rãi.
- Chỉ hỗ trợ tiếng Việt; chưa có kế hoạch đa ngôn ngữ.
- Chưa có vai trò quản trị viên (admin) trong app — các thao tác vận hành (đánh dấu bài
  nộp nổi bật, v.v.) hiện thực hiện trực tiếp qua seed script hoặc thao tác database.
- Database production và database dùng để phát triển cục bộ hiện là cùng một instance
  Neon Postgres — chưa tách môi trường dev/staging/production riêng biệt.
