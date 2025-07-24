'use client';
import Link from 'next/link';

export default function TelegramStep1() {
  return (
    <div className="bg-[#F9F0FF] py-10 mt-10">
      <div className="flex flex-col lg:flex-row gap-5 items-center max-w-7xl mx-auto px-4">

        <div className="lg:w-1/2 w-full text-sm pl-5">
          <p className="text-[#BF56FF] mb-2">Step 2</p>
          <h2 className="font-bold text-[22px] mb-2">
            Connect Your Telegram Bot
          </h2>
          <p className="text-[#7F7A7A] text-justify">
            Paste your bot token from @BotFather, authorize connection, and confirm the bot name and icon.
          </p>
        </div>
        <img 
          src="/Website Assets/chatbot-docs-pages-icons/Telegram Icons/Telegram-Step-2.svg" 
          alt="Telegram Step" 
          className="w-full max-w-[400px] h-auto object-contain"
        />

      </div>
    </div>
  );
}
