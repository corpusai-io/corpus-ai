'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function WebsiteChatbot() {
  const options = [
    { value: 'Private', title: 'Private', description: 'Only chatbot owner can access' },
    { value: 'Invite_Only', title: 'Invite Only', description: 'Email Invitation Only' },
    { value: 'Public', title: 'Public', description: 'Anyone can access' },
  ];

  const [selected, setSelected] = useState(options[0]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleOptionClick = (option) => {
    setSelected(option);
    setIsOpen(false);
  };

  return (
    <>
      <main className="flex-1 flex">
        <div className="flex-1 mt-[30px] ml-15 mr-5">
          <h1 className="font-semibold text-[30px] mt-[16px] font-inter">Chatbot Access Control</h1>

          <p className="text-[#777777] mt-[7px] font-inter">
            Corpus provides 2 levels of access control to Corpus bots (Invite Only access is now replaced <br />
            by Team Management and will be removed in the future releases). Corpus bot access control <br />
            can be found at Settings &gt; Security section as shown in the following screenshot.
          </p>

          <div className="mt-8">
            <h2 className="font-semibold font-inter">Security</h2>
            <p className="text-[#777777] font-inter">Manages who can access your chatbot</p>

            <div className="mt-6">
              <h2 className="font-semibold font-inter">Visibility</h2>
              <p className="text-[#777777] font-inter">Manages who can see your chatbot</p>
            </div>

            <div className="mt-6">
              <h2 className="font-medium font-inter mb-2">Select access control option for dashboard</h2>

              <div className="relative inline-block text-left w-64" ref={dropdownRef}>
                <div
                  className="border border-gray-300 rounded-md px-4 py-2 cursor-pointer bg-white"
                  onClick={toggleDropdown}
                >
                  {selected.title}  
                </div>
{isOpen && (
  <div className=" mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50">
    {options.map((option) => {
      const isSelected = selected.value === option.value;

      const isPublic = option.value === 'Public' && isSelected;

      return (
        <div
          key={option.value}
          className={`px-4 py-2 cursor-pointer ${
            isPublic
              ? 'bg-[#F2DEFF] text-[#BF56FF]'
              : 'hover:bg-purple-100 text-gray-900'
          }`}
          onClick={() => handleOptionClick(option)}
        >
          <div className={`font-semibold ${isPublic ? 'text-[#BF56FF]' : ''}`}>
            {option.title}
          </div>
          <div className={`text-sm ${isPublic ? 'text-[#BF56FF]' : 'text-gray-500'}`}>
            {option.description}
          </div>
        </div>
      );
    })}
  </div>
)}
              </div>
               
            </div>
          </div>
        </div>
      </main>

      <div className="w-64 pt-13 fixed top-0 right-0 overflow-y-auto">
        <div className="flex items-center gap-2 text-gray-400 font-medium mb-2">
          <img src="/Website Assets/Sidebar-Alighment.svg" alt="" />
          <span>On this page</span>
        </div>
        {/* Add Sidebar Links if needed */}
      </div>
    </>
  );
}
