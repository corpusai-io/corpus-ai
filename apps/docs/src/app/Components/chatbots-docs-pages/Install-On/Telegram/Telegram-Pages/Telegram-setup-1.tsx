'use client';
import Link from 'next/link';

export default function TelegramStep1() {
  return (
    <div className="bg-[#F9F0FF] py-5">
      <h2 className="text-center font-bold text-2xl sm:text-3xl mb-6">
        Simple Steps to Integrate with Telegram
      </h2>

      <div className="flex flex-col lg:flex-row gap-5 items-center max-w-7xl mx-auto px-4">
        <img 
          src="/website-assets/chatbot-docs-pages-icons/Telegram Icons/TelegramStep-1.svg" 
          alt="Telegram Step" 
          className="w-full max-w-[400px] h-auto object-contain"
        />

        <div className="lg:w-1/2 w-full text-sm pr-5">
          <p className="text-[#BF56FF] mb-2">Step 1</p>
          <h2 className="font-bold text-[22px] mb-2">
            Access Integration Settings
          </h2>
          <p className="text-[#7F7A7A] text-justify">
            Open your chatbot dashboard, go to the Integrations tab, and select Telegram to begin setup.
          </p>
        </div>
      </div>
    </div>
  );
}
