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
        <div className="w-auto max-w-[1000px] mx-auto  lg:px-8 overflow-x-hidden">
          <h1 className="font-bold text-[30px] mt-[16px] font-inter">Chatbot Access Control</h1>

          <p className="text-[#777777] mt-[7px] font-inter text-justify">
            Corpus provides 2 levels of access control to Corpus bots (Invite Only access is now replaced
            by Team Management and will be removed in the future releases). Corpus bot access control
            can be found at Settings &gt; Security section as shown in the following screenshot.
          </p>

          <div className="mt-4 bg-[#fff] p-[20px] rounded-[10px]">
            <h2 className="font-bold font-inter">Security</h2>
            <p className="text-[#777777] font-inter">Manages who can access your chatbot</p>

            <div className="mt-4 border-1 border-[#EAEAEA] pb-[20px] rounded-[10px] max-w-auto">
              <div className="pl-[22px] pt-[10px] pb-0">
                <h2 className="font-bold font-inter">Visibility</h2>
                <p className="text-[#777777] font-inter">Manages who can see your chatbot</p>
              </div>

              <div className="mt-3 border-t border-[#EAEAEA] pl-[22px] pt-[10px]">
                <h2 className="font-inter mb-2 mt-2 font-bold">Select access control option for dashboard</h2>

                <div className="flex items-center flex-wrap gap-2 cursor-pointer">
                  <div className="flex items-center lg:gap-18 py-1 gap-23 px-3 bg-[#fff] rounded-[7px] border border-[#EAEAEA]">
                    <span className="text-[#7F7F7F]">Private</span>
                    <img src="/Website Assets/Arrow Down.svg" className="inline-block" alt="" />
                  </div>

                  <button className="border border-[#EAEAEA] text-[#fff] bg-[#BF56FF] px-3 py-1 rounded-[5px] cursor-pointer">Save</button>
                </div>

                <div className="block lg:flex lg:text-[12px] text-[12px] text-[#110a0a] mt-2">
                  <div className="bg-[#fff] lg:px-[10px] lg:py-[10px] px-[9px] py-[9px]  space-y-2 lg:space-y-1.5 rounded-[7px] border border-[#EAEAEA] text-[#7F7F7F] max-w-47 lg:max-w-full  lg:mb-[-120px] z-11">
                    <div className="pl-[10px] cursor-pointer">
                      <span>Private</span>
                      <p>Only chatbot owner can access</p>
                      <span>Invite Only</span>
                      <p>Email Invitation Only</p>
                    </div>
                    <div className="bg-[#F2DEFF] text-[#BF56FF] rounded-[6px] pl-[10px] p-[5px] cursor-pointer">
                      <span>Public</span>
                      <p>Anyone can access</p>
                    </div>
                  </div>

                  <p className="pt-2 lg:text-[12px] text-[12px] pl-3 pr-3 text-wrap break-words text-justify text-[#7F7F7F]">
                    Queries from any other user are rejected by this chatbot. Rejected queries do not cost chat usage credit.
                  </p>
                </div>
              </div>

            </div>
            <div className="mt-4 border-1 border-[#EAEAEA] rounded-[10px] text-[12px] pt-[26px]">
              <p className="pl-[22px] text-[#7F7F7F] text-justify pr-[15px]">Corpus's RESTful API provides a oroarammable interface to our chatbot. You can use it to build public or private apps, workflows, and integrations ontop or Corpus.</p>

              <div className="lg:mt-[20px] text-[#BF56FF] font-bold pl-[21px] mt-[10px] lg:pl-[28px]">API Documentation</div>

              <div className="mt-4 pt-[80px] border-[#EAEAEA] border-t-1 text-center ">
                <img src="/Website Assets/chatbot-docs-pages-icons/Access Setting Icons/Key-Icon.svg" alt="" className="bg-[#F0D7FF] mb-[10px] p-[20px] rounded-[5px] mx-auto" />

                <p className="text-[#7F7F7F]">You can generate an API kev to access the API</p>
                <div>
                  <div className="flex justify-end">
                    <button className="bg-[#BF56FF] border border-[#EAEAEA] rounded-[5px] py-[5px] px-[10px] mt-[40px] mb-[8px] mr-[10px] text-white cursor-pointer">
                      Generate API Key
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>


          <p className="text-[#7F7F7F] mt-5 text-justify">
            <b>Private</b> is the default access level for a newly created Corpus chatbot. Initially, only authenticated Corpus account owner can query the Corpus bot. Corpus owner can add additional users to grant access to the Corpus bot. See Team Management.
          </p>

          <p className="text-[#7F7F7F] mt-10 text-justify">
            <b>Public</b> allows anonymous public users to query the Corpus bot. This mode is suitable for bots that aim to provide customer services.
          </p>


        </div>
      </main>

      <div className="w-64 pt-13 fixed top-0 right-0 overflow-y-auto lg:block sm:hidden hidden">
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
