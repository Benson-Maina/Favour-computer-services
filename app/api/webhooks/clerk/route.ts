import { headers } from "next/headers";
import { Webhook } from "svix";
import type { UserJSON, WebhookEvent } from "@clerk/nextjs/server";
import { softDeleteClerkUser, syncClerkUserFromWebhook } from "@/lib/user-sync";

function mapWebhookUser(data: UserJSON) {
  return {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    email_addresses: data.email_addresses?.map((entry) => ({ email_address: entry.email_address })),
    phone_numbers: data.phone_numbers?.map((entry) => ({ phone_number: entry.phone_number }))
  };
}

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await request.text();
  const wh = new Webhook(webhookSecret);

  let event: WebhookEvent;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature
    }) as WebhookEvent;
  } catch (error) {
    console.error("Clerk webhook verification failed:", error);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  try {
    if (event.type === "user.created" || event.type === "user.updated") {
      await syncClerkUserFromWebhook(mapWebhookUser(event.data));
    }

    if (event.type === "user.deleted" && event.data.id) {
      await softDeleteClerkUser(event.data.id);
    }
  } catch (error) {
    console.error(`Clerk webhook handler failed for ${event.type}:`, error);
    return new Response("Webhook handler error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
