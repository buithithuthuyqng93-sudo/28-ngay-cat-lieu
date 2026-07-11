import "server-only";
import { Resend } from "resend";

let client: Resend | undefined;

function getResend(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("Missing required environment variable: RESEND_API_KEY");
    client = new Resend(apiKey);
  }
  return client;
}

function appUrl(path: string) {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}

export async function sendChallengeConfirmationEmail(user: { email: string; name: string }) {
  const from = process.env.EMAIL_FROM ?? "noreply@duocsithuthuy.com";
  const roadmapUrl = appUrl("/lo-trinh");

  const { error } = await getResend().emails.send({
    from: `28 Ngày Cắt Liều <${from}>`,
    to: user.email,
    subject: "Xác nhận tham gia 28 Ngày Thử Thách Cắt Liều",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #10241b;">
        <h2 style="color: #158a53;">Chào ${escapeHtml(user.name)},</h2>
        <p>Cảm ơn bạn đã thanh toán và tham gia <strong>28 Ngày Thử Thách Cắt Liều</strong>!
        Toàn bộ chương trình đã được mở khóa cho tài khoản của bạn.</p>
        <p style="margin: 24px 0;">
          <a href="${roadmapUrl}"
             style="background: #158a53; color: #fff; padding: 12px 20px; border-radius: 10px;
                    text-decoration: none; font-weight: 600; display: inline-block;">
            Vào lộ trình học ngay
          </a>
        </p>
        <p>Chúc bạn học tốt và tự tin hơn mỗi ngày tại quầy thuốc!</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">
          Email này được gửi tự động vì bạn vừa hoàn tất thanh toán trên 28 Ngày Cắt Liều.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
