// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css"; // CSS 임포트 경로는 이전과 동일하게 유지

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PickDay",
  description: "간편하게 의견을 모아보세요!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
