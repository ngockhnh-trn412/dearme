import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SanctuaryProvider } from "@/context/SanctuaryContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dear Me — letters to your past and future selves",
  description:
    "A warm, private space to write letters across time. Leave messages for your future self, revisit your past words, and build a conversation with the person you're becoming.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SanctuaryProvider>{children}</SanctuaryProvider>
      </body>
    </html>
  );
}
