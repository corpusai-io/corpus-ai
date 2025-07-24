'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function WebsitePages() {
  return (
    <>
      <div className="bg-[#F9F0FF] mt-5 px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-center max-w-7xl mx-auto">
          
          {/* Left Main Card */}
          <div className="flex flex-row w-full lg:max-w-[1200px]">
            {/* Left Box (Chat Content) */}
            <div className="bg-white w-full lg:w-1/1 px-3 rounded-l-[10px] border border-[#F2F2F2] space-y-4">
              
              <div className="bg-[#F8ECFF] border border-[#F2DDFF] p-3 rounded-b-[10px] text-xs space-y-3">
                <p className='font-semibold text-justify'>
                  recognition, and a stable subscription system as key development priorities
                  <img
                    src="/website-assets/chatbot-docs-pages-icons/Website chatbot/circle-stars.svg"
                    alt=""
                    className="inline w-4 h-4 align-middle ml-1"
                  />
                </p>
              </div>

              <p className="py-1 px-2 text-right bg-[#BF56FF] border border-[#F2DDFF] text-white rounded-[10px] text-xs w-fit ml-auto">
                Tell me the plan of week 3
              </p>

              <div className="bg-[#F8ECFF] border border-[#F2DDFF] p-3 rounded-t-[10px] text-xs space-y-4">
                <p className="font-bold text-justify">
                  Based on the provided context, I can summarize the Calorie Search MVP (Minimum Viable Product) plan. Here are the key details:
                </p>

                <p>
                  <b>1. Core Features:</b>
                  <div className='text-[#5A5A5A] pt-2'>
                    <ul className="list-none list-inside space-y-2 lg:pl-3.5">
                      <li>Text-based food calorie search with portion</li>
                      <li>Image-based food recognition using AI</li>
                      <li >
                        
                        Two-tier user system (Free and 
                        <div className='flex'>
                          Premium)
                        <img
                          src="/website-assets/chatbot-docs-pages-icons/Website chatbot/circle-stars.svg"
                          alt=""
                          className="inline w-4 h-4 align-middle"
                        />
                      </div>
                      </li>
                    </ul>
                  </div>
                </p>

                <p>
                  <b>2. Development Timeline (4 weeks):</b>
                  <div className='text-[#5A5A5A] pt-2'>
                    <ul className="list-none list-inside space-y-2 lg:pl-3.5">
                      <li>Week 1: Core search and base</li>
                      <li>Week 2: Data storage and calorie conversion</li>
                      <li>
                        Week 3: SEC and user authentication
                        <img
                          src="/website-assets/chatbot-docs-pages-icons/Website chatbot/circle-stars.svg"
                          alt=""
                          className="inline w-4 h-4 align-middle"
                        />
                      </li>
                    </ul>
                  </div>
                </p>

                <p><b>3. Technical Structure:</b></p>
              </div>
            </div>

            {/* Right Box (Target Users & More Info) */}
            <div className="bg-white w-full lg:w-[300px] pt2 px-4 border border-[#F2F2F2]  rounded-r-[10px] text-xs space-y-6">
              <div className='border-r-1 h-full space-y-8 border-[#F2F2F2]'>
              <div className='space-y-3 pt-3'>
                <p><b>4. Target Users:</b></p>
                <ul className="list list-inside text-[#5A5A5A] pl-3 space-y-3.5">
                  <li>* Health trackers</li>
                  <li>* Fitness fans</li>
                  <li>* Nutritionists</li>
                  <li>* Chronic condition users</li>
                </ul>
              </div>

              <div className='space-y-3'>
                <p><b>5. AI Model Features:</b></p>
                <ul className="list list-inside text-[#5A5A5A] pl-3 space-y-3.5">
                  <li>* Food image detection</li>
                  <li>* Portion estimation</li>
                  <li>* Learns from feedback</li>
                  <li>* Text food parsing</li>
                </ul>
              </div>

              <div className='space-y-3'>
                <p><b>6. Monetization Strategy:</b></p>
                <ul className="list list-inside text-[#5A5A5A] pl-3 space-y-3.5">
                  <li>* Freemium access</li>
                  <li>* Paid subscription</li>
                </ul>
              </div>
              </div>
            </div>
          </div>

          {/* Right Content Box (Static Info) */}
          <div className="w-full lg:max-w-65 space-y-2 text-sm pr-4">
            <p className="text-[#BF56FF]">Learn</p>
            <h1 className="font-bold text-[23px]">AI-Driven Insights</h1>
            <p className="text-[#7F7A7A] text-justify">
              CorpusAI Chat with doc delivers accurate and relevant responses based on your document's content. Our advanced AI ensures you get precise information and meaningful insights every time.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
