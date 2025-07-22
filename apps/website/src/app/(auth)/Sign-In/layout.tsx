import "@/app/globals.css";
import { Inter } from "next/font/google";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
export default function SigninLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans `}>
        <main>{children}</main>
      </body>
    </html>
  );
}