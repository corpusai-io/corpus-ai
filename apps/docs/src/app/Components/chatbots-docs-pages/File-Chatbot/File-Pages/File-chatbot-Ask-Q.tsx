'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function WebsitePages() {
  return (
    <>
      <div className="bg-[#F9F0FF] mt-5 px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-evenly max-w-7xl mx-auto">
           {/* Right Content */}
          <div className="w-full lg:max-w-70 space-y-2 text-sm pl-8">
            <p className="text-[#BF56FF]">Ask</p>
            <h1 className="font-bold text-[23px]">Ask Your Question</h1>
            <p className="text-[#7F7A7A] text-justify">
              Engage in natural, conversational queries with your document. Whether you're researching, studying, or seeking quick information, just ask and receive instant answers with the CorpusAI chat doc.
            </p>
          </div>
          {/* Left Box */}
          <div className="bg-white w-full lg:max-w-[600px] p-5 rounded-[10px] border border-[#F2F2F2] space-y-3">
            <p className="py-1 px-2 text-right bg-[#BF56FF] border border-[#F2DDFF] text-white rounded-[10px] text-xs w-fit ml-auto">
              Can you summarize for me?
            </p>
            <div className="bg-[#F8ECFF] border border-[#F2DDFF] p-3 rounded-[10px] text-xs space-y-2">
              <p className='font-semibold'>
                Based on the provided context, I'll summarize the data for a Calorie Search <br/> MVP <br/>
                (Minimum Viable Product). Here are the key components:
              </p>
              <p>
                <b>1. Core Features:</b>
              <div className='pl-4 text-[#676767]'>
              Text-based food calorie search
              <br/>
              Image-based food recognition
              <br/>
              Two-tier user system (Free and Premium)
              <br/>
              Basic user authentication
              </div>
              </p>

                <p>
                <b>2. Data Structure:</b>
              <div className='pl-4 text-[#676767]'>
              Food Data: includes food name, calories per 100g, and portion conversions
              <br/>
              User Data: tracks basic information, usage count, and subscription status
              </div>
              </p>
              
              <p>
                <b>3. Key Pages</b>
              <div className='pl-4 text-[#676767]'>
              Home/Search Page with search bar and image upload
              <br/>
              Results Page showing calorie values and portion conversions
              <br/>
              User Pages including profile center and subscription page
              </div>
              </p>
              
              <p>
                <b>4. Development Timeline (4 weeks):</b>
              </p>
            </div>
          </div>

         
        </div>
      </div>
    </>
  );
}
