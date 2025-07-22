'use client'; 
import Link from 'next/link';
import { useState, useEffect } from 'react';
import AddChatbot from "./website-Pages/Website-chatbot-add-code";
import Process from "./website-Pages/process-code";
import ChatbotGuide from "./website-Pages/CHatbot-Guide";
import WebsiteReasons from './website-Pages/Website-Reason';
import WebsiteFeatures from './website-Pages/Website-Features';
import WebsiteChatbotDesign from "./website-Pages/website-chatbot";
import FAQ from "./website-Pages/Website-FAQ";
import AnimatedSection from "./AnimatedSection";


export default function WebsiteChatbot(){
  const [activeSection, setActiveSection] = useState<'web' | 'file'>('web');

  // Simulate file content (you can replace with actual logic)
  const [fileContent, setFileContent] = useState('');

  // Disable File tab if content is empty or only whitespace
  const fileTabLocked = fileContent.trim() === '';

  const [showTopSection, setShowTopSection] = useState(true);

useEffect(() => {
  const handleScroll = () => {
    const scrollTop = window.scrollY;

    if (scrollTop > 15) {
      setShowTopSection(false); // hide if scroll past 100px
    } else {
      setShowTopSection(true); // show when near top
    }
  };

  window.addEventListener('scroll', handleScroll);

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);

  
    return(
        <>
          
            <main className="flex-1 flex">
            {/* <div className="flex-1 mt-[30px] ml-15 mr-5 text-[14px]"> */}
              <div className="w-full max-w-auto pt-[1px] pl-[10px]  overflow-x-hidden">

             <p className="text-[#7F7F7F] ">Chatbot</p>
                        
            {/* Website Chatbot Content */}

            <h2  className="font-bold  mt-1 text-[20px] dark:text-white">Website Chatbot</h2>

            <p className="text-justify mt-2 text-[#777777]  space-y-2 dark:text-white">After you log in with one the following: Google login, Facebook login or sign up with Corpus, you will see the chatbot home as follows.</p>    
            
            <div className="bg-white mx-auto mt-4 py-[30px] pt-3 px-5 w-auto h-auto shadow-lg rounded-[10px] ">
            <div className="flex justify-between">
                <div>
                  <h2 className="font-bold">Chatbots</h2> 
                  <p className="text-[#7F7F7F]">There are no Chatbots</p>
                </div>
                <button className="border-1 border-[#EAEAEA] p-2 rounded-[5px] pt-1 pb-0 pl-3 pr-3 cursor-pointer h-9">Add Bot</button>
            </div>
           <div className="text-center mt-2 space-y-1">
            <img 
              src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/Box website chatbot.svg" 
              alt="" 
              className="mx-auto w-[100px]" 
            />
            <p className="mt-5 font-bold">There are no Chatbots</p>
            <p className="text-[#7F7F7F]">Create new chatbots to get started</p>
            
            <button className="bg-[#BF56FF] border-1 border-[#EAEAEA] p-2 mt-1 rounded-[5px] cursor-pointer text-white">Create Now</button>
            </div>
            
            </div> 
            <p className=" text-justify mt-3 mb-3 text-[#777777] dark:text-white">
              When you click Create Now button, you will reach the chatbot building page (see below). Make sure  that the WEB tab is selected and input the website you’d like to crawl (https://corpusai.io in this case). Click the button Build Now to start building a chatbot on the website.
            </p>
          {showTopSection && (
  <div className="transition-opacity duration-300">
          {/* This section for future added more information*/}
          <div className="bg-white w-auto pt-[15px] pl-[25px] rounded-t-[20px] shadow-lg ">
            <div className="">
                <h2 className="font-bold">Create Chatbot</h2>
                <p className="text-[#7A7A7A]">Create a Chatbot from different sources.</p>
          <div className="flex gap-5 mt-3">
                
                {/* Tabs */}
                <ul className="space-y-2 text-sm font-medium w-40">
                  <li>
                    <button
                      onClick={() => setActiveSection('web')}
                      className={`w-full text-left px-4 py-2 rounded-[14px] transition 
                        ${activeSection === 'web' 
                          ? 'bg-gray-200 text-purple-600 font-semibold flex gap-3' 
                          : 'hover:bg-gray-100 text-gray-600 flex gap-3'}
                      `}
                      >
                      <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/Browser-icon.svg" alt=""/> Web
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
{/**/}
      {/* Main Content */}
      <div className="flex-1 border-1 border-[#F4F4F4] mr-[15px] pl-5 pt-3 rounded-t-[20px]  ">
        {activeSection === 'web' && (
          <div id="Website-page">
            <span className="font-bold mb-1">Website</span>
            <p className="text-[#7A7A7A] mb-2 mt-1 text-[10px] ">
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
  )}
<main className="overflow-y-hidden">
  {/* All your content including <AnimatedSection /> */}

<AnimatedSection><AddChatbot /></AnimatedSection>
<AnimatedSection><Process /></AnimatedSection>
<AnimatedSection><ChatbotGuide /></AnimatedSection>
<AnimatedSection><WebsiteReasons /></AnimatedSection>
<AnimatedSection><WebsiteFeatures /></AnimatedSection>
<AnimatedSection><WebsiteChatbotDesign /></AnimatedSection>
<AnimatedSection><FAQ /></AnimatedSection>
</main>
    </div>
  </main>

   {/*  Fixed Right Sidebar */}
          <aside className=" w-64 fixed top-0 right-[20px] h-full p-4 pt-[30px] z-0 lg:block sm:hidden hidden">
            <div className="flex items-center gap-2 text-gray-400 font-medium mb-2">
              <img src="/Website Assets/Sidebar-Alighment.svg" alt="" />
              <span>On this page</span>
            </div>
            <ul>
              <li className="bg-white p-1 pl-4 rounded border border-[#EAEAEA] dark:bg-[#202020] dark:border-[#2C2C2C] text-[#7F7F7F]">
                <p>No Heading</p>
              </li>
            </ul>
          </aside>   

        </>
    );
}