'use client';
import { useEffect, useRef, useState } from 'react';
import SidebarPage from './Components/Sidebar/page'; // desktop
import MobileSidebar from './Components/Sidebar/mobile-Sidebar/page';
import useIsMobile from './hooks/useIsMobile'; // ✅ import the hook
import './globals.css'; //Global CSS
import { ThemeProvider } from '../LightMode';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile(); // ✅ use the hook
  const prevIsMobile = useRef<boolean>(isMobile);

  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  // Close mobile UI when switching to desktop
  useEffect(() => {
    if (!isMobile && prevIsMobile.current) {
      setShowSearchBar(false);
      setIsMobileSidebarOpen(false);
      setIsSidebarVisible(false);
    }

    prevIsMobile.current = isMobile;
  }, [isMobile]);

  return (
      <html lang="en" className="h-full">
        <body className="m-0 p-0 overflow-y-auto overflow-x-hidden h-full">
           <ThemeProvider>
          <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <aside className="w-64  hidden lg:block fixed top-0 left-0 h-full z-14 bg-[#0000] border-r border-gray-200 overflow-y-auto">
            <SidebarPage
              setIsMobileSidebarOpen={setIsMobileSidebarOpen}
              setIsSidebarVisible={setIsSidebarVisible}
            />
            </aside>

            {/* Mobile Top Bar */}
            <aside className="w-full fixed top-0 left-0 z-50 border-gray-200 overflow-y-auto lg:hidden sm:block">
              <MobileSidebar
                showSearchBar={showSearchBar}
                setShowSearchBar={setShowSearchBar}
                setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                setIsSidebarVisible={setIsSidebarVisible}
                isSidebarVisible={isSidebarVisible} // ✅ pass down
                isMobile={isMobile}
              />
            </aside>

            {/* Mobile Sidebar Drawer */}
            {isMobileSidebarOpen && (
              <div className="fixed inset-0 z-40 flex lg:hidden">
                <div
                  className="fixed inset-0 bg-black opacity-30"
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    setIsSidebarVisible(false);
                  }}
                ></div>

                <div className="flex flex-1 z-10 transition-all duration-300 ease-in-out">
                  <div className="relative w-64 bg-black h-full shadow-lg z-50 sidebar-drawer">
                    <SidebarPage
                      setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                      setIsSidebarVisible={setIsSidebarVisible}
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Main Content */}
            <div
              className={`flex flex-1 ml-0 mr-0 lg:ml-70 lg:mr-64 lg:mt-[20px] z-10 transition-all duration-300 ease-in-out ${showSearchBar ? 'mt-[100px]' : 'mt-[60px]'}`}
            >
              <main className="flex-1 lg:px-4 px-2 py-1">
                <div className="max-w-[1200px] mx-auto w-full">{children}</div>
              </main>
            </div>
          </div>
          </ThemeProvider>
        </body>
      </html>
  );
}
