---
description: "Task list for SePay + Lead capture + Resend email"
---

# Tasks: Chuyển sang SePay, thu thập lead và email xác nhận

**Input**: Design documents from `/specs/003-sepay-lead-email/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Không có test suite tự động (như feature 002) — `quickstart.md` là căn cứ xác
nhận thủ công, chạy ở T022.

**Organization**: Task nhóm theo user story trong `spec.md`.

## Path Conventions

Next.js App Router, một project duy nhất tại repo root.

---

## Phase 1: Setup

- [ ] T001 Gỡ `@payos/node` (`npm uninstall @payos/node`), cài `resend`
      (`npm install resend`)
- [ ] T002 [P] Sửa `.env.example`: xoá `PAYOS_CLIENT_ID`/`PAYOS_API_KEY`/
      `PAYOS_CHECKSUM_KEY`; thêm `SEPAY_WEBHOOK_API_KEY`, `SEPAY_USER_API_TOKEN`,
      `SEPAY_BANK_ACCOUNT`, `SEPAY_BANK_NAME`, `RESEND_API_KEY`, `EMAIL_FROM`

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: Không bắt đầu Phase 3+ khi Phase này chưa xong

- [ ] T003 Sửa `prisma/schema.prisma`: model `Order` — đổi `payosOrderCode` (Int) thành
      `orderCode` (String, unique), đổi `checkoutUrl` thành `qrImageUrl`, xoá `qrCode` và
      `paymentLinkId`, bỏ giá trị `"cancelled"` khỏi các nơi enum-comment nếu có; thêm
      model `Lead` mới đúng `data-model.md` (`userId` unique, `phone`, `pharmacyName`,
      `surveyRole`, `surveyChallenge`, `createdAt`)
- [ ] T004 Chạy `npx prisma migrate dev --name sepay-and-lead` rồi `npx prisma generate`;
      xác nhận không còn lỗi type ở các file cũ dùng field PayOS (sẽ sửa ở Phase 3)
- [ ] T005 [P] Tạo `lib/sepay.ts`: hàm `buildQrImageUrl(orderCode, amount)` (dựng URL theo
      `research.md`), hàm `findMatchingSepayTransaction(orderCode, amount)` gọi
      `GET https://my.sepay.vn/userapi/transactions/list?account_number=...&limit=20` với
      header `Authorization: Bearer SEPAY_USER_API_TOKEN`, trả về giao dịch khớp hoặc
      `null`
- [ ] T006 [P] Tạo `lib/leads.ts`: hàm `getLeadForUser(userId)`
      (`prisma.lead.findUnique({ where: { userId } })`)
- [ ] T007 [P] Tạo `lib/email.ts`: khởi tạo `Resend` client (đọc `RESEND_API_KEY`), hàm
      `sendChallengeConfirmationEmail(user: { email: string; name: string })` gửi qua
      `resend.emails.send()` với `from`, `to`, `subject`, `html` tiếng Việt kèm link
      `${APP_URL}/lo-trinh`
- [ ] T008 Sửa `lib/orders.ts`: hàm `generatePayosOrderCode` → `generateOrderCode` (đổi
      sang sinh chuỗi `"CATLIEU" + ...`); `confirmOrderPaid` nhận `orderCode: string` thay
      vì `number`, sau khi transaction cập nhật `paidAt` thành công thì gọi
      `sendChallengeConfirmationEmail` trong try/catch riêng (lỗi chỉ log, không throw);
      `syncOrderStatus` thay lệnh gọi PayOS bằng `findMatchingSepayTransaction` (T005), bỏ
      nhánh xử lý `"cancelled"` (không còn áp dụng), giữ nhánh hết hạn theo `expiresAt`

**Checkpoint**: Schema, helper SePay/email/lead đã sẵn sàng — có thể bắt đầu Phase 3

---

## Phase 3: User Story 1 - Thanh toán qua SePay và tự động mở khóa (Priority: P1) 🎯 MVP

**Goal**: Học viên điền Lead, thấy QR SePay thật, thanh toán xong được mở khóa tự động qua
webhook đã xác thực API Key.

**Independent Test**: Đăng nhập tài khoản chưa thanh toán/chưa có Lead → vào
`/thanh-toan` → điền form → thấy QR thật → chuyển khoản thật → mở khóa trong dưới 2 phút,
không thao tác thủ công. (= Kịch bản 1, 2, 3 trong `quickstart.md`)

### Implementation for User Story 1

