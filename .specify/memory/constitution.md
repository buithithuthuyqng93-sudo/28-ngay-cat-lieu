<!--
Sync Impact Report
Version change: [TEMPLATE] → 1.0.0 (initial ratification)
Modified principles: N/A — first version
Added sections: I–VI (Core Principles), Technology Constraints, Development Workflow, Governance
Removed sections: None
Templates requiring updates:
  ✅ .specify/templates/spec-template.md — no change needed, structure already principle-agnostic
  ✅ .specify/templates/plan-template.md — no change needed
  ✅ .specify/templates/tasks-template.md — no change needed
Follow-up TODOs: None

---
Sync Impact Report
Version change: 1.0.0 → 1.0.1 (PATCH — làm rõ câu chữ, không đổi nguyên tắc)
Modified principles:
  - IV (YAGNI): cập nhật ví dụ — bảng Order đã được thêm khi tích hợp PayOS thật
    (specs/002-payos-payment-integration), không còn là ví dụ giả định
  - VI (Minh bạch): gỡ ví dụ "nút thanh toán demo" đã lỗi thời (nay là luồng thật),
    giữ lại làm ghi chú lịch sử
Added sections: None
Removed sections: None
Templates requiring updates: Không có — không có nguyên tắc mới, chỉ cập nhật ví dụ
Follow-up TODOs: None

---
Sync Impact Report
Version change: 1.0.1 → 1.0.2 (PATCH — làm rõ câu chữ, không đổi nguyên tắc)
Modified principles:
  - IV (YAGNI): ví dụ Order/Lead cập nhật theo SePay (specs/003-sepay-lead-email) thay vì
    PayOS
  - VI (Minh bạch): bổ sung lịch sử chuyển PayOS → SePay vào ví dụ
Added sections: None
Removed sections: None
Templates requiring updates: Không có
Follow-up TODOs: None
-->

# 28 Ngày Thử Thách Cắt Liều Constitution

## Core Principles

### I. An toàn nội dung y dược (NON-NEGOTIABLE)

Mọi nội dung liên quan đến triệu chứng, thuốc hoặc xử trí PHẢI đi kèm dấu hiệu cần
chuyển tuyến khi có dấu hiệu nguy hiểm liên quan. Không được bịa đặt tên thuốc, liều
dùng, hay số liệu y khoa không có căn cứ. Mọi trang có nội dung tư vấn phải giữ giọng
điệu "hỗ trợ ra quyết định", không khẳng định thay thế chẩn đoán y khoa. Footer/landing
page phải luôn nêu rõ: nội dung phục vụ đào tạo, không thay thế chỉ định của bác sĩ.

**Rationale**: Đây là ứng dụng đào tạo cho người hành nghề dược — nội dung sai lệch có
thể dẫn đến hậu quả thật ngoài đời với bệnh nhân.

### II. Máy chủ là nguồn sự thật duy nhất cho quyền truy cập

Toàn bộ logic mở khóa bài học (theo ngày, theo trạng thái thanh toán) PHẢI được tính
toán và kiểm tra ở server (`lib/progress.ts`, `lib/dal.ts`, server actions) — không bao
giờ dựa vào state phía client để quyết định quyền truy cập. `proxy.ts` chỉ làm lớp kiểm
tra lạc quan (optimistic check), lớp kiểm tra thật luôn nằm trong Data Access Layer.

**Rationale**: Đây là app có nội dung trả phí; nếu quyền truy cập chỉ được kiểm tra ở
UI, người dùng có thể bỏ qua thanh toán bằng cách sửa state client.

### III. Tiếng Việt trước tiên, giọng điệu chuyên nghiệp

Mọi nội dung hướng tới người dùng PHẢI bằng tiếng Việt, giọng điệu chuyên nghiệp — đáng
tin cậy — gần gũi. Không trẻ con hoá (emoji tràn lan, ngôn ngữ suồng sã), không hàn lâm
hoá (thuật ngữ không cần thiết). Áp dụng nhất quán từ landing page đến toàn bộ app.

**Rationale**: Đối tượng người dùng là dược sĩ, sinh viên Dược, nhân sự nhà thuốc —
brief gốc của sản phẩm yêu cầu rõ "không quá trẻ con, không quá học thuật".

### IV. Đơn giản, không trừu tượng hoá sớm (YAGNI)

