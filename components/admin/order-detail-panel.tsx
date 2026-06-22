"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { generateOrderReceipt, reviewPayment, updateOrderStatus } from "@/app/actions";
import { AdminSelect } from "@/components/admin/admin-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { orderStatusLabels, orderStatuses } from "@/lib/admin-analytics";
import type { OrderNoteRecord, OrderTimelineEntry } from "@/lib/admin-data";
import type { Order, Payment } from "@/lib/types";

type OrderDetailPanelProps = {
  order: Order;
  payment: Payment | null;
  timeline: OrderTimelineEntry[];
  notes: OrderNoteRecord[];
  canWriteOrders: boolean;
  canWritePayments: boolean;
};

export function OrderDetailPanel({
  order,
  payment,
  timeline,
  notes,
  canWriteOrders,
  canWritePayments
}: OrderDetailPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function runAction(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  }

  function updateStatus(status: string, note?: string, notifyCustomer?: boolean) {
    const formData = new FormData();
    formData.set("orderId", order.id);
    formData.set("status", status);
    if (note) formData.set("note", note);
    if (notifyCustomer) formData.set("notifyCustomer", "on");
    runAction(() => updateOrderStatus({ ok: false, message: "" }, formData));
  }

  function reviewPaymentAction(action: "verify" | "reject", rejectionReason?: string) {
    if (!payment) return;
    const formData = new FormData();
    formData.set("paymentId", payment.id);
    formData.set("orderId", order.id);
    formData.set("action", action);
    if (rejectionReason) formData.set("rejectionReason", rejectionReason);
    formData.set("actor", "Admin");
    runAction(() => reviewPayment({ ok: false, message: "" }, formData));
  }

  function generateReceipt() {
    const formData = new FormData();
    formData.set("orderId", order.id);
    runAction(() => generateOrderReceipt({ ok: false, message: "" }, formData));
  }

  return (
    <div className="space-y-6">
      {canWriteOrders ? (
        <div className="rounded-lg border border-border p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Order actions</p>
          <div className="flex flex-wrap gap-2">
            <AdminSelect
              defaultValue={order.status}
              className="h-9 min-w-[160px] text-sm"
              disabled={pending}
              onChange={(event) => updateStatus(event.target.value)}
            >
              {orderStatuses.map((status) => (
                <option key={status} value={status}>{orderStatusLabels[status]}</option>
              ))}
            </AdminSelect>
            <Button size="sm" variant="outline" disabled={pending} onClick={() => updateStatus("ready_for_pickup", "Your order is ready for pickup.", true)}>
              Mark Pickup Ready
            </Button>
            <Button size="sm" variant="outline" disabled={pending} onClick={() => updateStatus("delivered", "Your order has been delivered.", true)}>
              Mark Delivered
            </Button>
            <Button size="sm" variant="outline" disabled={pending} onClick={generateReceipt}>
              Generate Receipt
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/admin/orders/${order.id}?print=1`} target="_blank">Print Receipt</Link>
            </Button>
          </div>
          <form
            className="mt-4 grid gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              updateStatus(order.status, String(formData.get("note") ?? ""), formData.get("notifyCustomer") === "on");
            }}
          >
            <Textarea name="note" placeholder="Add internal note (optional)" rows={2} disabled={pending} />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="notifyCustomer" className="size-4 rounded border-input" />
              Notify customer with note
            </label>
            <Button type="submit" size="sm" variant="secondary" disabled={pending}>Add Note</Button>
          </form>
        </div>
      ) : null}

      {canWritePayments && payment && !payment.verified && !payment.rejected ? (
        <div className="rounded-lg border border-border p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Payment review</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={pending} onClick={() => reviewPaymentAction("verify")}>Approve Payment</Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={pending}
              onClick={() => {
                const reason = prompt("Rejection reason (optional)") ?? "";
                reviewPaymentAction("reject", reason);
              }}
            >
              Reject Payment
            </Button>
            {payment.confirmationUrl ? (
              <Button asChild size="sm" variant="outline">
                <a href={payment.confirmationUrl} target="_blank" rel="noopener noreferrer">View Screenshot</a>
              </Button>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Reference: {payment.transactionCode}</p>
        </div>
      ) : payment ? (
        <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
          Payment: {payment.verified ? "Verified" : payment.rejected ? "Rejected" : "Pending review"}
          {payment.rejectionReason ? ` — ${payment.rejectionReason}` : null}
        </div>
      ) : null}

      {notes.length ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Notes</p>
          <div className="space-y-2">
            {notes.map((note) => (
              <div key={note.id} className="rounded-md border border-border p-3 text-sm">
                <p>{note.note}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(note.createdAt).toLocaleString()}
                  {note.notifyCustomer ? " · Customer notified" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {timeline.length ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Timeline</p>
          <ol className="space-y-2">
            {timeline.map((entry) => (
              <li key={entry.id} className="flex gap-3 text-sm">
                <span className="text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</span>
                <span className="text-foreground">{entry.label}</span>
                <span className="text-muted-foreground">({entry.actorName})</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
