'use client';
import { useEffect, useRef, useState } from 'react';
import Sidebar from './Components/Sidebar/page';
import MobileSidebar from './Components/Sidebar/mobile-Sidebar/page';
import useIsMobile from './hooks/useIsMobile'; // ✅ import the hook
import Page from "./Components/Sidebar/page";
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile(); // ✅ use the hook
  const prevIsMobile = useRef<boolean>(isMobile);

  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile UI when switching to desktop
  useEffect(() => {
    if (!isMobile && prevIsMobile.current) {
      setShowSearchBar(false);
      setIsMobileSidebarOpen(false);
    }

    prevIsMobile.current = isMobile;
  }, [isMobile]);

  return (
    <html lang="en" className="h-full">
      <body className="m-0 p-0 overflow-y-auto overflow-x-hidden h-full">
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <aside className="w-64 hidden lg:block fixed top-0 left-0 h-full z-14 bg-white border-r border-gray-200 overflow-y-auto">
            <Sidebar />
          </aside>

          {/* Mobile Top Bar */}
          <aside className="w-full fixed top-0 left-0 z-50 border-gray-200 overflow-y-auto lg:hidden sm:block">
            <MobileSidebar
              showSearchBar={showSearchBar}
              setShowSearchBar={setShowSearchBar}
              setIsMobileSidebarOpen={setIsMobileSidebarOpen}
              isMobile={isMobile} // ✅ you missed this
            />
          </aside>

          {/* Mobile Sidebar Drawer */}
         {isMobileSidebarOpen && (
  <div className="fixed inset-0 z-40 flex lg:hidden">
    <div
      className="fixed inset-0 bg-black opacity-30"
      onClick={() => setIsMobileSidebarOpen(false)}
    ></div>

    <div className="flex flex-1 z-10 transition-all duration-300 ease-in-out">
      <div className="relative w-64 bg-white h-full shadow-lg z-50">
        <Page setIsMobileSidebarOpen={setIsMobileSidebarOpen} />
      </div>
    </div>
  </div>
)}

          {/* Main Content */}
          <div
            className={`flex flex-1 lg:ml-64 lg:mr-64 lg:mt-[10px] z-10 transition-all duration-300 ease-in-out ${showSearchBar ? 'mt-[100px]' : 'mt-[60px]'
              }`}
          >
            <main className="flex-1 px-4 sm:px-6 py-6">
              <div className="max-w-[1200px] mx-auto w-full">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
