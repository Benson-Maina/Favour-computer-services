import { Resend } from "resend";
import { business } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? `Favour Computer Services <orders@${new URL(business.siteUrl).hostname}>`;
export const adminNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL ?? "bensonmurage254@gmail.com";

export function getResendClient() {
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not configured in environment variables");
    return null;
  }
  return new Resend(resendApiKey);
}

type EmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  eventType?: string;
  referenceId?: string;
};

type DetailValue = string | number | null | undefined;
type EmailSection = {
  title: string;
  rows: Array<[string, DetailValue]>;
};

async function logEmailDelivery(input: EmailInput, status: "sent" | "failed" | "skipped", providerMessageId?: string, errorMessage?: string) {
  const supabase = createAdminClient();
  if (!supabase) return;

  const { error } = await supabase.from("email_delivery_logs").insert({
    event_type: input.eventType ?? "transactional",
    recipient: Array.isArray(input.to) ? input.to.join(", ") : input.to,
    subject: input.subject,
    reference_id: input.referenceId,
    status,
    provider_message_id: providerMessageId,
    error_message: errorMessage
  });

  if (error) console.error("Email delivery log error:", error);
}

export async function sendTransactionalEmail(input: EmailInput) {
  const resend = getResendClient();
  if (!resend) {
    console.warn("Email sending skipped - Resend client not available", { to: input.to, subject: input.subject });
    await logEmailDelivery(input, "skipped", undefined, "RESEND_API_KEY is not configured");
    return { skipped: true };
  }

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: input.to,
      subject: input.subject,
      html: input.html
    });

    if (result.error) {
      console.error("Email send error:", result.error);
      await logEmailDelivery(input, "failed", undefined, result.error.message);
    } else {
      console.log("Email sent successfully:", { messageId: result.data?.id, to: input.to });
      await logEmailDelivery(input, "sent", result.data?.id);
    }

    return result;
  } catch (e) {
    console.error("Email send exception:", e);
    await logEmailDelivery(input, "failed", undefined, e instanceof Error ? e.message : "Unknown email error");
    throw e;
  }
}

export function adminEmailHtml(title: string, body: string, sections: EmailSection[] = [], adminLink?: string) {
  const rows = sections.map((section) => `
    <div style="margin-top:20px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
      <div style="background:#f8fafc;padding:10px 14px;font-weight:700">${escapeHtml(section.title)}</div>
      <table style="width:100%;border-collapse:collapse">
        ${section.rows.filter(([, value]) => value !== undefined && value !== null && value !== "").map(([label, value]) => `
          <tr>
            <td style="width:38%;padding:10px 14px;border-top:1px solid #e2e8f0;color:#475569;font-size:13px">${escapeHtml(label)}</td>
            <td style="padding:10px 14px;border-top:1px solid #e2e8f0;font-size:13px">${escapeHtml(String(value))}</td>
          </tr>
        `).join("")}
      </table>
    </div>
  `).join("");

  return `
    <div style="margin:0;background:#f8fafc;padding:24px;font-family:Inter,Arial,sans-serif;line-height:1.5;color:#0f172a">
      <div style="margin:0 auto;max-width:680px;border-radius:10px;background:#ffffff;padding:28px;border:1px solid #e2e8f0">
        <p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#2563eb">${business.name}</p>
        <h1 style="margin:0 0 12px;font-size:24px;line-height:1.2">${escapeHtml(title)}</h1>
        <p style="margin:0;color:#334155">${escapeHtml(body)}</p>
        ${rows}
        ${adminLink ? `<p style="margin-top:22px"><a href="${escapeHtml(adminLink)}" style="display:inline-block;border-radius:6px;background:#0f172a;color:#ffffff;padding:10px 14px;text-decoration:none;font-weight:700">Open admin record</a></p>` : ""}
        <p style="margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px;font-size:13px;color:#64748b">${business.name}<br>${business.location}<br>${business.phone} | ${business.email}</p>
      </div>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
