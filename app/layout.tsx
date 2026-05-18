import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { MobileShell } from "./components/MobileShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifePilot",
  description: "Mobile-first помощник для писем и документов"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <MobileShell>{children}</MobileShell>
      </body>
    </html>
  );
}