- [ ] T009 [P] [US1] Xoá `app/api/webhook/payos/route.ts`, `lib/payos.ts`,
      `scripts/register-payos-webhook.ts`
- [ ] T010 [P] [US1] Tạo `app/api/webhook/sepay/route.ts` đúng
      `contracts/sepay-webhook.md`: xác thực header `Authorization: Apikey ...` bằng so
      sánh timing-safe → sai thì trả `401` không đọc body; bỏ qua `transferType !== "in"`;
      tìm `orderCode` từ `code` hoặc regex trong `content`; không tìm thấy → no-op `200`;
      tìm thấy `Order` `pending` và `transferAmount === order.amount` → gọi
      `confirmOrderPaid` (đã tự gửi email từ T008); log tối thiểu mỗi lượt gọi; trả
      `{ success: true }` theo đúng quy ước SePay
- [ ] T011 [US1] Tạo `components/payment/LeadForm.tsx` (client component,
      `useActionState`): input SĐT, tên nhà thuốc, radio/select 4 lựa chọn `surveyRole`,
      textarea `surveyChallenge`, hiển thị lỗi validate theo trường
- [ ] T012 [US1] Tạo `lib/actions/lead.ts`: server action `saveLead` validate 4 trường bắt
      buộc, `prisma.lead.create(...)`, coi trùng unique constraint là thành công (idempotent),
      `revalidatePath("/thanh-toan")`
- [ ] T013 [US1] Sửa `lib/actions/payment.ts`: đổi `createPayOSOrder` thành
      `createSepayOrder` — bỏ toàn bộ gọi `getPayOS()`, dùng `generateOrderCode` (T008) +
      `buildQrImageUrl` (T005) để tạo `Order` (`qrImageUrl`, `expiresAt = now + 30 phút`),
      thêm tiền điều kiện chặn nếu chưa có `Lead`
- [ ] T014 [US1] Viết lại `app/(app)/thanh-toan/page.tsx`: thêm bước kiểm tra `getLeadForUser`
      trước bước Order — chưa có thì render `LeadForm`, có rồi mới vào nhánh Order/QR như
      cũ (đổi `checkoutUrl`→`qrImageUrl`, đổi text nhắc "PayOS" nếu còn sót)

**Checkpoint**: Kịch bản 1, 2, 3 trong `quickstart.md` chạy được đầu-cuối bằng giao dịch
SePay thật.

---

## Phase 4: User Story 2 - Nhận email xác nhận tự động (Priority: P2)

**Goal**: Học viên nhận email xác nhận trong vòng 5 phút sau khi mở khóa, lỗi gửi email
không ảnh hưởng việc mở khóa.

**Independent Test**: Hoàn tất một giao dịch thật (hoặc trigger `confirmOrderPaid` thủ
công) — xác nhận hộp thư nhận được email đúng nội dung, link hoạt động. (= Kịch bản 3
trong `quickstart.md`, phần email)

**Lưu ý**: Phần lớn logic gửi email đã được xây trong Phase 2 (T007) và nối dây trong T008
vì nó là một phần không thể tách rời của hàm `confirmOrderPaid` dùng chung cho cả webhook
lẫn đối chiếu dự phòng. Phase này tập trung xác nhận nội dung email và tính không chặn.

### Implementation for User Story 2

- [ ] T015 [US2] Hoàn thiện nội dung HTML email trong `lib/email.ts`: lời chào theo tên,
      xác nhận thanh toán thành công, nút/link rõ ràng tới `${APP_URL}/lo-trinh`, giọng
      điệu tiếng Việt chuyên nghiệp nhất quán phần còn lại sản phẩm
- [ ] T016 [P] [US2] Rà soát `confirmOrderPaid` (`lib/orders.ts`) xác nhận lỗi từ
      `sendChallengeConfirmationEmail` bị bắt trong try/catch riêng, không propagate lên
      làm hỏng transaction đã commit hay response của route webhook

**Checkpoint**: Kịch bản 3 (phần email) và Kịch bản 4 (không gửi trùng) trong
`quickstart.md` pass.

---

## Phase 5: User Story 3 - Đơn hết hạn và đối chiếu khi quay lại (Priority: P3)

**Goal**: Đơn hết hạn cho tạo mới không bắt điền lại Lead; đối chiếu dự phòng khi webhook
trễ/mất.

**Independent Test**: Đơn `pending` quá hạn → vào `/thanh-toan` → báo hết hạn, tạo lại
được, không hỏi lại Lead. Giao dịch đã chuyển khoản nhưng webhook chưa tới → tải lại trang
→ tự phát hiện và mở khóa qua đối chiếu API. (= Kịch bản 6, 7 trong `quickstart.md`)