Không thêm bảng dữ liệu, service, hay lớp trừu tượng cho nhu cầu chưa phát sinh. Ví dụ:
bảng `Order` chỉ được thêm khi tích hợp cổng thanh toán thật (nay là SePay, xem
`specs/003-sepay-lead-email`), bảng `Lead` chỉ được thêm khi có nhu cầu thu thập dữ liệu
chăm sóc khách hàng thật — không thêm bảng/service tương tự cho nhu cầu chưa thực sự phát
sinh. Ba dòng lặp lại còn tốt hơn một abstraction sớm và sai.

**Rationale**: Dự án do một người vận hành; độ phức tạp thừa làm chậm việc bảo trì hơn là
giúp ích.

### V. Mobile-first & tôn trọng khả năng tiếp cận

Giao diện PHẢI thiết kế mobile-first bằng Tailwind CSS, tôn trọng
`prefers-reduced-motion` cho mọi animation, đảm bảo độ tương phản đủ đọc, dùng font hỗ
trợ đầy đủ dấu tiếng Việt (Be Vietnam Pro).

**Rationale**: Học viên chủ yếu dùng điện thoại tại quầy thuốc trong giờ làm việc; đây là
brief gốc của sản phẩm.

### VI. Minh bạch về phần chưa hoàn thiện

Bất kỳ phần nào đang ở dạng demo/giả lập PHẢI được ghi chú rõ trong code và báo cho người
dùng biết trước khi phần đó được xem là "xong". Không được để trạng thái demo lẫn vào như
đã hoàn thiện thật khi báo cáo tiến độ. (Ví dụ lịch sử: nút thanh toán từng là giả lập
`markAsPaid`, sau đó chuyển qua PayOS thật ở `specs/002-payos-payment-integration`, rồi
chuyển tiếp sang SePay ở `specs/003-sepay-lead-email` — mỗi lần chuyển đều xoá sạch code
của luồng cũ, không giữ song song để tránh gây hiểu nhầm.)

**Rationale**: Sản phẩm này thu tiền thật từ học viên thật; im lặng về một luồng giả lập
có thể gây thất thoát doanh thu hoặc mất niềm tin.

## Ràng buộc công nghệ

- Next.js App Router (TypeScript) + Tailwind CSS v4 là nền tảng UI bắt buộc cho toàn bộ
  app.
- Prisma + PostgreSQL (Neon) là nguồn dữ liệu chính thức của production; không quay lại
  SQLite ngoài mục đích thử nghiệm cục bộ ngắn hạn.
- Xác thực bằng session cookie tự ký (`jose`, theo đúng pattern chính thức của Next.js
  trong `lib/session.ts`/`lib/dal.ts`) — không đổi sang thư viện auth khác nếu chưa có lý
  do rõ ràng.
- Triển khai qua Vercel. Mọi thay đổi `prisma/schema.prisma` PHẢI có migration tương ứng
  (`prisma migrate dev`) và chạy `prisma generate` trước khi build — không sửa schema
  database thủ công ngoài Prisma.

## Quy trình phát triển

- Tính năng mới nên bắt đầu bằng `/speckit-specify` (hoặc tương đương) trước khi viết
  code, trừ khi là sửa lỗi nhỏ (typo, bug một dòng, style thuần tuý).
- Mỗi thay đổi schema Prisma: migrate → generate → `npm run build` để xác nhận không lỗi
  type, trước khi commit.
- Không commit `.env`, `dev.db`, hay bất kỳ secret nào; luôn cập nhật `.env.example` khi
  thêm biến môi trường mới. Kiểm tra `git status` trước khi `git add -A`.
- Sau khi deploy production (Vercel), xác nhận lại bằng cách gọi thử các route chính
  (curl hoặc trình duyệt) trước khi báo hoàn tất cho người dùng.

## Governance

Hiến pháp này có giá trị cao hơn các quyết định tuỳ hứng phát sinh trong lúc code — khi
có xung đột, ưu tiên nguyên tắc tại đây. Mọi sửa đổi hiến pháp PHẢI ghi lại trong Sync
Impact Report ở đầu file kèm tăng version theo semantic versioning (MAJOR: bỏ/đổi nguyên
tắc theo hướng không tương thích ngược; MINOR: thêm nguyên tắc/section mới; PATCH: làm rõ
câu chữ). Dùng `.specify/memory/constitution.md` này làm căn cứ khi review các thay đổi
lớn.

**Version**: 1.0.2 | **Ratified**: 2026-07-11 | **Last Amended**: 2026-07-11
