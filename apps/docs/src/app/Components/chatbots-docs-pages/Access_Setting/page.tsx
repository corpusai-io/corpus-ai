'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function WebsiteChatbot() {
  const options = [
    { value: 'Private', title: 'Private', description: 'Only chatbot owner can access' },
    { value: 'Invite_Only', title: 'Invite Only', description: 'Email Invitation Only' },
    { value: 'Public', title: 'Public', description: 'Anyone can access' },
  ];

  return (
    <>
      <main className="flex-1 flex">
         <div id="Telegram" className="w-full max-w-auto overflow-x-hidden">
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
                
              <div className="flex gap-2">
                <div className="">
                  Private
                   <img src="/Website Assets/Arrow Down.svg" className="inline-block" alt="" />
                </div>
               
                <button>Save</button>
              </div>
              <div>
               <div>
                <span>Private</span>
                <p>Only chatbot owner can access</p>
                <span>Invite Only</span>
                <p>Email Invitation Only</p>
                <span>Public</span>
                <p>Anyone can access</p>
                </div>
                <p>Queries from anv other user are reiected b this chatbot. Reiected queries does not cost chat usage credit</p>
              </div>

              <div>
                <p>Corpus's RESTful API provides a oroarammable interface to our chatbot. You can use it to build public or private apps, workflows, and integrations ontop or Corpus.</p>
                <span>API Documentation</span>

                <div>
                  
                  <p>You can generate an API kev to access the API</p>
                  <div>
                    <button>Generate API Key</button>
                  </div>
                </div>
                
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
    
      <ul className="">
        <li className="bg-white p-1 pl-4 rounded mr-18 border-1 border-[#EAEAEA]">
          <p>No Heading</p>
        </li>
      </ul>
    </div>
    </>
  );
}
