import { Metadata } from "next";
import Sidebar from "./Components/Sidebar/page";
import MobileSidebar from "./Components/Sidebar/mobile-Sidebar/page";
import './globals.css';

export const metadata: Metadata = {
  title: 'CORPUS-AI | DOCS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
<html lang="en" className="h-full">
      <body className="m-0 p-0 overflow-y-auto overflow-x-hidden h-full">
        <div className="flex min-h-screen">
          {/* Fixed Left Sidebar */}
          <aside className="w-64 hidden lg:block fixed top-0 left-0 h-full z-14 bg-white border-r border-gray-200 overflow-y-auto sm:display-hidden">
            <Sidebar />
          </aside>
          <aside className="w-full fixed top-0 left-0 z-13 bg-white border-r border-gray-200 overflow-y-auto lg:hidden sm:block">
            <MobileSidebar />
          </aside>

          {/* Main Content + Right Sidebar Container */}
          <div className="flex flex-1 lg:ml-64 lg:mr-64 z-11 sm:ml-0 sm:mr-0 mt-[50px] lg:mt-0 ">
            <main className="flex-1 px-4 sm:px-6 py-6 ">
              <div className="max-w-[1200px] mx-auto w-full">
                {children}
              </div>
            </main>
          </div>

         
        </div>
      </body>
    </html>
  );
}
