import nodemailer from "nodemailer";
import { business } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

const fromEmail =
  process.env.GMAIL_FROM_EMAIL ??
  (gmailUser ? `Favour Computer Services <${gmailUser}>` : `Favour Computer Services <noreply@favourcomputerservices.co.ke>`);

export const adminNotificationEmail =
  process.env.ADMIN_NOTIFICATION_EMAIL ??
  process.env.ADMIN_EMAIL ??
  "bensonmurage254@gmail.com";

let cachedTransporter: nodemailer.Transporter | null = null;
let connectionVerified = false;

function missingMailConfigMessage() {
  return "GMAIL_USER or GMAIL_APP_PASSWORD is not configured";
}

// ---------------------------------------------------------------------------
// Nodemailer transporter (Gmail SMTP – port 465, secure TLS)
// ---------------------------------------------------------------------------

export function getMailTransporter() {
  if (!gmailUser || !gmailAppPassword) {
    console.warn(`${missingMailConfigMessage()} in environment variables`);
    return null;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      },
      pool: true,
      maxConnections: 3,
      socketTimeout: 15000,
      greetingTimeout: 10000
    });
  }

  return cachedTransporter;
}

export async function verifyMailConnection() {
  const transporter = getMailTransporter();
  if (!transporter) {
    throw new Error(missingMailConfigMessage());
  }

  await transporter.verify();
  connectionVerified = true;
  return true;
}

async function ensureMailConnection(transporter: nodemailer.Transporter) {
  if (connectionVerified) return;
  await transporter.verify();
  connectionVerified = true;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Delivery logging (unchanged)
// ---------------------------------------------------------------------------

async function logEmailDelivery(
  input: EmailInput,
  status: "sent" | "failed" | "skipped",
  providerMessageId?: string,
  errorMessage?: string
) {
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

// ---------------------------------------------------------------------------
// Core send function — same signature as before
// ---------------------------------------------------------------------------

export async function sendTransactionalEmail(input: EmailInput) {
  const transporter = getMailTransporter();

  if (!transporter) {
    const message = missingMailConfigMessage();
    console.warn("Email sending skipped – Gmail transporter not available", {
      to: input.to,
      subject: input.subject
    });
    await logEmailDelivery(input, "skipped", undefined, message);
    throw new Error(message);
  }

  try {
    await ensureMailConnection(transporter);

    const info = await transporter.sendMail({
      from: fromEmail,
      to: Array.isArray(input.to) ? input.to.join(", ") : input.to,
      subject: input.subject,
      html: input.html
    });

    console.log("Email sent successfully:", {
      messageId: info.messageId,
      to: input.to
    });
    await logEmailDelivery(input, "sent", info.messageId);

    return { data: { id: info.messageId }, error: null };
  } catch (e) {
    connectionVerified = false;
    const message = e instanceof Error ? e.message : "Unknown email error";
    console.error("Email send error:", e);
    await logEmailDelivery(input, "failed", undefined, message);
    throw e instanceof Error ? e : new Error(message);
  }
}

// ---------------------------------------------------------------------------
// HTML template builder (preserved exactly)
// ---------------------------------------------------------------------------

export function adminEmailHtml(
  title: string,
  body: string,
  sections: EmailSection[] = [],
  adminLink?: string
) {
  const rows = sections
    .map(
      (section) => `
    <div style="margin-top:20px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
      <div style="background:#f8fafc;padding:10px 14px;font-weight:700">${escapeHtml(section.title)}</div>
      <table style="width:100%;border-collapse:collapse">
        ${section.rows
          .filter(
            ([, value]) =>
              value !== undefined && value !== null && value !== ""
          )
          .map(
            ([label, value]) => `
          <tr>
            <td style="width:38%;padding:10px 14px;border-top:1px solid #e2e8f0;color:#475569;font-size:13px">${escapeHtml(label)}</td>
            <td style="padding:10px 14px;border-top:1px solid #e2e8f0;font-size:13px">${escapeHtml(String(value))}</td>
          </tr>
        `
          )
          .join("")}
      </table>
    </div>
  `
    )
    .join("");

  return `
    <div style="margin:0;background:#f8fafc;padding:24px;font-family:Inter,Arial,sans-serif;line-height:1.5;color:#0f172a">
      <div style="margin:0 auto;max-width:680px;border-radius:10px;background:#ffffff;padding:28px;border:1px solid #e2e8f0">
        <p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#2563eb">${business.name}</p>
        <h1 style="margin:0 0 12px;font-size:24px;line-height:1.2">${escapeHtml(title)}</h1>
        <p style="margin:0;color:#334155">${escapeHtml(body)}</p>
        ${rows}
        ${
          adminLink
            ? `<p style="margin-top:22px"><a href="${escapeHtml(adminLink)}" style="display:inline-block;border-radius:6px;background:#0f172a;color:#ffffff;padding:10px 14px;text-decoration:none;font-weight:700">Open admin record</a></p>`
            : ""
        }
        <p style="margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px;font-size:13px;color:#64748b">${business.name}<br>${business.location}<br>${business.phone} | ${business.email}</p>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// HTML escape utility (preserved exactly)
// ---------------------------------------------------------------------------

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
