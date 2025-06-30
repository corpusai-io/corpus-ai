'use client'; 
import Link from 'next/link';
import { useState } from 'react';

export default function WebsiteChatbot(){
  const [activeSection, setActiveSection] = useState<'website' | 'file'>('website');

  // Simulate file content (you can replace with actual logic)
  const [fileContent, setFileContent] = useState('');

  // Disable File tab if content is empty or only whitespace
  const fileTabLocked = fileContent.trim() === '';
    return(
        <>
            <main className="flex-1 flex">
            <div className="flex-1 mt-[30px] ml-15 mr-5">
             <p className="text-[#7F7F7F] ">Chatbot</p>
                        
            {/* Website Chatbot Content */}

            <h2  className="font-bold  mt-1 ">Website Chatbot</h2>

            <p className="text-justify mt-2 text-[#777777]  space-y-2">After you log in with one the following: Google login, Facebook login or sign up with Corpus, you will <br/> see the chatbot home as follows.</p>    

            <div className="bg-white mt-1 pt-3 pl-6 pr-6 w-[720px] h-[320px] shadow-lg rounded-[10px]">
            <div className="flex justify-between">
                <div>
                  <h2 className="font-bold">Chatbots</h2> 
                  <p className="text-[#7F7F7F]">There are no Chatbots</p>
                </div>
                <button className="border-1 border-[#EAEAEA] p-2 rounded-[5px] pt-1 pb-0 pl-3 pr-3 cursor-pointer h-9">Add Bot</button>
            </div>
           <div className="text-center mt-5 space-y-1">
            <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/Box website chatbot.svg" alt="" className="relative left-70 w-30 "/>
            <p className="mt-5 font-bold">There are no Chatbots</p>
            <p className="text-[#7F7F7F]">Create new chatbots to get started</p>
            
            <button className="bg-[#BF56FF] border-1 border-[#EAEAEA] p-2 mt-1 rounded-[5px] cursor-pointer text-white">Create Now</button>
            </div>
            
            </div>
            <p className=" text-justify mt-5 mb-5 text-[#777777]">
              When you click Create Now button, you will reach the chatbot building page (see below). Make sure <br/> that the WEB tab is selected and input the website you’d like to crawl (https://corpusai.io in this case).<br/> Click the button Build Now to start building a chatbot on the website.
            </p>
          {/* This section for future added more information*/}
          <div className="bg-white w-[720px] mt-4 p-[25px] rounded-t-[20px] shadow-lg">
            <div className="">
                <h2 className="font-bold">Create Chatbot</h2>
                <p className="text-[#7A7A7A]">Create a Chatbot from different sources.</p>
          <div className="flex gap-10 mt-4">
                {/* Tabs */}
                <ul className="space-y-2 text-sm font-medium w-40">
                  <li>
                    <button
                      onClick={() => setActiveSection('website')}
                      className={`w-full text-left px-4 py-2 rounded-md transition 
                        ${activeSection === 'website' 
                          ? 'bg-gray-200 text-purple-600 font-semibold flex gap-3' 
                          : 'hover:bg-gray-100 text-gray-600 flex gap-3'}
                      `}
                      >
                      <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/Browser-icon.svg" alt=""/> Website
                    </button>
                  </li>

        <li>
          <button
            onClick={() => {
              if (!fileTabLocked) setActiveSection('file');
            }}
            disabled={fileTabLocked}
            className={`w-full text-left px-4 py-2 rounded-md transition 
              ${activeSection === 'file' 
                ? 'bg-gray-200 text-purple-600 font-semibold flex gap-3' 
                : fileTabLocked 
                  ? 'text-gray-400 flex gap-3' 
                  : 'hover:bg-gray-100 text-gray-600 flex gap-3'}
            `}
          >
            <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/File-icon.svg" alt=""/> File
          </button>
        </li>
      </ul>

      {/* Main Content */}
      <div className="flex-1 border-1 border-[#F4F4F4] pl-5 pt-3 rounded-t-[20px]  mb-[-25px] pb-[30px]">
        {activeSection === 'website' && (
          <div id="Website-page">
            <h4 className="text-xl font-bold mb-1">Website</h4>
            <p className="text-[#7A7A7A] mb-2">
              Enter the URL of the website you want to build a chatbot for.
            </p>
          
          </div>
        )}

        {activeSection === 'file' && (
          <div id="File-page">
            
          </div>
        )}
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