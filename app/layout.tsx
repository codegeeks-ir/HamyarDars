import type { Metadata } from "next";

import "./globals.css";
import { rubik } from "@/utils/fonts";

export const metadata: Metadata = {
  title: "همیار درس",
  description: "ابزاری برای بررسی دروس پاس شده و باقی مانده",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa">
      <body className={rubik.className}>{children}</body>
    </html>
  );
}
