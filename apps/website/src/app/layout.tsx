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
  title: "Corpus AI — Agentic AI That Acts, Not Just Answers",
  description:
    "Build AI agents that query databases, take actions, and resolve issues autonomously. The next generation of business AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
