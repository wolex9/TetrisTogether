import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import AuthGateway from "@/components/auth-gateway";

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
        <AuthGateway>{children}</AuthGateway>
      </body>
    </html>
  );
}
