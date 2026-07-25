import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Billing ERP System",
  description: "Indian Business Billing, Invoicing, Tax, and Profit & Loss Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
