"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin-auth";
import { business } from "@/lib/data";
import { adminEmailHtml, sendTransactionalEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { bookingSchema, checkoutSchema, contactSchema, inventoryAdjustmentSchema, newsletterSchema, orderStatusSchema, paymentReviewSchema, productAdminSchema, productLifecycleSchema } from "@/lib/validation";

type ActionState = { ok: boolean; message: string; orderId?: string };

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitContact(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    name: getString(formData, "name"),
    email: getString(formData, "email"),
    phone: getString(formData, "phone"),
    subject: getString(formData, "subject"),
    message: getString(formData, "message")
  });

  if (!parsed.success) return { ok: false, message: "Please check the contact form details." };
  try {
    const supabase = createAdminClient();
    if (supabase) {
      const { error } = await supabase.from("contact_inquiries").insert(parsed.data);
      if (error) return { ok: false, message: "We could not save your inquiry. Please try again or contact us on WhatsApp." };
    }
    await sendTransactionalEmail({
      to: process.env.ADMIN_EMAIL ?? business.email,
      subject: `New contact inquiry: ${parsed.data.subject}`,
      html: adminEmailHtml("New contact form submission", `${parsed.data.name} (${parsed.data.phone}) wrote: ${parsed.data.message}`)
    });
    return { ok: true, message: `Thank you. Your inquiry has been sent to ${business.email}.` };
  } catch {
    return { ok: false, message: "Something went wrong while sending your inquiry. Please try again." };
  }
}

export async function submitBooking(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = bookingSchema.safeParse({
    service: getString(formData, "service"),
    name: getString(formData, "name"),
    email: getString(formData, "email"),
    phone: getString(formData, "phone"),
    preferredDate: getString(formData, "preferredDate"),
    message: getString(formData, "message")
  });

  if (!parsed.success) return { ok: false, message: "Please check the booking details." };
  const supabase = createAdminClient();
  if (supabase) await supabase.from("bookings").insert({ ...parsed.data, status: "new" });
  await sendTransactionalEmail({
    to: parsed.data.email,
    subject: "Booking request received",
    html: adminEmailHtml("Booking confirmation", `We received your ${parsed.data.service} booking request and will contact you to confirm details.`)
  });
  revalidatePath("/admin");
  return { ok: true, message: "Booking request received. We will contact you to confirm details." };
}

export async function subscribeNewsletter(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = newsletterSchema.safeParse({ email: getString(formData, "email") });
  if (!parsed.success) return { ok: false, message: "Enter a valid email address." };
  const supabase = createAdminClient();
  if (supabase) await supabase.from("newsletter_subscribers").upsert(parsed.data, { onConflict: "email" });
  await sendTransactionalEmail({
    to: parsed.data.email,
    subject: "Welcome to Favour Computer Services updates",
    html: adminEmailHtml("Newsletter welcome", "You are subscribed to product, repair, CCTV, and technology service updates.")
  });
  return { ok: true, message: "You are subscribed to Favour Computer Services updates." };
}

export async function submitCheckout(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = checkoutSchema.safeParse({
    name: getString(formData, "name"),
    email: getString(formData, "email"),
    phone: getString(formData, "phone"),
    deliveryMethod: getString(formData, "deliveryMethod"),
    address: getString(formData, "address"),
    notes: getString(formData, "notes"),
    items: getString(formData, "items"),
    paymentReference: getString(formData, "paymentReference")
  });

  if (!parsed.success) return { ok: false, message: "Please complete the checkout details." };
  const orderId = getString(formData, "orderId") || crypto.randomUUID();
  const parsedItems = JSON.parse(parsed.data.items) as Array<{ productId?: string; id?: string; name: string; quantity: number; price?: number; unitPrice?: number }>;
  const total = parsedItems.reduce((sum, item) => sum + Number(item.price ?? item.unitPrice ?? 0) * Number(item.quantity), 0);

  try {
    const supabase = createAdminClient();
    if (supabase) {
      const { error: orderError } = await supabase.from("orders").insert({
        id: orderId,
        customer_name: parsed.data.name,
        customer_email: parsed.data.email,
        customer_phone: parsed.data.phone,
        delivery_method: parsed.data.deliveryMethod,
        shipping_address: parsed.data.address,
        notes: parsed.data.notes,
        payment_reference: parsed.data.paymentReference,
        items_snapshot: parsedItems,
        status: "payment_submitted",
        payment_status: "pending_verification",
        total
      });
      if (orderError) return { ok: false, message: "We could not create your order. Please try again." };

      await supabase.from("order_items").insert(parsedItems.map((item) => ({
        order_id: orderId,
        product_id: item.productId ?? item.id,
        quantity: item.quantity,
        unit_price: Number(item.price ?? item.unitPrice ?? 0)
      })));

      await supabase.from("payments").insert({
        order_id: orderId,
        amount: total,
        paybill_number: business.paybill,
        account_number: business.account,
        transaction_code: parsed.data.paymentReference,
        status: "pending_verification",
        verified: false,
        rejected: false
      });
      await supabase.from("order_timeline").insert([
        { order_id: orderId, label: "Order Created", actor_name: parsed.data.name },
        { order_id: orderId, label: "Payment Submitted", actor_name: parsed.data.name }
      ]);
      await supabase.from("invoices").insert({
        invoice_number: `FCS-INV-${orderId.slice(0, 8).toUpperCase()}`,
        order_id: orderId,
        customer_name: parsed.data.name,
        items: parsedItems,
        subtotal: total,
        tax: 0,
        total,
        payment_status: "pending_verification"
      });
    }

    revalidatePath("/admin");
    await sendTransactionalEmail({
      to: parsed.data.email,
      subject: "Order placed successfully",
      html: adminEmailHtml("Order placed successfully", `Your order ${orderId} has been submitted. We will verify Paybill reference ${parsed.data.paymentReference} and update you.`)
    });
    return { ok: true, message: "Order placed successfully", orderId };
  } catch {
    return { ok: false, message: "Checkout failed. Please review your details and try again." };
  }
}

