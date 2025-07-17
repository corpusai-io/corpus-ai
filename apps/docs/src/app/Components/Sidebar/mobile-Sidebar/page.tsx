'use client';
import { useEffect, useRef, useState } from 'react';

interface Props {
  showSearchBar: boolean;
  setShowSearchBar: (value: boolean) => void;
  setIsMobileSidebarOpen: (value: boolean) => void;
  setIsSidebarVisible: (value: boolean) => void;
  isSidebarVisible: boolean; // ✅ NEW: accept from props
  isMobile: boolean;
}

export default function MobileSidebar({
  showSearchBar,
  setShowSearchBar,
  setIsMobileSidebarOpen,
  setIsSidebarVisible,
  isSidebarVisible, // ✅ use this
  isMobile,
}: Props) {
  const [search, setSearch] = useState('');

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Reset sidebar icon visibility on layout switch
  useEffect(() => {
    if (!isMobile) {
      setIsSidebarVisible(false);
    }
  }, [isMobile]);


  // Auto close search bar after 8 seconds
  useEffect(() => {
    if (showSearchBar) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setShowSearchBar(false);
      }, 5000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [search, showSearchBar]);

  return (
    <>
    
      {/* Top bar */}
      <div className="py-[14px] px-[25px] w-full h-15 bg-white transition-all duration-300 fixed top-0 left-0 z-50">
        <div className="flex justify-between items-center">
          {/* Flip / Close Button */}
          {!isSidebarVisible ? (
            <img
              src="/Website Assets/Sidebar-Flip.svg"
              alt="Flip"
              className="cursor-pointer"
              onClick={() => {
                setIsMobileSidebarOpen(true);
                setIsSidebarVisible(true);
              }}
            />
          ) : (
            <img
              src="/Website Assets/Close-ICon/close-iii.svg"
              alt="Close"
              className="cursor-pointer w-6"
              onClick={() => {
                setIsMobileSidebarOpen(false);
                setIsSidebarVisible(false);
              }}
            />
          )}

          {/* Left Side */}
          <div className="flex items-center gap-2">
            <img src="/Website Assets/Logo.svg" alt="Logo" />
            <img src="/Website Assets/Corpus AI logo.svg" alt="Corpus AI" />
            <img src="/Website Assets/Docs.svg" alt="Docs" />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 p-0.5 pl-3 pr-3 rounded-3xl border border-gray-200 cursor-pointer">
              <img src="/Website Assets/Brightness.svg" alt="Brightness" className="w-5" />
              <img src="/Website Assets/Moon.svg" alt="Moon" className="w-5" />
            </div>

            {/* Toggle between Search and Close icon */}
            {!showSearchBar ? (
              <img
                src="/Website Assets/Search.svg"
                alt="Search"
                className="cursor-pointer w-5"
                onClick={() => setShowSearchBar(true)}
              />
            ) : (
              <img
                src="/Website Assets/Close-ICon/clos-iv.png"
                alt="Close"
                className="cursor-pointer w-5"
                onClick={() => setShowSearchBar(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Search Bar on Top Right */}
      {showSearchBar && (
        <div className="fixed top-[68px] right-[7px] z-50">
          <form className="shadow-md bg-[#F8F8F8] rounded-[5px] w-[200px] py-2 px-2 flex items-center">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none bg-[#F8F8F8] px-2 w-full text-sm"
              required
            />
            <img
              src="/Website Assets/Search.svg"
              alt="Search"
              className="w-5 cursor-pointer ml-2"
            />
          </form>
        </div>
      )}
      
    </>
  );
}
