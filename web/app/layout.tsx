import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wi2 Auto-Accept",
  description:
    "macOS background script that auto-clicks Wi2 captive portals so your laptop just connects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
