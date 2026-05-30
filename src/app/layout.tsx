import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GrowMyAccount AI — Know Exactly Why You're Not Growing",
  description:
    "AI-powered Instagram Growth Analyst. Connect your account and receive actionable insights, growth strategies, and competitor analysis to accelerate your Instagram growth.",
  keywords: [
    "instagram analytics",
    "instagram growth",
    "social media analytics",
    "AI growth consultant",
    "instagram insights",
    "content strategy",
    "competitor analysis",
    "grow my instagram",
  ],
  openGraph: {
    title: "GrowMyAccount AI — Know Exactly Why You're Not Growing",
    description:
      "AI-powered Instagram Growth Analyst with actionable insights and growth strategies.",
    type: "website",
  },
};

import { ToastProvider } from "@/components/ui/toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
