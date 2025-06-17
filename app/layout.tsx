import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthGateway from "@/components/auth-gateway";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body className={geistMono.className}>
        <AuthGateway>{children}</AuthGateway>
      </body>
    </html>
  );
}
