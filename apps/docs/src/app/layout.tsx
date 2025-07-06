import { Metadata } from "next";
import Sidebar from "./Components/Sidebar/page";
import './globals.css';

export const metadata: Metadata = {
  title: 'Corpus Ai',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="flex min-h-screen">
          <aside className="fixed top-0 left-0 w-[270px] h-full overflow-y-auto z-10">
            <Sidebar />
          </aside>
          <main className="flex-1 ml-[270px] overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}