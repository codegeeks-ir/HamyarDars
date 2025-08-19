import type { Metadata } from "next";

import "./globals.css";
import { Rubik } from "next/font/google";

const rubik = Rubik({
  subsets: ["arabic", "latin"],
});
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
