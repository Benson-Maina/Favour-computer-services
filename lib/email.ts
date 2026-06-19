import { Resend } from "resend";
import { business } from "@/lib/data";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? `Favour Computer Services <orders@${new URL(business.siteUrl).hostname}>`;

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
};

export async function sendTransactionalEmail(input: EmailInput) {
  const resend = getResendClient();
  if (!resend) {
    console.warn("Email sending skipped - Resend client not available", { to: input.to, subject: input.subject });
    return { skipped: true };
  }

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      ...input
    });

    if (result.error) {
      console.error("Email send error:", result.error);
    } else {
      console.log("Email sent successfully:", { messageId: result.data?.id, to: input.to });
    }

    return result;
  } catch (e) {
    console.error("Email send exception:", e);
    throw e;
  }
}

export function adminEmailHtml(title: string, body: string) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#0f172a">
      <h1 style="font-size:20px">${title}</h1>
      <p>${body}</p>
      <p style="font-size:13px;color:#64748b">${business.name}<br>${business.location}</p>
    </div>
  `;
}
