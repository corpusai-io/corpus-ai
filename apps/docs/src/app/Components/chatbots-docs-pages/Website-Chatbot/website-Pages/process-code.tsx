'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function WebsitePages() {
  const [activeSection, setActiveSection] = useState<'web' | 'file'>('web');
  const [fileContent, setFileContent] = useState('');
  const fileTabLocked = fileContent.trim() === '';

  return (
    <>
      <div className="bg-[#F9F0FF] mt-5 px-2 py-4">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between max-w-7xl mx-auto">
          {/* Left Side Content */}
          <div className="w-full lg:max-w-md space-y-3 text-sm pl-5">
            <p className="text-[#BF56FF]">Process</p>
            <h1 className="font-bold text-[23px]">Analyze & Index</h1>
            <p className="text-[#7F7A7A] text-justify">
              Corpus AI chatbots learn from every page—understanding text, images, charts, and tables—ensuring it
              captures all the key information. Once the process is complete, your website chatbot is ready to engage.
            </p>
          </div>

          {/* Right Side Chatbot Box */}
          <div className="w-full lg:max-w-xl bg-white p-5 rounded-[10px] shadow-lg border border-[#F2F2F2]">
            <h2 className="font-bold text-base">Chatbot Build</h2>
            <p className="text-[#7A7A7A] text-sm">View your chatbot status</p>

            <div className="space-y-4 py-4 text-[#7A7A7A] text-sm px-12">
              <div className="flex items-start gap-4">
                <img
                  src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/Check-green.svg"
                  alt=""
                  className="bg-[#D6FFEC] p-2 rounded-full w-10 h-10"
                />
                <p>Start Crawling HTML Files</p>
              </div>

              <div className="flex items-start gap-4">
                <img
                  src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/round-circle.svg"
                  alt=""
                  className="bg-[#D6FFEC] p-2.5 rounded-full w-10 h-10"
                />
                <div>
                  <p>Parsing Web Pages</p>
                  <p className="text-[13px]">Parsed Pages: 84</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <img
                  src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/Check-gray.svg"
                  alt=""
                  className="bg-[#EDEDED] p-2 rounded-full w-10 h-10"
                />
                <p>Processing Documents</p>
              </div>

              <div className="flex items-start gap-4">
                <img
                  src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/Check-gray.svg"
                  alt=""
                  className="bg-[#EDEDED] p-2 rounded-full w-10 h-10"
                />
                <p>Building Document Index</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
