"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin-auth";
import { business } from "@/lib/data";
import { adminEmailHtml, sendTransactionalEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { bookingSchema, checkoutSchema, contactSchema, inventoryAdjustmentSchema, newsletterSchema, orderStatusSchema, paymentReviewSchema, productAdminSchema, productLifecycleSchema } from "@/lib/validation";

type ActionState = { 
  ok: boolean; 
  message: string; 
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryMethod?: string;
  shippingAddress?: string;
  notes?: string;
  paymentReference?: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function uploadStorageFile(bucket: string, folder: string, file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return null;
  const supabase = createAdminClient();
  if (!supabase) return null;

  const extension = file.name.split(".").pop() || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    console.error(`${bucket} storage upload error:`, error);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function submitContact(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    name: getString(formData, "name"),
    email: getString(formData, "email"),
    phone: getString(formData, "phone"),
    subject: getString(formData, "subject"),
    message: getString(formData, "message")
  });

  if (!parsed.success) {
    console.warn("Contact form validation failed:", parsed.error.flatten());
    return { ok: false, message: "Please check the contact form details." };
  }

  try {
    const supabase = createAdminClient();
    if (supabase) {
      const { error } = await supabase.from("contact_inquiries").insert(parsed.data);
      if (error) {
        console.error("Contact inquiry save error:", error);
        return { ok: false, message: "We could not save your inquiry. Please try again or contact us on WhatsApp." };
      }
    } else {
      console.warn("Supabase admin client unavailable for contact inquiry");
    }

    await sendTransactionalEmail({
      to: process.env.ADMIN_EMAIL ?? business.email,
      subject: `New contact inquiry: ${parsed.data.subject}`,
      html: adminEmailHtml("New contact form submission", `${parsed.data.name} (${parsed.data.phone}) wrote: ${parsed.data.message}`)
    });
    
    return { ok: true, message: `Thank you. Your inquiry has been sent to ${business.email}.` };
  } catch (e) {
    console.error("Contact form submission error:", e);
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

  if (!parsed.success) {
    console.warn("Booking form validation failed:", parsed.error.flatten());
    return { ok: false, message: "Please check the booking details." };
  }

  try {
    const supabase = createAdminClient();
    if (supabase) {
      const { error } = await supabase.from("bookings").insert({ ...parsed.data, status: "new" });
      if (error) {
        console.error("Booking save error:", error);
        return { ok: false, message: "We could not save your booking. Please try again." };
      }
    } else {
      console.warn("Supabase admin client unavailable for booking");
    }

    await sendTransactionalEmail({
      to: parsed.data.email,
      subject: "Booking request received",
      html: adminEmailHtml("Booking confirmation", `We received your ${parsed.data.service} booking request and will contact you to confirm details.`)
    });
    
    revalidatePath("/admin");
    return { ok: true, message: "Booking request received. We will contact you to confirm details." };
  } catch (e) {
    console.error("Booking submission error:", e);
    return { ok: false, message: "Something went wrong while submitting your booking. Please try again." };
  }
}

export async function subscribeNewsletter(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = newsletterSchema.safeParse({ email: getString(formData, "email") });
  if (!parsed.success) {
    console.warn("Newsletter subscription validation failed");
    return { ok: false, message: "Enter a valid email address." };
  }

  try {
    const supabase = createAdminClient();
    if (supabase) {
      const { error } = await supabase.from("newsletter_subscribers").upsert(parsed.data, { onConflict: "email" });
      if (error) {
        console.error("Newsletter subscription save error:", error);
        return { ok: false, message: "Failed to subscribe. Please try again." };
      }
    } else {
      console.warn("Supabase admin client unavailable for newsletter subscription");
    }

    await sendTransactionalEmail({
      to: parsed.data.email,
      subject: "Welcome to Favour Computer Services updates",
      html: adminEmailHtml("Newsletter welcome", "You are subscribed to product, repair, CCTV, and technology service updates.")
    });
    
    return { ok: true, message: "You are subscribed to Favour Computer Services updates." };
  } catch (e) {
    console.error("Newsletter subscription error:", e);
    return { ok: false, message: "Something went wrong while subscribing. Please try again." };
  }
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
  
  // Safely parse items with error handling
  let parsedItems;
  try {
    parsedItems = JSON.parse(parsed.data.items) as Array<{ productId?: string; id?: string; name: string; quantity: number; price?: number; unitPrice?: number }>;
    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      return { ok: false, message: "Your cart is empty. Add products before checkout." };
    }
  } catch (e) {
    console.error("Cart items JSON parse error:", e);
    return { ok: false, message: "Invalid cart data. Please refresh and try again." };
  }
  
  const total = parsedItems.reduce((sum, item) => sum + Number(item.price ?? item.unitPrice ?? 0) * Number(item.quantity), 0);

  try {
    const supabase = createAdminClient();
    if (!supabase) {
      console.error("Supabase admin client unavailable");
      return { ok: false, message: "Service unavailable. Please try again." };
    }

    const serverSupabase = await createClient();
    const { data: userData } = serverSupabase ? await serverSupabase.auth.getUser() : { data: { user: null } };
    const paymentProof = await uploadStorageFile("payments", `orders/${orderId}`, formData.get("paymentScreenshot"));

    if (userData.user && parsed.data.address) {
      await supabase.from("addresses").insert({
        user_id: userData.user.id,
        label: parsed.data.deliveryMethod,
        recipient_name: parsed.data.name,
        phone: parsed.data.phone,
        address_line: parsed.data.address,
        city: "Nairobi",
        is_default: false
      });
    }

    // Create order record
    const { error: orderError, data: orderData } = await supabase.from("orders").insert({
      id: orderId,
      user_id: userData.user?.id,
      customer_name: parsed.data.name,
      customer_email: parsed.data.email,
      customer_phone: parsed.data.phone,
      delivery_method: parsed.data.deliveryMethod,
      shipping_address: parsed.data.address,
      notes: parsed.data.notes,
      payment_reference: parsed.data.paymentReference,
      payment_screenshot_url: paymentProof?.publicUrl,
      items_snapshot: parsedItems,
      status: "payment_submitted",
      payment_status: "pending_verification",
      total
    }).select().single();
    
    if (orderError) {
      console.error("Order creation error:", orderError);
      return { ok: false, message: "Failed to create order. Please try again." };
    }

    // Create order items records
    const { error: itemsError } = await supabase.from("order_items").insert(parsedItems.map((item) => ({
      order_id: orderId,
      product_id: item.productId ?? item.id,
      quantity: item.quantity,
      unit_price: Number(item.price ?? item.unitPrice ?? 0)
    })));
    
    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      // Don't fail - order is created, items might retry
    }

    // Create payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: orderId,
      amount: total,
      paybill_number: business.paybill,
      account_number: business.account,
      transaction_code: parsed.data.paymentReference,
      confirmation_url: paymentProof?.publicUrl,
      status: "pending_verification",
      verified: false,
      rejected: false
    });
    
    if (paymentError) {
      console.error("Payment record creation error:", paymentError);
    }

    // Create timeline entries
    const { error: timelineError } = await supabase.from("order_timeline").insert([
      { order_id: orderId, label: "Order Created", actor_name: parsed.data.name },
      { order_id: orderId, label: "Payment Submitted", actor_name: parsed.data.name }
    ]);
    
    if (timelineError) {
      console.error("Timeline creation error:", timelineError);
    }

    // Create invoice record
    const { error: invoiceError } = await supabase.from("invoices").insert({
      invoice_number: `FCS-INV-${orderId.slice(0, 8).toUpperCase()}`,
      order_id: orderId,
      customer_name: parsed.data.name,
      items: parsedItems,
      subtotal: total,
      tax: 0,
      total,
      payment_status: "pending_verification"
    });
    
    if (invoiceError) {
      console.error("Invoice creation error:", invoiceError);
    }

    revalidatePath("/admin");
    
    // Send confirmation email
    try {
      await sendTransactionalEmail({
        to: parsed.data.email,
        subject: "Order placed successfully",
        html: adminEmailHtml("Order placed successfully", `Your order ${orderId} has been submitted. We will verify Paybill reference ${parsed.data.paymentReference} and update you.`)
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // Don't fail the checkout if email fails
    }

    return { 
      ok: true, 
      message: "Order placed successfully", 
      orderId,
      customerName: parsed.data.name,
      customerEmail: parsed.data.email,
      customerPhone: parsed.data.phone,
      deliveryMethod: parsed.data.deliveryMethod,
      shippingAddress: parsed.data.address,
      notes: parsed.data.notes,
      paymentReference: parsed.data.paymentReference
    };
  } catch (e) {
    console.error("Checkout error:", e);
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

  if (!parsed.success) {
    console.warn("Inventory adjustment validation failed:", parsed.error.flatten());
    return { ok: false, message: "Enter a valid inventory adjustment." };
  }

  try {
    const supabase = createAdminClient();
    if (!supabase) {
      console.error("Supabase admin client unavailable for inventory adjustment");
      return { ok: false, message: "Service unavailable. Please try again." };
    }

    const { error: movementError } = await supabase.from("inventory_movements").insert({
      product_id: parsed.data.productId,
      quantity_change: parsed.data.change,
      reason: parsed.data.reason,
      actor_name: parsed.data.actor
    });
    
    if (movementError) {
      console.error("Inventory movement save error:", movementError);
      return { ok: false, message: "Failed to record inventory movement." };
    }

    const { error: stockError } = await supabase.rpc("adjust_product_stock", {
      product_id_input: parsed.data.productId,
      stock_change_input: parsed.data.change
    });
    
    if (stockError) {
      console.error("Stock adjustment RPC error:", stockError);
    }

    const { error: auditError } = await supabase.rpc("log_audit", {
      action_input: "Inventory Change",
      entity_input: parsed.data.productId,
      details_input: `${parsed.data.change} units: ${parsed.data.reason}`,
      user_name_input: parsed.data.actor
    });
    
    if (auditError) {
      console.error("Audit log error:", auditError);
    }

    revalidatePath("/admin");
    return { ok: true, message: "Inventory adjustment recorded." };
  } catch (e) {
    console.error("Inventory adjustment error:", e);
    return { ok: false, message: "Failed to adjust inventory. Please try again." };
  }
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
    const categorySlug = slugify(parsed.data.category);
    const brandSlug = slugify(parsed.data.brand);
    const [{ data: category }, { data: brand }] = await Promise.all([
      supabase.from("categories").upsert({ name: parsed.data.category, slug: categorySlug }, { onConflict: "slug" }).select("id").single(),
      supabase.from("brands").upsert({ name: parsed.data.brand, slug: brandSlug }, { onConflict: "slug" }).select("id").single()
    ]);
    const imageUrls = parsed.data.images ? parsed.data.images.split("\n").map((item) => item.trim()).filter(Boolean) : [];
    const uploadedImages = await Promise.all(
      formData
        .getAll("productImages")
        .map((file) => uploadStorageFile("products", parsed.data.slug, file))
    );
    const uploadedUrls = uploadedImages.map((image) => image?.publicUrl).filter((url): url is string => Boolean(url));
    const images = [...imageUrls, ...uploadedUrls];

    const { data: savedProduct, error: productError } = await supabase.from("products").upsert({
      category_id: category?.id,
      brand_id: brand?.id,
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
      images,
      featured: parsed.data.featured ?? false,
      new_arrival: parsed.data.newArrival ?? false,
      warranty: parsed.data.warranty,
      supplier_name: parsed.data.supplierName,
      supplier_contact: parsed.data.supplierContact
    }, { onConflict: "slug" }).select("id").single();
    if (productError) {
      console.error("Product save error:", productError);
      return { ok: false, message: "Product could not be saved." };
    }
    if (savedProduct?.id && images.length) {
      await supabase.from("product_images").delete().eq("product_id", savedProduct.id);
      await supabase.from("product_images").insert(images.map((url, index) => ({
        product_id: savedProduct.id,
        storage_path: url,
        public_url: url,
        alt_text: parsed.data.name,
        sort_order: index,
        is_primary: index === 0
      })));
    }
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
