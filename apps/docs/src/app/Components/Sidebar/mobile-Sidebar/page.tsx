'use client';
import { useState } from 'react';

interface Props {
  showSearchBar: boolean;
  setShowSearchBar: (value: boolean) => void;
  setIsMobileSidebarOpen: (value: boolean) => void;
}

export default function MobileSidebar({
  showSearchBar,
  setShowSearchBar,
  setIsMobileSidebarOpen,
}: Props) {
  const [search, setSearch] = useState('');

  return (
    <>
      {/* Top bar */}
      <div className="py-[14px] px-[25px] w-full h-15 bg-white transition-all duration-300 fixed top-0 left-0 z-50">
        <div className="flex justify-between items-center">
          {/* Flip Button */}
          <img
            src="/Website Assets/Sidebar-Flip.svg"
            alt="Flip"
            className="cursor-pointer"
            onClick={() => setIsMobileSidebarOpen(true)}
          />

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

            {/* Search icon */}
            <img
              src="/Website Assets/Search.svg"
              alt="Search"
              className="cursor-pointer"
              onClick={() => setShowSearchBar(!showSearchBar)}
            />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearchBar && (
        <div className="z-40 transition-all duration-300 mt-[60px] mb-[10px] border-t-1 pt-2">
          <form className="relative bg-[#F8F8F8] rounded-[10px] py-1 pl-8 pr-2 mx-3 shadow-lg">
            <span className="absolute left-2 top-1.5">
              <img src="/Website Assets/Search.svg" alt="Search" className="w-4" />
            </span>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-0 bg-[#F8F8F8] w-full px-2"
              required
            />
          </form>
        </div>
      )}
    </>
  );
}
