import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import AuthGateway from "@/components/auth-gateway";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "tg",
  description: "tg app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={GeistMono.className}>
        <AuthGateway>
          <SiteHeader />
          <main className="min-h-screen">{children}</main>
        </AuthGateway>
      </body>
    </html>
  );
}
