import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { business, getBusinessSettings } from "@/lib/data";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { WhatsappFloat } from "@/components/whatsapp-float";
import { CartProvider } from "@/lib/cart-context";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: {
    default: "Favour Computer Services | Electronics Shop Nairobi",
    template: "%s | Favour Computer Services"
  },
  description: "Shop laptops, desktops, phones, SSDs, accessories, CCTV systems, and professional technology services in Nairobi.",
  keywords: ["Laptops Nairobi", "Desktops Nairobi", "SSD Nairobi", "CCTV Installation Nairobi", "Electronics Shop Nairobi", "Computer Accessories Nairobi", "Live Streaming Nairobi"],
  openGraph: {
    title: "Favour Computer Services",
    description: "Quality electronics and professional technology services in Nairobi.",
    url: business.siteUrl,
    siteName: "Favour Computer Services",
    locale: "en_KE",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Favour Computer Services",
    description: "Electronics shop and technology services in Nairobi."
  },
  alternates: {
    canonical: business.siteUrl
  }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const business = await getBusinessSettings();
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    email: business.email,
    telephone: business.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "F&F Building, Next to Odeon Cinema, Shop U13",
      addressLocality: "Nairobi",
      addressCountry: "KE"
    },
    url: business.siteUrl,
    sameAs: [`https://wa.me/${business.whatsapp}`]
  };

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider>
            <CartProvider>
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
              <LayoutWrapper header={<SiteHeader />} footer={<SiteFooter />} whatsapp={<WhatsappFloat />}>
                {children}
              </LayoutWrapper>
              <Toaster richColors position="top-right" />
            </CartProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
