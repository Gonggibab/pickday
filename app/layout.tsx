// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Alert from "@/components/Alert";

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
      {/* <html> 태그와 <head> 태그 사이에 공백 없음 */}
      <head>
        {/*
          Next.js는 <title>이나 <meta> 태그를 여기에 직접 넣는 것보다
          metadata 객체를 통해 관리하는 것을 권장합니다.
          필요한 경우 여기에 <link> 태그나 <script> 태그 등을 추가할 수 있습니다.
        */}
      </head>
      <body className={inter.className}>
        {/* <body> 태그와 자식 요소들 사이에 공백 없음 */}
        {children}
        <Alert />
      </body>
    </html>
  );
}