### Implementation for User Story 3

- [ ] T017 [US3] Xác nhận `app/(app)/thanh-toan/page.tsx` gọi `syncOrderStatus` (đã sửa ở
      T008) mỗi khi render với order đang `pending`, và nhánh "đơn cũ hết hạn" hiển thị
      đúng thông báo + nút tạo mới mà không render lại `LeadForm` (vì Lead đã tồn tại từ
      trước, độc lập với vòng đời Order)
- [ ] T018 [P] [US3] Rà soát toàn bộ UI (`components/payment/*`, trang thanh toán) không
      còn nhánh nào tham chiếu trạng thái `"cancelled"` (đã bỏ khỏi model theo T003) —
      xoá nhánh code/text tương ứng còn sót từ feature 002

**Checkpoint**: Kịch bản 6, 7 trong `quickstart.md` pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T019 [P] Cập nhật `README.md`: thay hướng dẫn "Kết nối thanh toán PayOS" bằng hướng
      dẫn SePay (cấu hình tiền tố mã thanh toán, webhook API Key, Transactions API token)
      + Resend (xác minh domain, API key)
- [ ] T020 [P] Cập nhật `.specify/memory/constitution.md` nếu có đoạn nào nhắc PayOS như
      cổng thanh toán hiện tại (Nguyên tắc IV/VI từ lần cập nhật trước) — sửa thành SePay,
      bump version PATCH theo đúng quy tắc Governance
- [ ] T021 Rà soát toàn repo (`grep -rn "payos\|PayOS"` không tính thư mục `specs/`) xác
      nhận không còn import/nhắc tới PayOS trong code thật
- [ ] T022 Chạy đủ 7 kịch bản trong `quickstart.md`, xác nhận `npm run build` xanh, commit,
      deploy Vercel; nhắc chủ dự án tự thêm 6 biến môi trường mới trên Vercel trước khi
      deploy production — không dán giá trị thật vào chat/commit

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** → **Foundational (Phase 2)**: chặn toàn bộ user story
- **User Story 1 (Phase 3)**: phụ thuộc Phase 2 — MVP, làm trước
- **User Story 2 (Phase 4)**: phụ thuộc Phase 3 (dùng chung `confirmOrderPaid`/webhook vừa
  tạo) — phần lõi đã có sẵn từ Phase 2/3, phase này chủ yếu hoàn thiện nội dung
- **User Story 3 (Phase 5)**: phụ thuộc Phase 3 (sửa cùng trang thanh toán và
  `syncOrderStatus` đã có từ Phase 2)
- **Polish (Phase 6)**: phụ thuộc mọi story muốn có đã xong

### Parallel Opportunities

- T001, T002 (Phase 1) — khác file
- T005, T006, T007 (Phase 2) — khác file, sau T004
- T009, T010 (Phase 3) — khác file (xoá code cũ vs tạo route mới)
- T016 (Phase 4), T018 (Phase 5) — khác file với task tuần tự khác trong phase
- T019, T020 (Phase 6) — khác file

---

## Implementation Strategy

### MVP trước (User Story 1)

1. Setup + Foundational
2. User Story 1 — đã là luồng thanh toán SePay thật hoạt động đầu-cuối kèm gửi email (vì
   email nằm trong `confirmOrderPaid` dùng chung từ Phase 2)
3. **DỪNG và xác nhận** bằng giao dịch ngân hàng thật trước khi làm tiếp — liên quan tiền
   thật

### Giao hàng tăng dần

1. Setup + Foundational → nền tảng sẵn sàng
2. + User Story 1 → MVP thật sự dùng được (bao gồm cả email vì dùng chung code)
3. + User Story 2 → hoàn thiện nội dung/độ tin cậy của email
4. + User Story 3 → chống kẹt đơn hết hạn, dự phòng webhook trễ
5. + Polish → dọn PayOS cũ, cập nhật tài liệu, deploy

---

## Notes

- `[P]` = khác file, không phụ thuộc task chưa xong khác
- `[US#]` = gắn task với user story tương ứng trong `spec.md`
- Không có task viết test tự động — `quickstart.md` là căn cứ xác nhận, chạy ở T022
- Commit theo từng phase hoặc nhóm task liên quan
- Không hardcode `SEPAY_WEBHOOK_API_KEY`/`SEPAY_USER_API_TOKEN`/`RESEND_API_KEY` hay dán
  giá trị thật vào code/commit/chat — luôn qua biến môi trường
