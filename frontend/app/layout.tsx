import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 智能工具箱",
  description: "探索強大的 AI 工具集合",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}