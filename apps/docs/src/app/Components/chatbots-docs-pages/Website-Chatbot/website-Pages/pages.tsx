'use client'; 
import Link from 'next/link';
import { useState } from 'react';


export default function WebsitePages(){
    const [activeSection, setActiveSection] = useState<'web' | 'file'>('web');
    
      // Simulate file content (you can replace with actual logic)
      const [fileContent, setFileContent] = useState('');
    
      // Disable File tab if content is empty or only whitespace
      const fileTabLocked = fileContent.trim() === '';
        return(
        <>
        <div className="bg-[#F9F0FF] px-1 py-10">

        <h2 className="text-center font-bold text-[30px] ">Add a Chatbot to Your Website</h2>
          
        <div className="mt-10 flex gap-7 items-center justify-evenly">
                    {/* This section for future added more information*/}
        <div className="bg-white pt-[10px] pl-[15px] text-[10px] rounded-[20px] shadow-lg w-[420px] border-1 border-[#F2F2F2]">
        <div className="">
                <h2 className="font-bold">Create Chatbot</h2>
                <p className="text-[#7A7A7A]">Create a Chatbot from different sources.</p>
                
               <div className="flex  mt-3">
                
                {/* Tabs */}
                <ul className="space-y-2 font-medium">
                  <li>
                    <button
                      onClick={() => setActiveSection('web')}
                      className={`w-25 text-left px-4 py-2 rounded-[14px] transition 
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
            className={`w-25 text-left px-4 py-2 rounded-md transition 
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
      <div className="flex-1 border-1 border-[#F4F4F4] border-b-[#fff]  pl-5 pt-3 mb-5 ml-4 mr-5 rounded-[20px]">
          <div id="Website-page" className="space-y-4">
            <h4 className="font-bold mb-1">Website</h4>
            <p className="text-[#7A7A7A] mb-2 mt-1s">
              Enter the URL of the website you want <br/> to build a chatbot for.
            </p>

            <div className="mr-3">
            <h4 className="font-semibold">URL</h4>
            <input type="text" value={"https://Corpusai.io"} className="bg-[#F5E4FF] border-1 border-[#E7C0FF] outline-0 font-medium rounded-[5px] p-1 w-full  "  />
            </div>    
            
            <div className="space-y-1">
                <h4 className='font-semibold'>Language</h4>
                <div 
                className="bg-white flex justify-between items-center pl-3 border-1 border-[#E9E9E9]  rounded-[5px] w-30"
                >English
                <img src="/Website Assets/Arrow Down.svg" alt="" />
                </div>
                <p className='text-[#7A7A7A] '>Select language of source website</p>
            </div>
             <button className="bg-[#BF56FF] text-[#fff] p-1 rounded-[5px]">Build Now</button>
          </div>

      </div>
    </div>   
    </div>
  </div>
    <div className='w-65 space-y-2 text-[15px]'>
        <p className="text-[#BF56FF] ">Setup</p>
        <h2 className="font-bold text-[23px]">Provide Your Website Domain</h2>
        <p className='text-[#7F7A7A] text-justify'>
            Simply input your website's domain or subdomain. Corpus AI chatbot will crawl all publicly accessible pages to create a comprehensive knowledge base of your web's content.
        </p>

    </div>
 </div>
 </div>
  <div className="bg-[#F9F0FF] mt-5 px-1 py-[1px]">
        
<div className=' flex my-20 gap-5 items-center justify-evenly'>
       <div className="w-65 space-y-2 text-[15px]">
         <p className='text-[#BF56FF]'>Process</p>
        <h1 className="font-bold text-[23px]">
            Analyze & Index
        </h1>
       <p className='text-[#7F7A7A] text-[15px] text-justify'>
            Corpus AI chatbots learn from every page—understanding text, images, charts, and tables—ensuring it capture all the key information. Once the process is complete, your website chatbot is ready to engage.
        </p>
       </div>
        <div className='bg-white p-5 rounded-[10px] shadow-lg border-1 border-[#F2F2F2]'>
            <h2 className='font-bold'>Chatbot Build</h2>
            <p className='text-[#7A7A7A]'>View your chatbot status</p>

            <div className='space-y-2.5 px-15 py-4 text-[#7A7A7A]'>
               <div className='flex gap-5 items-center'>
                    <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/Check-green.svg" alt="" className='bg-[#D6FFEC] p-2 rounded-full '/>
                    <p>Start Crawling HTML Files</p>
               </div>
               <div className='flex gap-5 items-center'>
                     <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/round-circle.svg" alt="" className='bg-[#D6FFEC] p-2.5 rounded-full w-10 h-10'/>
                    <p>Parsing Web Pages <br/>
                      <div className="text-[13px]"> Parsed Pages: 84 </div>
                    </p>
               </div>
               <div className='flex gap-5 items-center'>
                     <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/Check-gray.svg" alt="" className='bg-[#EDEDED] p-2 rounded-full '/>
                    <p>Processing Documents</p>
               </div>
               <div className='flex gap-5 items-center'>
                     <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/Check-gray.svg" alt="" className='bg-[#EDEDED] p-2 rounded-full '/>
                    <p>Building Document Index</p>
               </div>
            </div>
        </div>
    </div>
    
    <div className='flex gap-10 items-center justify-evenly'>
        <div className='bg-white w-130 p-5 rounded-[10px] border-1 border-[#F2F2F2] space-y-3 '>
            <p className='py-2 px-5 text-right ml-75 bg-[#BF56FF] border-1 border-[#F2DDFF] text-[#fff] rounded-[10px]'>Is Corpusbot free?</p>
            <div className='bg-[#F8ECFF] mb-10 border-1 border-[#F2DDFF] p-3 rounded-[10px] w-105 text-[11px] space-y-4'>
                <p className='font-bold text-justify'>Yes, Corpus.ai does offer a free plan. According to the sources, the Free Plan includes:</p>
                 <p className='text-[#5A5A5A] ml-3'>
                    1 CorpusBot <br/><br/>

                    20 queries per month<br/><br/>
                    <div className='flex items-center '>
                    Ability to store up to 100 documents or web pages  <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/circle-stars.svg" alt=""/>
                    </div>
                 </p>
<p className='font-bold text-justify'>
  <span>
    This free plan is described as "ideal for startups wanting to test basic features at no cost"
    <img 
      src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/circle-stars.svg" 
      alt="" 
      className="inline align-middle ml-1" 
    />
  </span>
  <span>
    and is "perfect for testing the tool at no cost"
    <img 
      src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/circle-stars.svg" 
      alt="" 
      className="inline align-middle ml-1" 
    />
  </span>
</p>

<p className='font-bold text-justify'>
  <span>
    If you need more features or capacity, Denser.ai also offers paid plans starting with the
    Starter Plan at $19 monthly, which includes 2 DenserBots and 1,500 queries per month
  </span>
  <img 
    src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/circle-stars.svg" 
    alt="" 
    className="inline align-middle ml-1" 
  />
</p>


            </div>
        </div>
        <div>
            <div className="w-80 space-y-2 text-[15px]">
         <p className='text-[#BF56FF]'>Launch</p>
        <h1 className="font-bold text-[23px]">
            Start Chatting
        </h1>
       <p className='text-[#7F7A7A] text-[15px] text-justify'>
           Deploy the chatbot on your website and answer questions in natural languages. From your products to services and policies, the AI chatbot provides full customer support on your website. Customers will receive instant, AI-powered responses with direct links to the relevant pages for more details.
        </p>
       </div>    
        </div>
    </div>
</div>


        </>
    );
}