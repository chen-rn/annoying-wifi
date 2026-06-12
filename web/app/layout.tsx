import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Annoying WiFi",
  description:
    "macOS background script that re-accepts cafe Wi-Fi captive portals so your laptop just stays connected.",
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
