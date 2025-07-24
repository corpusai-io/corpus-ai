'use client';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../../LightMode';

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
  const { darkMode, toggleDarkMode } = useTheme();
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
      <div className="py-[14px] px-[25px] w-full h-15 bg-white dark:bg-[#202020] transition-all duration-300 fixed top-0 left-0 z-50">
        <div className="flex justify-between items-center">
          {/* Flip / Close Button */}
          {!isSidebarVisible ? (
            <img
              src="/website-assets/Sidebar-Flip.svg"
              alt="Flip"
              className="cursor-pointer"
              onClick={() => {
                setIsMobileSidebarOpen(true);
                setIsSidebarVisible(true);
              }}
            />
          ) : (
            <img
              src="/website-assets/Close-ICon/close-iii.svg"
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
            <img src="/website-assets/Logo.svg" alt="Logo" />
{/* Mobile View Darkmode & lightmode images start */}
  <img
    src="/website-assets/corpusai-logo.svg"
    alt="Docs Icon"
    className="block dark:hidden"
  /> 

  {/* Dark mode image */}
  <img
    src="/website-assets/corpus-ai-white-logo.svg"
    alt="Docs Icon"
    className="hidden dark:block"
  />      
        
  <img
    src="/website-assets/Docs.svg"
    alt="Docs Icon"
    className="block dark:hidden"
  />

  {/* Dark mode image */}
  <img
    src="/website-assets/Docs-white.svg"
    alt="Docs Icon"
    className="hidden dark:block"
  />
{/* Mobile view Darkmode & lightmode images end */}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <div className="flex gap-1 p-[2px] rounded-3xl  border-1 border-[#E5E5E5] dark:border-[#2C2C2C]">
              <img
              src="/website-assets/Brightness.svg"
              alt="Light Mode"
              onClick={() => { if (darkMode) toggleDarkMode(); }}
              className={`w-6 h-6 p-1 rounded-full cursor-pointer text-[#7E7E7E] ${!darkMode ? 'bg-[#E9E9E9]' : ''}`}
            />
               <img
              src="/website-assets/Moon.svg"
              alt="Dark Mode"
              onClick={() => { if (!darkMode) toggleDarkMode(); }}
              className={`w-6 h-6 p-1 rounded-full cursor-pointer ${darkMode ? 'bg-[#303030]' : ''}`}
            />
            </div>

            {/* Toggle between Search and Close icon */}
            {!showSearchBar ? (
              <img
                src="/website-assets/Search.svg"
                alt="Search"
                className="cursor-pointer w-5"
                onClick={() => setShowSearchBar(true)}
              />
            ) : (
              <img
                src="/website-assets/Close-ICon/clos-iv.png"
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
          <form className="shadow-md bg-[#F8F8F8] rounded-[5px] w-[200px] py-2 px-2 flex items-center dark:bg-[#1E1E1E] dark:border-1">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none bg-[#F8F8F8] px-2 w-full text-sm  dark:bg-[#1E1E1E] placeholder:text-[#7E7E7E] dark:text-white"
              required
            />
            <img
              src="/website-assets/Search.svg"
              alt="Search"
              className="w-5 cursor-pointer ml-2"
            />
          </form>
        </div>
      )}

    </>
  );
}
