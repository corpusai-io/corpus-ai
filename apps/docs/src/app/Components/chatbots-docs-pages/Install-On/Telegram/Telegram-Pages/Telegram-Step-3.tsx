'use client';
import Link from 'next/link';

export default function TelegramStep1() {
  return (
    <div className="bg-[#F9F0FF] py-5 mt-10">

      <div className="flex flex-col lg:flex-row gap-5 items-center max-w-7xl mx-auto px-4">
        <img 
          src="/website-assets/chatbot-docs-pages-icons/Telegram Icons/Telegram-Step-3.svg" 
          alt="Telegram Step" 
          className="w-full max-w-[400px] h-auto object-contain"
        />

        <div className="lg:w-1/2 w-full text-sm pr-5">
          <p className="text-[#BF56FF] mb-2">Step 3</p>
          <h2 className="font-bold text-[22px] mb-2">
            Start Using in Channels
          </h2>
          <p className="text-[#7F7A7A] text-justify">
            Invite your bot to any Telegram group or message it directly. Users can ask questions and get instant replies based on your knowledge base.
          </p>
        </div>
      </div>
    </div>
  );
}
