# Phase 0 Research: PayOS integration

## Decision: Dùng SDK chính thức `@payos/node` thay vì tự gọi REST API

**Rationale**: SDK cung cấp sẵn `paymentRequests.create()`, `webhooks.verify()`,
`webhooks.confirm()`, tự xử lý việc build/verify chữ ký HMAC-SHA256 đúng chuẩn PayOS —
giảm rủi ro tự cài sai thuật toán ký (một lỗi ở đây có thể dẫn tới mở khóa nhầm hoặc từ
chối nhầm). Yêu cầu Node.js 20+, dự án đã dùng Node 24 (local + Vercel) nên không có rào
cản.

**Alternatives considered**: Tự gọi REST API PayOS bằng `fetch` + tự build HMAC-SHA256 —
bị loại vì tăng bề mặt lỗi bảo mật không cần thiết cho một thao tác SDK đã làm sẵn và có
bảo trì chính thức.

Nguồn: [github.com/payOSHQ/payos-lib-node](https://github.com/payOSHQ/payos-lib-node),
[payos.vn/docs/sdks/back-end/node](https://payos.vn/docs/sdks/back-end/node/)

## Decision: Khởi tạo PayOS client

```ts
import { PayOS } from "@payos/node";

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID!,
  apiKey: process.env.PAYOS_API_KEY!,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
});
```

Ba biến môi trường lấy từ kênh thanh toán PayOS đã tạo (chủ dự án cung cấp qua Vercel env
vars + `.env` local, không hardcode).

## Decision: Tạo payment link qua `paymentRequests.create()`

```ts
const link = await payos.paymentRequests.create({
  orderCode, // number, duy nhất trong tài khoản PayOS — dùng timestamp-based integer
  amount: 299000,
  description, // PayOS giới hạn ngắn (~25 ký tự) — dùng dạng "CATLIEU <8 ký tự cuối id>"
  returnUrl, // https://.../thanh-toan?status=success
  cancelUrl, // https://.../thanh-toan?status=cancelled
});
// link.checkoutUrl  -> trang thanh toán PayOS lưu trữ (dùng làm nút "Mở trang thanh toán")
// link.qrCode       -> chuỗi dữ liệu QR VietQR (render bằng thư viện QR phía client, hoặc
//                      hiển thị qua <img> nếu SDK trả sẵn URL ảnh — xác nhận lại field
//                      thực tế khi implement bằng cách đọc .d.ts của package đã cài)
// link.paymentLinkId, link.orderCode, link.status cũng có trong response
```

**orderCode**: PayOS yêu cầu số nguyên duy nhất trong phạm vi tài khoản, không phải
UUID/cuid. Dùng `Date.now()` (mili-giây, luôn tăng dần, đủ nhỏ để nằm trong an toàn số
nguyên JS) làm `orderCode`, lưu song song với `Order.id` (cuid) nội bộ — `Order.id` là
khóa chính/khóa dùng trong toàn bộ app, `orderCode` chỉ dùng để giao tiếp với PayOS và
đối chiếu khi webhook trả về.

**description**: PayOS giới hạn độ dài mô tả tương đối ngắn — xác nhận giới hạn chính
xác (dường như quanh 25 ký tự) khi implement bằng cách thử tạo link thật với chủ dự án;
nếu quá dài PayOS trả lỗi validation rõ ràng, không phải lỗi âm thầm, nên rủi ro thấp.

Nguồn: [github.com/payOSHQ/payos-lib-node](https://github.com/payOSHQ/payos-lib-node)

## Decision: Xác thực webhook bằng `payos.webhooks.verify(payload)`

Payload PayOS gửi tới webhook (đã xác nhận qua tài liệu chính thức
[payos.vn/docs/du-lieu-tra-ve/webhook](https://payos.vn/docs/du-lieu-tra-ve/webhook/)):

```json
{
  "code": "00",
  "desc": "success",
  "success": true,
  "data": {
    "orderCode": 123,
    "amount": 299000,
    "description": "CATLIEU ab12cd34",
    "accountNumber": "...",
    "reference": "...",
    "transactionDateTime": "2026-07-11 10:00:00",
    "currency": "VND",
    "paymentLinkId": "...",
    "code": "00",
    "desc": "Thành công",
    "counterAccountBankId": "",
    "counterAccountBankName": "",
    "counterAccountName": "",
    "counterAccountNumber": ""
  },
  "signature": "..."
}
```

`payos.webhooks.verify(body)` tự kiểm tra chữ ký (HMAC-SHA256 trên các field của `data`
sắp xếp alphabet, key `checksumKey`) và trả về `data` đã xác thực, hoặc throw nếu chữ ký
sai. Route Handler MUST bọc trong try/catch: chữ ký sai → trả về response lỗi (4xx), MUST
KHÔNG update bất kỳ bản ghi nào (đúng FR-004).

**Lưu ý quan trọng**: khi đăng ký webhook URL qua `payos.webhooks.confirm(url)`, PayOS có
thể gửi một request kiểm tra tới chính URL đó ngay lúc đăng ký/hoặc gọi thử để xác nhận
endpoint sống. Route Handler phải trả 2xx cho mọi payload có chữ ký hợp lệ dù `orderCode`
không khớp bản ghi nào trong DB (coi là no-op an toàn, KHÔNG phải lỗi) — tránh vòng lặp
retry vô ích từ PayOS. Chỉ chữ ký KHÔNG hợp lệ mới bị từ chối bằng mã lỗi khác 2xx.

Nguồn:
[payos.vn/docs/tich-hop-webhook/kiem-tra-du-lieu-voi-signature](https://payos.vn/docs/tich-hop-webhook/kiem-tra-du-lieu-voi-signature/)

## Decision: Idempotency khi xử lý webhook

`Order` có trường `status`. Route Handler xử lý theo pattern "claim-then-act" trong một
Prisma transaction:

```ts
await prisma.$transaction(async (tx) => {
  const order = await tx.order.findUnique({ where: { payosOrderCode } });
  if (!order || order.status === "paid") return; // no-op: không tồn tại hoặc đã xử lý rồi
  await tx.order.update({ where: { id: order.id }, data: { status: "paid", paidAt: now } });
  await tx.user.update({ where: { id: order.userId }, data: { paidAt: now } });
});
```

Vì điều kiện `order.status === "paid"` được kiểm tra và cập nhật trong cùng transaction,
hai request webhook trùng lặp chạy gần như đồng thời vẫn an toàn nhờ transaction isolation
của Postgres — request thứ hai sẽ thấy `status` đã là `"paid"` sau khi request đầu commit
(hoặc bị serialize chờ) và trở thành no-op. Đáp ứng FR-005/SC-003.

## Decision: Không thêm bảng `Payment` riêng — dùng một model `Order` duy nhất

**Rationale**: Đúng theo Nguyên tắc IV constitution (YAGNI) — vòng đời "một lần mua" của
sản phẩm này (đang chờ → đã thanh toán/hết hạn/huỷ) biểu diễn đủ bằng một bảng. Không cần
tách riêng "Payment attempt" khỏi "Order" vì không có khái niệm nhiều lần thử thanh toán
cho một order (mỗi order chỉ có một payment link tương ứng 1-1 phía PayOS).

**Alternatives considered**: Bảng `Payment` riêng tham chiếu `Order` — bị loại vì thêm độ
phức tạp không cần thiết cho phạm vi hiện tại (một mức giá, một lần mua, không có
subscription).

## Decision: Trạng thái "hết hạn" (expired) được suy ra, không cần cron job

**Rationale**: PayOS tự đặt thời hạn hiệu lực cho link (mặc định của PayOS, theo
Assumptions của spec). Thay vì chạy job nền để quét & cập nhật `status = "expired"`, trang
`/thanh-toan` khi tải sẽ tự kiểm tra: nếu order đang "pending" nhưng đã quá thời hạn dự
kiến (lưu `expiredAt` trả về từ PayOS lúc tạo link, hoặc gọi `payos.paymentRequests.get()`
để lấy trạng thái mới nhất nếu cần chính xác tuyệt đối), coi như hết hạn và cho tạo order
mới — không cần hạ tầng job nền cho một sản phẩm quy mô nhỏ.

**Alternatives considered**: Cron job/queue quét trạng thái định kỳ — bị loại vì vượt quá
nhu cầu thực tế (constitution Nguyên tắc IV) và Vercel serverless không có tiến trình nền
thường trực miễn phí phù hợp cho việc này.

## Tổng kết — không còn NEEDS CLARIFICATION

Toàn bộ mục "NEEDS CLARIFICATION" tiềm ẩn trong Technical Context đã được giải quyết ở
trên bằng tài liệu chính thức của PayOS. Điểm duy nhất cần xác nhận lại bằng thực nghiệm
lúc implement (không chặn việc lập kế hoạch): field ảnh QR chính xác trong response của
`paymentRequests.create()` (`qrCode` là chuỗi dữ liệu VietQR cần tự render thành ảnh, hay
đã là URL ảnh) — xác nhận bằng cách đọc type definition của package đã cài
(`node_modules/@payos/node`) khi implement, đã ghi lại thành một task riêng.
