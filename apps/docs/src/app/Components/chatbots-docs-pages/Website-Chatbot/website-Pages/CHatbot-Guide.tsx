'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function WebsitePages() {
  return (
    <>
      <div className="bg-[#F9F0FF] mt-5 px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-evenly max-w-7xl mx-auto">
          {/* Left Box */}
          <div className="bg-white w-full lg:max-w-[600px] p-5 rounded-[10px] border border-[#F2F2F2] space-y-3">
            <p className="py-1 px-2 text-right bg-[#BF56FF] border border-[#F2DDFF] text-white rounded-[10px] text-xs w-fit ml-auto">
              Is Corpusbot free?
            </p>
            <div className="bg-[#F8ECFF] border border-[#F2DDFF] p-3 rounded-[10px] text-xs space-y-4">
              <p className="font-bold text-justify">
                Yes, Corpus.ai does offer a free plan. According to the sources, the Free Plan includes:
              </p>
              <div className="text-[#5A5A5A] ml-3 space-y-2">
                <p>1 CorpusBot</p>
                <p>20 queries per month</p>
                <div className="flex items-center gap-2">
                  <span>Ability to store up to 100 documents or web pages</span>
                  <img
                    src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/circle-stars.svg"
                    alt=""
                    className="w-4 h-4"
                  />
                </div>
              </div>

              <div className="font-bold text-justify">
                <p>
                  This free plan is described as "ideal for startups wanting to test basic features at no cost"
                  <img
                    src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/circle-stars.svg"
                    alt=""
                    className="inline ml-1 w-4 h-4 align-middle"
                  />
                  and is "perfect for testing the tool at no cost"
                  <img
                    src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/circle-stars.svg"
                    alt=""
                    className="inline ml-1 w-4 h-4 align-middle"
                  />
                </p>
              </div>

              <p className="font-bold text-justify">
                If you need more features or capacity, Denser.ai also offers paid plans starting with the Starter Plan at $19 monthly, which includes 2 DenserBots and 1,500 queries per month
                <img
                  src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/circle-stars.svg"
                  alt=""
                  className="inline ml-1 w-4 h-4 align-middle"
                />
              </p>
            </div>
          </div>

          {/* Right Content */}
          <div className="w-full lg:max-w-md space-y-2 text-sm pr-4">
            <p className="text-[#BF56FF]">Launch</p>
            <h1 className="font-bold text-[23px]">Start Chatting</h1>
            <p className="text-[#7F7A7A] text-justify">
              Deploy the chatbot on your website and answer questions in natural languages. From your products to services and policies, the AI chatbot provides full customer support on your website. Customers will receive instant, AI-powered responses with direct links to the relevant pages for more details.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