export async function adjustInventory(_: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("inventory:write");
  const parsed = inventoryAdjustmentSchema.safeParse({
    productId: getString(formData, "productId"),
    change: getString(formData, "change"),
    reason: getString(formData, "reason"),
    actor: getString(formData, "actor") || "Admin"
  });

  if (!parsed.success) return { ok: false, message: "Enter a valid inventory adjustment." };
  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("inventory_movements").insert({
      product_id: parsed.data.productId,
      quantity_change: parsed.data.change,
      reason: parsed.data.reason,
      actor_name: parsed.data.actor
    });
    await supabase.rpc("adjust_product_stock", {
      product_id_input: parsed.data.productId,
      stock_change_input: parsed.data.change
    });
    await supabase.rpc("log_audit", {
      action_input: "Inventory Change",
      entity_input: parsed.data.productId,
      details_input: `${parsed.data.change} units: ${parsed.data.reason}`,
      user_name_input: parsed.data.actor
    });
  }
  revalidatePath("/admin");
  return { ok: true, message: "Inventory adjustment recorded." };
}

export async function updateOrderStatus(_: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("orders:write");
  const parsed = orderStatusSchema.safeParse({
    orderId: getString(formData, "orderId"),
    status: getString(formData, "status"),
    note: getString(formData, "note"),
    notifyCustomer: formData.get("notifyCustomer") === "on"
  });

  if (!parsed.success) return { ok: false, message: "Choose a valid order status." };
  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("orders").update({ status: parsed.data.status }).eq("id", parsed.data.orderId);
    await supabase.from("order_timeline").insert({
      order_id: parsed.data.orderId,
      label: `Status changed to ${parsed.data.status}`,
      actor_name: "Admin"
    });
    if (parsed.data.status === "cancelled") {
      await supabase.rpc("restore_stock_for_cancelled_order", { order_id_input: parsed.data.orderId });
    }
    if (parsed.data.note) {
      await supabase.from("order_notes").insert({
        order_id: parsed.data.orderId,
        note: parsed.data.note,
        notify_customer: parsed.data.notifyCustomer ?? false
      });
    }
    await supabase.rpc("log_audit", {
      action_input: "Order Updated",
      entity_input: parsed.data.orderId,
      details_input: `Status changed to ${parsed.data.status}`,
      user_name_input: "Admin"
    });
  }
  revalidatePath("/admin");
  return { ok: true, message: "Order status updated." };
}

export async function reviewPayment(_: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("payments:write");
  const parsed = paymentReviewSchema.safeParse({
    paymentId: getString(formData, "paymentId"),
    orderId: getString(formData, "orderId"),
    action: getString(formData, "action"),
    rejectionReason: getString(formData, "rejectionReason"),
    actor: getString(formData, "actor") || "Admin"
  });

  if (!parsed.success) return { ok: false, message: "Payment review is incomplete." };
  const supabase = createAdminClient();
  if (supabase) {
    const verified = parsed.data.action === "verify";
    await supabase
      .from("payments")
      .update({
        verified,
        rejected: !verified,
        status: verified ? "approved" : "rejected",
        rejection_reason: verified ? null : parsed.data.rejectionReason,
        verified_at: verified ? new Date().toISOString() : null
      })
      .eq("id", parsed.data.paymentId);
    await supabase.from("payment_logs").insert({
      payment_id: parsed.data.paymentId,
      order_id: parsed.data.orderId,
      action: verified ? "verified" : "rejected",
      note: parsed.data.rejectionReason,
      actor_name: parsed.data.actor
    });
    if (verified) {
      await supabase.from("orders").update({ status: "payment_verified", payment_status: "approved" }).eq("id", parsed.data.orderId);
      await supabase.rpc("reduce_stock_for_paid_order", { order_id_input: parsed.data.orderId });
      await supabase.rpc("generate_receipt_for_order", { order_id_input: parsed.data.orderId });
    } else {
      await supabase.from("orders").update({ payment_status: "rejected" }).eq("id", parsed.data.orderId);
    }
    await supabase.from("order_timeline").insert({
      order_id: parsed.data.orderId,
      label: verified ? "Payment Approved" : "Payment Rejected",
      actor_name: parsed.data.actor
    });
  }
  revalidatePath("/admin");
  return { ok: true, message: parsed.data.action === "verify" ? "Payment verified." : "Payment rejected with reason." };
}

