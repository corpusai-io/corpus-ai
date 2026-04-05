import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Inter } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sign In — Corpus AI",
  description: "Sign in or create your Corpus AI account.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} ${GeistSans.variable} ${inter.variable} antialiased bg-[#F7F7F7] text-[#171717]`}
      >
        {children}
      </body>
    </html>
  );
}
