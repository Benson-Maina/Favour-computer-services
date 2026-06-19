"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Boxes, CalendarCheck, CheckCircle2, CreditCard, Newspaper, PackagePlus, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ActionForm } from "@/components/action-form-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adjustInventory, reviewPayment, saveProduct, updateOrderStatus, updateProductLifecycle } from "@/app/actions";
import { orderStatusLabels, orderStatuses } from "@/lib/admin-analytics";
import { formatCurrency } from "@/lib/utils";
import type { AdminActivity, Booking, ChartPoint, InventoryAlert, Order, Payment, PaymentLog, Product } from "@/lib/types";

type DashboardProps = {
  metrics: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    processingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    completedOrders: number;
    totalCustomers: number;
    totalProducts: number;
    submittedPayments: number;
    lowStockProducts: number;
    outOfStockProducts: number;
  };
  revenueChart: ChartPoint[];
  ordersChart: ChartPoint[];
  customerGrowthChart: ChartPoint[];
  productPerformanceChart: ChartPoint[];
  products: Product[];
  orders: Order[];
  payments: Payment[];
  paymentLogs: PaymentLog[];
  bookings: Booking[];
  inventoryAlerts: InventoryAlert[];
  activities: AdminActivity[];
};

const widgetIcons = [TrendingUp, ShoppingBag, AlertTriangle, Boxes, CheckCircle2, AlertTriangle, Boxes, AlertTriangle, AlertTriangle, Users];