export async function saveProduct(_: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("products:write");
  const parsed = productAdminSchema.safeParse({
    name: getString(formData, "name"),
    slug: getString(formData, "slug"),
    sku: getString(formData, "sku"),
    brand: getString(formData, "brand"),
    category: getString(formData, "category"),
    description: getString(formData, "description"),
    specifications: getString(formData, "specifications"),
    images: getString(formData, "images"),
    price: getString(formData, "price"),
    costPrice: getString(formData, "costPrice") || undefined,
    salePrice: getString(formData, "salePrice") || undefined,
    stock: getString(formData, "stock"),
    featured: formData.get("featured") === "on",
    availabilityStatus: getString(formData, "availabilityStatus") || "active",
    productCondition: getString(formData, "productCondition") || "new",
    warranty: getString(formData, "warranty"),
    newArrival: formData.get("newArrival") === "on",
    lowStockThreshold: getString(formData, "lowStockThreshold") || "3",
    supplierName: getString(formData, "supplierName"),
    supplierContact: getString(formData, "supplierContact")
  });

  if (!parsed.success) return { ok: false, message: "Product details are incomplete." };
  const supabase = createAdminClient();
  if (supabase) {
    let specs: Record<string, unknown> = {};
    try {
      specs = parsed.data.specifications ? JSON.parse(parsed.data.specifications) : {};
    } catch {
      return { ok: false, message: "Specifications must be valid JSON." };
    }
    await supabase.from("products").upsert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      sku: parsed.data.sku,
      description: parsed.data.description,
      condition: parsed.data.productCondition,
      status: parsed.data.availabilityStatus,
      cost_price: parsed.data.costPrice ?? 0,
      price: parsed.data.price,
      sale_price: parsed.data.salePrice,
      stock: parsed.data.stock,
      low_stock_threshold: parsed.data.lowStockThreshold,
      specs,
      images: parsed.data.images ? parsed.data.images.split("\n").filter(Boolean) : [],
      featured: parsed.data.featured ?? false,
      new_arrival: parsed.data.newArrival ?? false,
      warranty: parsed.data.warranty,
      supplier_name: parsed.data.supplierName,
      supplier_contact: parsed.data.supplierContact
    }, { onConflict: "slug" });
    await supabase.rpc("log_audit", {
      action_input: "Product Saved",
      entity_input: parsed.data.sku,
      details_input: `${parsed.data.name} saved with status ${parsed.data.availabilityStatus}`,
      user_name_input: "Admin"
    });
  }
  revalidatePath("/admin");
  revalidatePath("/shop");
  return { ok: true, message: "Product saved." };
}

export async function updateProductLifecycle(_: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("products:write");
  const parsed = productLifecycleSchema.safeParse({
    productId: getString(formData, "productId"),
    action: getString(formData, "action")
  });
  if (!parsed.success) return { ok: false, message: "Invalid product action." };

  const supabase = createAdminClient();
  if (supabase) {
    if (parsed.data.action === "delete") await supabase.from("products").delete().eq("id", parsed.data.productId);
    if (parsed.data.action === "archive") await supabase.from("products").update({ status: "archived", archived_at: new Date().toISOString() }).eq("id", parsed.data.productId);
    if (parsed.data.action === "restore") await supabase.from("products").update({ status: "active", archived_at: null }).eq("id", parsed.data.productId);
    if (parsed.data.action === "duplicate") {
      const { data: product } = await supabase.from("products").select("*").eq("id", parsed.data.productId).single();
      if (product) {
        const copy = { ...product, id: crypto.randomUUID(), sku: `${product.sku}-COPY`, slug: `${product.slug}-copy`, name: `${product.name} Copy`, status: "draft", created_at: new Date().toISOString() };
        await supabase.from("products").insert(copy);
      }
    }
    await supabase.rpc("log_audit", {
      action_input: "Product Lifecycle",
      entity_input: parsed.data.productId,
      details_input: `Product action: ${parsed.data.action}`,
      user_name_input: "Admin"
    });
  }
  revalidatePath("/admin");
  revalidatePath("/shop");
  return { ok: true, message: "Product action completed." };
}
