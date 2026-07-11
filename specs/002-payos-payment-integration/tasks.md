---
description: "Task list for PayOS payment integration"
---

# Tasks: Kết nối cổng thanh toán PayOS thật

**Input**: Design documents from `/specs/002-payos-payment-integration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md
(tất cả đã có)

**Tests**: Dự án không có test suite tự động (xác nhận thủ công theo quy ước hiện có) —
không sinh task viết unit/integration test tự động; `quickstart.md` đóng vai trò kịch
bản xác nhận thủ công, chạy ở cuối (T018).

**Organization**: Task nhóm theo user story trong `spec.md` để có thể triển khai/kiểm
thử độc lập từng story.

## Path Conventions

Next.js App Router, một project duy nhất tại repo root — đường dẫn dùng trực tiếp từ
gốc repo (`app/`, `lib/`, `prisma/`), đúng theo `plan.md`.

---

## Phase 1: Setup

**Purpose**: Chuẩn bị dependency và biến môi trường trước khi đụng tới logic nghiệp vụ

- [X] T001 Cài đặt SDK PayOS: chạy `npm install @payos/node` (cập nhật `package.json`,
      `package-lock.json`)
- [X] T002 [P] Thêm placeholder `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`
      vào `.env.example` kèm chú thích lấy từ đâu (không điền giá trị thật)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Hạ tầng dùng chung cho mọi user story — PHẢI xong trước khi làm bất kỳ story
nào bên dưới

**⚠️ CRITICAL**: Không bắt đầu Phase 3+ khi Phase này chưa xong

- [X] T003 Thêm model `Order` vào `prisma/schema.prisma` đúng theo `data-model.md` (field
      `id`, `userId`, `payosOrderCode` unique, `amount`, `status`, `checkoutUrl`,
      `qrCode`, `paymentLinkId`, `expiresAt`, `paidAt`, `createdAt`, quan hệ tới `User`)
- [X] T004 Chạy `npx prisma migrate dev --name add-order` rồi `npx prisma generate`; xác
      nhận `npm run build` vẫn xanh trước khi sang task tiếp theo
- [X] T005 [P] Tạo `lib/payos.ts`: khởi tạo và export singleton `PayOS` client đọc
      `PAYOS_CLIENT_ID`/`PAYOS_API_KEY`/`PAYOS_CHECKSUM_KEY` từ `process.env`, throw lỗi
      rõ ràng lúc khởi tạo nếu thiếu biến môi trường nào
- [X] T006 Tạo `lib/orders.ts`: hàm `getLatestOrder(userId)` (server-only, dùng
      `prisma.order.findFirst` sắp `createdAt desc`) — phụ thuộc kiểu `Order` sinh ra từ
      T004

**Checkpoint**: Schema, PayOS client, và hàm đọc order gần nhất đã sẵn sàng — có thể bắt
đầu Phase 3

---

## Phase 3: User Story 1 - Thanh toán và tự động mở khóa (Priority: P1) 🎯 MVP

**Goal**: Học viên tạo đơn hàng, thấy QR PayOS thật, thanh toán xong được mở khóa tự động
qua webhook đã xác thực chữ ký, không cần duyệt tay.

**Independent Test**: Đăng nhập tài khoản chưa thanh toán → vào `/thanh-toan` → bấm thanh
toán → thấy QR thật → chuyển khoản thật (hoặc webhook test của PayOS) → tài khoản mở khóa
trong dưới 1 phút, không thao tác thủ công nào từ người vận hành. (= Kịch bản 1 + 2 trong
`quickstart.md`)

### Implementation for User Story 1

- [X] T007 [P] [US1] Tạo `app/api/webhook/payos/route.ts` theo đúng
      `contracts/payos-webhook.md`: đọc raw body → `payos.webhooks.verify()` → nếu lỗi
      trả `400` và không đổi DB; nếu hợp lệ, tìm `Order` theo `payosOrderCode`, nếu không
      thấy hoặc đã `paid` thì no-op trả `200`; nếu `pending` thì trong một
      `prisma.$transaction` cập nhật `Order.status="paid"` + `Order.paidAt` +
      `User.paidAt`; ghi log tối thiểu (mã đơn hàng, thời điểm, kết quả) cho mọi lượt gọi
- [X] T008 [US1] Thêm action `createPayOSOrder` vào `lib/actions/payment.ts`: xác thực
      session, chặn nếu `user.paidAt` đã có (FR-010), sinh `payosOrderCode` bằng
      `Date.now()`, gọi `payos.paymentRequests.create({ orderCode, amount: 299000,
      description, returnUrl, cancelUrl })`, lưu `Order` mới với dữ liệu trả về
      (`checkoutUrl`, `qrCode`, `paymentLinkId`, `expiresAt`), `revalidatePath("/thanh-toan")`;
      xoá hoàn toàn action `markAsPaid` cũ trong cùng file
- [X] T009 [US1] Viết lại `app/(app)/thanh-toan/page.tsx`: dùng `getLatestOrder` (T006)
      thay vì chỉ đọc `user.paidAt`; nếu đã `paid` giữ nguyên UI hiện có; nếu chưa có order
      hoặc order gần nhất ở trạng thái cuối, hiện nút gọi `createPayOSOrder`; nếu có order
      `pending` còn hạn, hiển thị `qrCode`/`checkoutUrl` của chính order đó kèm trạng thái
      "đang chờ thanh toán"
- [X] T010 [US1] Đăng ký webhook URL production với PayOS (`payos.webhooks.confirm(url)`
      chạy một lần qua script tạm hoặc PayOS dashboard) — việc của chủ dự án, cần domain
      Vercel thật + credentials thật, không thực hiện thay bằng giá trị giả

**Checkpoint**: Kịch bản 1 và 2 trong `quickstart.md` chạy được đầu-cuối bằng giao dịch
PayOS thật.

---

## Phase 4: User Story 2 - Theo dõi trạng thái đơn hàng đang chờ (Priority: P2)

**Goal**: Học viên rời trang rồi quay lại vẫn thấy đúng trạng thái đơn hàng, không bị tạo
trùng đơn khi bấm thanh toán nhiều lần.

**Independent Test**: Tạo order, không thanh toán, rời trang rồi quay lại `/thanh-toan` —
thấy lại đúng order đang chờ, không có order thứ hai được tạo. (= Kịch bản 6 trong
`quickstart.md`)

### Implementation for User Story 2

- [X] T011 [US2] Bổ sung guard trong `createPayOSOrder` (`lib/actions/payment.ts`): trước
      khi gọi PayOS, kiểm tra `getLatestOrder(userId)` — nếu đang `pending` và chưa quá
      `expiresAt`, trả về chính order đó thay vì tạo order/payment link mới (đáp ứng
      FR-009)
- [X] T012 [P] [US2] Xử lý query param `?status=success|cancelled` trên
      `app/(app)/thanh-toan/page.tsx` chỉ để hiển thị thông điệp tạm thời ("đang xác nhận
      thanh toán…"/"đã huỷ, thử lại") — không dùng query param để tự đổi trạng thái order
      hay `paidAt` (trạng thái thật luôn đọc lại từ DB qua `getLatestOrder`/`user.paidAt`)

**Checkpoint**: Kịch bản 6 trong `quickstart.md` pass — bấm thanh toán nhiều lần không
tạo nhiều order.

---

## Phase 5: User Story 3 - Xử lý đơn hàng hết hạn hoặc bị huỷ (Priority: P3)

**Goal**: Đơn hàng "chết" (hết hạn hoặc bị huỷ) không chặn đường thanh toán lại.

**Independent Test**: Có order `pending` đã quá hạn (hoặc bị huỷ) → vào `/thanh-toan` →
hệ thống báo rõ đơn cũ hết hiệu lực và cho tạo order mới, hoàn tất thanh toán bình
thường. (= Kịch bản 5 trong `quickstart.md`)

### Implementation for User Story 3

- [X] T013 [US3] Thêm phát hiện hết hạn trong `lib/orders.ts` hoặc trực tiếp trong
      `app/(app)/thanh-toan/page.tsx`: nếu order gần nhất `pending` nhưng
      `expiresAt < now`, coi như hết hạn cho mục đích hiển thị/cho phép tạo mới (cập nhật
      `status="expired"` trong DB theo kiểu best-effort, không bắt buộc phải thành công để
      luồng UI hoạt động đúng)
- [X] T014 [P] [US3] Xử lý trường hợp PayOS báo huỷ giao dịch trong
      `app/api/webhook/payos/route.ts`: nếu payload webhook thể hiện trạng thái huỷ cho
      một `Order` đang `pending`, cập nhật `Order.status="cancelled"` (không đụng
      `User.paidAt`)

**Checkpoint**: Kịch bản 5 trong `quickstart.md` pass — tạo lại order mới sau khi order cũ
hết hạn/huỷ, thanh toán order mới thành công như Phase 3.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Dọn dẹp luồng demo cũ, hoàn thiện tài liệu vận hành, xác nhận toàn bộ luồng

- [X] T015 [P] Rà soát toàn repo (`grep -rn "markAsPaid"`) xác nhận không còn tham chiếu
      nào tới action demo cũ; xoá nhắc tới "thanh toán demo/giả lập" khỏi
      `.specify/memory/constitution.md` Nguyên tắc VI nếu đoạn đó mô tả nó như trạng thái
      hiện tại (nay không còn đúng)
- [X] T016 [P] Cập nhật `README.md`: hướng dẫn lấy `PAYOS_CLIENT_ID`/`PAYOS_API_KEY`/
      `PAYOS_CHECKSUM_KEY` và bước đăng ký webhook URL trong phần "Bắt đầu"
- [X] T017 Chạy đủ 6 kịch bản trong `quickstart.md`, xác nhận `npm run build` xanh, commit,
      deploy Vercel; nhắc chủ dự án tự thêm 3 biến môi trường PayOS thật trên Vercel
      (Production/Preview/Development) trước khi deploy production — không dán giá trị
      thật vào chat/commit

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Không phụ thuộc gì — bắt đầu ngay
- **Foundational (Phase 2)**: Phụ thuộc Phase 1 xong — CHẶN toàn bộ user story
- **User Story 1 (Phase 3)**: Phụ thuộc Phase 2 xong — đây là MVP, làm trước
- **User Story 2 (Phase 4)**: Phụ thuộc Phase 3 xong (sửa cùng action `createPayOSOrder`
  và cùng trang `/thanh-toan` mà US1 vừa tạo — không độc lập hoàn toàn về mặt code dù độc
  lập về mặt kiểm thử hành vi)
- **User Story 3 (Phase 5)**: Phụ thuộc Phase 3 xong (sửa cùng webhook route và trang
  thanh toán); độc lập với Phase 4
- **Polish (Phase 6)**: Phụ thuộc mọi story muốn có đã xong

### Parallel Opportunities

- T001, T002 (Phase 1) — khác file, chạy song song
- T005, T006 (Phase 2) — khác file, chạy song song sau T004
- T007 (webhook route) độc lập file với T008/T009 — có thể làm song song trong Phase 3
- T012 (Phase 4) và T014 (Phase 5) — khác file với các task còn lại trong phase của
  chúng, có thể làm song song với task tuần tự khác nếu có nhiều người/agent
- T015, T016 (Phase 6) — khác file, chạy song song

---

## Implementation Strategy

### MVP trước (User Story 1)

1. Xong Phase 1 → Phase 2 (nền tảng bắt buộc)
2. Xong Phase 3 (User Story 1) — đây đã là một luồng thanh toán thật hoạt động đầu-cuối
3. **DỪNG lại và xác nhận**: chạy Kịch bản 1+2 trong `quickstart.md` bằng giao dịch thật
   trước khi làm tiếp — đây là phần liên quan tới tiền thật, không vội sang story sau
4. Có thể deploy MVP ở đây nếu chấp nhận rủi ro nhỏ về double-order khi bấm nhanh (US2)
   và không xử lý hết hạn (US3) — không khuyến khích, nhưng về mặt kỹ thuật story 1 đã đủ
   để thu tiền đúng và mở khóa đúng

### Giao hàng tăng dần

1. Setup + Foundational → nền tảng sẵn sàng
2. + User Story 1 → kiểm thử độc lập → đây là MVP thật sự dùng được
3. + User Story 2 → kiểm thử độc lập → chống tạo đơn trùng
4. + User Story 3 → kiểm thử độc lập → chống bị kẹt ở đơn hết hạn
5. + Polish → dọn luồng demo cũ, xác nhận đầy đủ, deploy

---

## Notes

- `[P]` = khác file, không phụ thuộc task chưa xong khác
- `[US#]` = gắn task với user story tương ứng trong `spec.md`
- Không có task viết test tự động (dự án chưa có test suite) — `quickstart.md` là căn cứ
  xác nhận thay thế, chạy ở T017
- Commit sau mỗi phase hoặc nhóm task liên quan, không gộp toàn bộ 17 task vào một commit
- Không task nào được phép hardcode `PAYOS_CLIENT_ID`/`PAYOS_API_KEY`/`PAYOS_CHECKSUM_KEY`
  hay dán giá trị thật vào code/commit/chat — luôn qua biến môi trường

## Ghi chú triển khai thực tế (sau khi implement)

- **T014 lệch so với mô tả ban đầu**: đọc type definition thật của `@payos/node` cho thấy
  webhook PayOS **chỉ bắn cho sự kiện thanh toán thành công**, không có sự kiện "huỷ" đẩy
  về. Đã đổi hướng: `lib/orders.ts#syncOrderStatus` gọi `payos.paymentRequests.get()`
  (server-to-server, đáng tin cậy như webhook) khi học viên tải lại `/thanh-toan` với đơn
  đang `pending`, để lấy trạng thái thật (kể cả `CANCELLED`/`EXPIRED`) thay vì chờ một
  webhook không tồn tại. Route webhook không có code xử lý "cancelled" riêng — không cần
  thiết nữa.
- **T010 và phần đăng ký webhook thật, phần điền `PAYOS_CLIENT_ID`/`PAYOS_API_KEY`/
  `PAYOS_CHECKSUM_KEY` thật vào Vercel + local `.env`, và toàn bộ 6 kịch bản trong
  `quickstart.md` cần giao dịch PayOS thật**: chưa thực hiện — nằm ngoài khả năng của
  agent (cần tài khoản/credentials thật của chủ dự án). Đã chuẩn bị sẵn
  `scripts/register-payos-webhook.ts` để chạy một lần sau khi có domain + credentials
  thật.
- `npm run build` đã xanh với toàn bộ code mới (T017 phần build). Phần deploy + chạy
  quickstart bằng giao dịch thật do chủ dự án thực hiện sau khi điền credentials.