export function AdminDashboard({
  metrics,
  revenueChart,
  ordersChart,
  customerGrowthChart,
  productPerformanceChart,
  products,
  orders,
  payments,
  paymentLogs,
  bookings,
  inventoryAlerts,
  activities
}: DashboardProps) {
  const widgets = [
    ["Total Revenue", formatCurrency(metrics.totalRevenue)],
    ["Total Orders", metrics.totalOrders],
    ["Pending Orders", metrics.pendingOrders],
    ["Processing Orders", metrics.processingOrders],
    ["Delivered Orders", metrics.deliveredOrders],
    ["Cancelled Orders", metrics.cancelledOrders],
    ["Total Products", metrics.totalProducts],
    ["Low Stock Products", metrics.lowStockProducts],
    ["Out Of Stock Products", metrics.outOfStockProducts],
    ["Total Customers", metrics.totalCustomers]
  ];
  const firstProduct = products[0];
  const productForm = firstProduct ?? {
    id: "",
    name: "",
    slug: "",
    sku: "",
    brand: "",
    category: "",
    condition: "new" as const,
    status: "active" as const,
    description: "",
    specs: {},
    images: [],
    costPrice: 0,
    price: 0,
    salePrice: undefined,
    stock: 0,
    supplierName: "",
    supplierContact: "",
    warranty: "",
    lowStockThreshold: 3,
    featured: false,
    newArrival: false
  };

  return (
    <section className="container py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Admin Dashboard</p>
          <h1 className="text-4xl font-black tracking-tight">Business Control Center</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Monitor revenue, orders, stock, bookings, Paybill verification, publishing, and product operations from one workspace.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {widgets.map(([label, value], index) => {
          const Icon = widgetIcons[index];
          return (
            <motion.div key={String(label)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <Card className="h-full overflow-hidden">
                <CardContent className="p-5">
                  <Icon className="mb-4 size-5 text-primary" />
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 text-2xl font-black">{value}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <ChartCard title="Revenue" data={revenueChart} dataKey="revenue" type="line" />
        <ChartCard title="Orders By Status" data={ordersChart} dataKey="orders" type="bar" />
        <ChartCard title="Customer Growth" data={customerGrowthChart} dataKey="customers" type="line" />
        <ChartCard title="Product Performance" data={productPerformanceChart} dataKey="units" type="bar" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Order Management</h2>
              <Badge variant="secondary">{metrics.pendingOrders} pending</Badge>
            </div>
            <div className="space-y-4">
              {orders.length ? orders.map((order) => (
                <div key={order.id} className="rounded-md border p-4">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="font-bold">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">{order.id} · {formatCurrency(order.total)} · {order.customerPhone}</p>
                    </div>
                    <Badge>{orderStatusLabels[order.status]}</Badge>
                  </div>
                  <ActionForm action={updateOrderStatus} buttonLabel="Update Order" className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <input type="hidden" name="orderId" value={order.id} />
                    <select name="status" defaultValue={order.status} className="h-10 rounded-md border bg-background px-3 text-sm">
                      {orderStatuses.map((status) => <option key={status} value={status}>{orderStatusLabels[status]}</option>)}
                    </select>
                    <Input name="note" placeholder="Add admin/customer note" />
                    <label className="flex items-center gap-2 text-sm"><input name="notifyCustomer" type="checkbox" />Notify</label>
                  </ActionForm>
                </div>
              )) : <EmptyState title="No orders yet." />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Activity</h2>
              <Badge variant="outline">Live feed</Badge>
            </div>
            <div className="space-y-4">
              {activities.length ? activities.map((activity) => (
                <div key={activity.id} className="border-l-2 border-primary pl-4">
                  <p className="font-semibold">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{activity.time}</p>
                </div>
              )) : <EmptyState title="No activity recorded yet." />}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Inventory Management</h2>
              <Badge variant={metrics.lowStockProducts ? "default" : "success"}>{metrics.lowStockProducts} alerts</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {products.length ? products.slice(0, 6).map((product) => (
                <div key={product.id} className="rounded-md border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">SKU {product.sku} · {product.supplierName} · {product.supplierContact}</p>
                    </div>
                    <Badge variant={product.stock <= product.lowStockThreshold ? "default" : "outline"}>{product.stock} in stock</Badge>
                  </div>
                  <ActionForm action={adjustInventory} buttonLabel="Record Stock Change" className="mt-4 grid gap-3 sm:grid-cols-[90px_1fr]">
                    <input type="hidden" name="productId" value={product.id} />
                    <Input name="change" type="number" placeholder="+5 / -2" />
                    <Input name="reason" placeholder="Reason" />
                  </ActionForm>
                </div>
              )) : <EmptyState title="No products added yet." />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-xl font-bold">Inventory Alerts</h2>
            <div className="space-y-3">
              {inventoryAlerts.length ? inventoryAlerts.map((alert) => (
                <div key={alert.id} className="rounded-md border p-3">
                  <Badge variant={alert.severity === "critical" ? "default" : "outline"}>{alert.severity}</Badge>
                  <p className="mt-2 font-semibold">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </div>
              )) : <EmptyState title="Stock looks healthy" />}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              <h2 className="text-xl font-bold">Paybill Verification</h2>
            </div>
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="rounded-md border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold">{payment.transactionCode}</p>
                      <p className="text-sm text-muted-foreground">{payment.orderId} · {formatCurrency(payment.amount)}</p>
                    </div>
                    <Button asChild variant="outline" size="sm"><a href={payment.confirmationUrl} target="_blank">View Screenshot</a></Button>
                  </div>
                  <ActionForm action={reviewPayment} buttonLabel="Submit Review" className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <input type="hidden" name="orderId" value={payment.orderId} />
                    <select name="action" className="h-10 rounded-md border bg-background px-3 text-sm">
                      <option value="verify">Verify payment</option>
                      <option value="reject">Reject payment</option>
                    </select>
                    <Input name="rejectionReason" placeholder="Rejection reason" />
                    <input type="hidden" name="actor" value="Admin" />
                  </ActionForm>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-xl font-bold">Payment Logs</h2>
            <div className="space-y-3">
              {paymentLogs.map((log) => (
                <div key={log.id} className="rounded-md bg-secondary/50 p-3 text-sm">
                  <p className="font-semibold capitalize">{log.action} · {log.orderId}</p>
                  <p className="text-muted-foreground">{log.note}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{log.actor} · {new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr_1fr]">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <PackagePlus className="size-5 text-primary" />
              <h2 className="text-xl font-bold">Product Management</h2>
            </div>
            <ActionForm action={saveProduct} buttonLabel={firstProduct ? "Save Product" : "Create Product"}>
              <Input name="name" defaultValue={productForm.name} placeholder="Name" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input name="slug" defaultValue={productForm.slug} placeholder="Slug" />
                <Input name="sku" defaultValue={productForm.sku} placeholder="SKU" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input name="brand" defaultValue={productForm.brand} placeholder="Brand" />
                <Input name="category" defaultValue={productForm.category} placeholder="Category" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <select name="productCondition" defaultValue={productForm.condition ?? "new"} className="h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="new">New</option>
                  <option value="refurbished">Refurbished</option>
                  <option value="used">Used</option>
                </select>
                <select name="availabilityStatus" defaultValue={productForm.status ?? "active"} className="h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="hidden">Hidden</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <Textarea name="description" defaultValue={productForm.description} placeholder="Description" />
              <Textarea name="specifications" defaultValue={JSON.stringify(productForm.specs, null, 2)} placeholder="Specifications JSON" />
              <Input name="images" defaultValue={productForm.images.join("\n")} placeholder="Supabase Storage image URLs" />
              <div className="grid gap-3 sm:grid-cols-3">
                <Input name="costPrice" type="number" defaultValue={productForm.costPrice} placeholder="Cost" />
                <Input name="price" type="number" defaultValue={productForm.price} />
                <Input name="salePrice" type="number" defaultValue={productForm.salePrice} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input name="stock" type="number" defaultValue={productForm.stock} />
                <Input name="warranty" defaultValue={productForm.warranty} placeholder="Warranty" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input name="supplierName" defaultValue={productForm.supplierName} />
                <Input name="supplierContact" defaultValue={productForm.supplierContact} />
              </div>
              <Input name="lowStockThreshold" type="number" defaultValue={productForm.lowStockThreshold} />
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2"><input name="featured" type="checkbox" defaultChecked={productForm.featured} />Featured</label>
                <label className="flex items-center gap-2"><input name="newArrival" type="checkbox" defaultChecked={productForm.newArrival} />New Arrival</label>
              </div>
            </ActionForm>
            {firstProduct ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-4">
                {(["duplicate", "archive", "restore", "delete"] as const).map((action) => (
                  <ActionForm key={action} action={updateProductLifecycle} buttonLabel={action === "delete" ? "Delete" : action[0].toUpperCase() + action.slice(1)} className="space-y-2">
                    <input type="hidden" name="productId" value={firstProduct.id} />
                    <input type="hidden" name="action" value={action} />
                  </ActionForm>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarCheck className="size-5 text-primary" />
              <h2 className="text-xl font-bold">Booking Management</h2>
            </div>
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{booking.service}</p>
                    <Badge variant="outline">{booking.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{booking.name} · {booking.phone}</p>
                  <p className="mt-2 text-sm">{booking.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Newspaper className="size-5 text-primary" />
              <h2 className="text-xl font-bold">Blog CMS</h2>
            </div>
            <div className="space-y-3">
              {["Draft buying guide", "Scheduled CCTV checklist", "SEO metadata review", "Tags and categories"].map((item) => (
                <div key={item} className="rounded-md border p-3">
                  <p className="font-semibold">{item}</p>
                  <p className="text-sm text-muted-foreground">Rich text, draft workflow, scheduling, tags, categories, and SEO fields.</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function ChartCard({ title, data, dataKey, type }: { title: string; data: ChartPoint[]; dataKey: keyof ChartPoint; type: "line" | "bar" }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="mb-4 text-xl font-bold">{title}</h2>
        <div className="h-72">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              {type === "line" ? (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey={String(dataKey)} stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
                </LineChart>
              ) : (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey={String(dataKey)} fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-md bg-secondary" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title }: { title: string }) {
  return <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{title}</div>;
}
