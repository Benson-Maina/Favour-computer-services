"use client";

import { usePathname } from "next/navigation";

export function LayoutWrapper({
  children,
  header,
  footer,
  whatsapp
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  whatsapp: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {header}
      <main>{children}</main>
      {footer}
      {whatsapp}
    </>
  );
}
