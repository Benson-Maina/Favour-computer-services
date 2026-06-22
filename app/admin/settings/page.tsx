import type { Metadata } from "next";
import { saveSiteSettings } from "@/app/actions";
import { ActionForm } from "@/components/action-form-status";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requireAdminPage } from "@/lib/admin-auth";
import { getBusinessSettings } from "@/lib/data";
import { socialPlatforms } from "@/lib/social-links";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requireAdminPage("settings:write");
  const business = await getBusinessSettings();

  return (
    <div>
      <AdminPageHeader title="Site Settings" description="Update business details, payment info, and social media links." />
      <ActionForm action={saveSiteSettings} buttonLabel="Save Settings" className="max-w-2xl space-y-6">
        <div className="space-y-4 rounded-lg border border-border p-5">
          <h2 className="font-semibold text-foreground">Business Information</h2>
          <Input name="businessName" defaultValue={business.name} placeholder="Business name" required />
          <Textarea name="businessDescription" defaultValue={business.description} placeholder="Business description" rows={3} required />
          <Input name="businessLocation" defaultValue={business.location} placeholder="Business location" required />
          <Input name="pickupAddress" defaultValue={business.pickupAddress} placeholder="Pickup address" required />
          <Input name="operatingHours" defaultValue={business.operatingHours} placeholder="Operating hours (e.g. Mon–Sat: 8AM–6PM)" required />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="businessPhone" defaultValue={business.phone} placeholder="Phone" required />
            <Input name="businessWhatsapp" defaultValue={business.whatsapp} placeholder="WhatsApp number" required />
          </div>
          <Input name="businessEmail" type="email" defaultValue={business.email} placeholder="Email" required />
          <Input name="siteUrl" defaultValue={business.siteUrl} placeholder="Site URL" required />
        </div>

        <div className="space-y-4 rounded-lg border border-border p-5">
          <h2 className="font-semibold text-foreground">Payment Details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="paybillNumber" defaultValue={business.paybill} placeholder="Paybill number" required />
            <Input name="paybillAccount" defaultValue={business.account} placeholder="Paybill account" required />
          </div>
          <Input name="tillNumber" defaultValue={business.tillNumber} placeholder="Till number (optional)" />
        </div>

        <div className="space-y-4 rounded-lg border border-border p-5">
          <h2 className="font-semibold text-foreground">Social Media</h2>
          <p className="text-sm text-muted-foreground">Leave blank to hide icons on the website.</p>
          {socialPlatforms.map(({ key, label }) => (
            <Input
              key={key}
              name={`social${key.charAt(0).toUpperCase()}${key.slice(1)}`}
              defaultValue={business.socialLinks[key]}
              placeholder={`${label} URL`}
              type="url"
            />
          ))}
        </div>
      </ActionForm>
    </div>
  );
}
