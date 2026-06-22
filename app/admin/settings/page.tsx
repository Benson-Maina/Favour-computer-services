import type { Metadata } from "next";
import { saveSiteSettings } from "@/app/actions";
import { ActionForm } from "@/components/action-form-status";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requireAdminPage } from "@/lib/admin-auth";
import { getBusinessSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requireAdminPage("settings:write");
  const business = await getBusinessSettings();

  return (
    <div>
      <AdminPageHeader title="Site Settings" description="Update business details and Paybill configuration." />
      <ActionForm action={saveSiteSettings} buttonLabel="Save Settings" className="max-w-2xl space-y-4 rounded-lg border border-border p-5">
        <Input name="businessName" defaultValue={business.name} placeholder="Business name" />
        <Input name="businessLocation" defaultValue={business.location} placeholder="Location" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="businessPhone" defaultValue={business.phone} placeholder="Phone" />
          <Input name="businessWhatsapp" defaultValue={business.whatsapp} placeholder="WhatsApp" />
        </div>
        <Input name="businessEmail" type="email" defaultValue={business.email} placeholder="Email" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="paybillNumber" defaultValue={business.paybill} placeholder="Paybill" />
          <Input name="paybillAccount" defaultValue={business.account} placeholder="Account" />
        </div>
        <Input name="siteUrl" defaultValue={business.siteUrl} placeholder="Site URL" />
        <Textarea name="businessDescription" defaultValue={business.description} placeholder="Business description" rows={4} />
      </ActionForm>
    </div>
  );
}
