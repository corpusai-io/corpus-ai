"use client";
import { ClientPageRoot } from 'next/dist/client/components/client-page';
import { use, useState } from 'react';
export default function Navbar(){
 const [menuOpen, setMenuOpen] = useState(false);

    return(

<header className="text-gray-600 max-w-7xl body-font border m-4 border-1 border-[#ECECEC] outline-0 rounded-[10px] shadow-[0_8px_16px_0_rgba(194,194,194,0.15)] bg-white w-[90%] mx-auto ">
  <div className="custom-ellipse"></div>
  <div className="container mx-auto p-2 flex flex-wrap items-center justify-between">
    <a className="flex title-font font-medium items-center text-black mb-4 md:mb-0">
      <span className="ml-3 text-xl font-bold">CORPUS AI</span>
    </a>

    
  
<nav id="nav-menu" className="hidden lg:flex flex-wrap items-center text-base justify-center gap-x-8 w-full lg:w-auto">
  
  <div className="relative group">
    
    <a className="hover:text-[#BF56FF] flex items-center gap-1 cursor-pointer">
      Platform
      
      <svg className="w-4 h-4 group-hover:hidden" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
      
      <svg className="w-4 h-4 hidden group-hover:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </a>

    
    <div className="absolute left-0 top-10 mt-2 w-[941px] bg-white rounded-md shadow-lg p-4 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50 grid grid-cols-3 gap-[31px]">
      <div className="block text-gray-700 hover:text-[#BF56FF] py-1">
        <span>Products</span>
        
          <div className="flex items-start space-x-3 py-4">
      <span><img src=" Vector.svg" alt="Chat" className="w-5 h-5" /></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">Corpus Chat</p>
        <p className="text-gray-500 text-xs">AI chatbot for your website</p>
      </div>
    </div>
        
        </div>
      <div className="block text-gray-700 hover:text-[#BF56FF] py-1">
        <span>Use Cases</span>
        <div className="flex items-start space-x-3 py-4">
      <span><img src="Vector(1).svg" alt="B2B" className="w-5 h-5"/></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">B2B Chatbot</p>
        <p className="text-gray-500 text-xs">Specialized chatbot for business interactions</p>
      </div>
    </div>

    <div className="flex items-start space-x-3 py-4">
      <span><img src="customer-service-line.svg" alt="B2B" className="w-5 h-5"/></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">Customer Care Chatbot</p>
        <p className="text-gray-500 text-xs">AI powered customer support automation</p>
      </div>
    </div>
</div>
      
      <div className="block text-gray-700 hover:text-[#BF56FF] py-1">
        <span>Features</span>
        <div className="flex items-start space-x-3 py-4">
      <span><img src="file-pdf-2-line-2 2.svg" alt="B2B" className="w-5 h-5"/></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">Chat with PDF</p>
        <p className="text-gray-500 text-xs">Interactive conversations with your PDF document</p>
      </div>
    </div>

    <div className="flex items-start space-x-3 py-4">
      <span><img src="global-line.svg" alt="B2B" className="w-5 h-5"/></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">Chatbot on Website</p>
        <p className="text-gray-500 text-xs">Embed AI chatbot on your website</p>
      </div>
    </div>

    <div className="flex items-start space-x-3 py-4">
      <span><img src="wechat-line.svg" alt="B2B" className="w-5 h-5"/></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">Chat with Bot</p>
        <p className="text-gray-500 text-xs">Engage with your documents intelligently</p>
      </div>
    </div>
        </div>
    </div>
  </div>

  
  <div className="relative group">
    
    <a className="hover:text-[#BF56FF] flex items-center gap-1 cursor-pointer">
      Integrations
      
      <svg className="w-4 h-4 group-hover:hidden" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
      
      <svg className="w-4 h-4 hidden group-hover:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </a>

    
    <div className="absolute left-0 top-10 mt-2 w-[602px] bg-white rounded-md shadow-lg p-4 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50s">
      <div className="block text-gray-700 hover:text-[#BF56FF] py-1">
        <span>Products</span></div>
        <div className="grid grid-cols-2 gap-[31px]">
          <div>
      <div className="flex items-center space-x-3 py-4">
      <span><img src="Group.svg" alt="Chat" className="w-5 h-5" /></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">Slack</p>
        <p className="text-gray-500 text-xs">Connect with slack</p>
      </div>
      </div>

      <div className="flex items-center space-x-3 py-4">
      <span><img src="wordpress-icon.svg" alt="Chat" className="w-5 h-5 " /></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">WordPress</p>
        <p className="text-gray-500 text-xs">Connect with WordPress</p>
      </div>
      </div>

      <div className="flex items-center space-x-3 py-4">
      <span><img src="zapier.svg" alt="Chat" className="w-5 h-5 " /></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">Zapier</p>
        <p className="text-gray-500 text-xs">Connect with Zapier</p>
      </div>
      </div>

      <div className="flex items-center space-x-3 py-4">
      <span><img src="telegram.svg" alt="Chat" className="w-5 h-5 " /></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">Telegram</p>
        <p className="text-gray-500 text-xs">Connect with Telegram</p>
      </div>
      </div>
    </div>
    <div className="pl-2">
    <div className="w-[256px] h-[132px] bg-purple-400 rounded-[20px] bg-gradient-to-r from-[#F1E7FF] via-[#D9A1FF] to-[#BF56FF] flex justify-center items-center font-bold text-3xl text-white">CORPUS AI</div>
    <h2 className="py-3 text-[#BF56FF]"><a href="#">Integrations</a></h2>
    <p className="text-sm text-[#7E7E7E]">Need a custom integration? We can help you build the perfect solution for your specific needs.</p>
    <h2 className="py-3 text-[#BF56FF]"><a href="#">Contact us<span>↗</span></a></h2>
    </div>
    
    </div>
    </div>
  </div>

  <div className="relative group">
    
    <a className="hover:text-[#BF56FF] flex items-center gap-1 cursor-pointer">
      Solutions
      
      <svg className="w-4 h-4 group-hover:hidden" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
      
      <svg className="w-4 h-4 hidden group-hover:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </a>

    
    <div className="absolute left-0 top-10 mt-2 bg-white rounded-md shadow-lg p-4 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50 w-[616px]">
      <div>
        <div className="">Solutions</div>
        <div className="grid grid-cols-2 gap-[31px]">
          <div>

             <div className="flex items-start space-x-3 py-4">
      <span><img src="education.svg" alt="Chat" className="w-[24px] h-[24px] " /></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">Education</p>
        <p className="text-gray-500 ">AI solutions for Educational Institutions</p>
      </div>
      </div>

       <div className="flex items-start space-x-3 py-4">
      <span><img src="healthcare.svg" alt="Chat" className="w-[24px] h-[24px] " /></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">Healthcare</p>
        <p className="text-gray-500 ">AI solutions for Health Care Providers</p>
      </div>
      </div>

       <div className="flex items-start space-x-3 py-4">
      <span><img src="workspace.svg" alt="Chat" className="w-[24px] h-[24px] " /></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">Workplace</p>
        <p className="text-gray-500 text-xs">AI solutions for Workplace operations</p>
      </div>
      </div>

          </div>
          <div>

             <div className="flex items-start space-x-3 py-4">
      <span><img src="government.svg" alt="Chat" className="w-[24px] h-[24px] " /></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">Government</p>
        <p className="text-gray-500 text-xs">Public section solutions for Government</p>
      </div>
      </div>

       <div className="flex items-start space-x-3 py-4">
      <span><img src="legal.svg" alt="Chat" className="w-[24px] h-[24px] " /></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">Legal</p>
        <p className="text-gray-500 text-xs">AI solutions for Legal Practioners</p>
      </div>
      </div>

          </div>
        </div>
      </div>
      
    </div>
  </div>

<a className="hover:text-[#BF56FF] flex items-center gap-1 cursor-pointer">
      Affiliates
    </a>

<a className="hover:text-[#BF56FF] flex items-center gap-1 cursor-pointer">
      Pricing
    </a>


     <div className="relative group">
    
    <a className="hover:text-[#BF56FF] flex items-center gap-1 cursor-pointer">
      Resources
      
      <svg className="w-4 h-4 group-hover:hidden" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
      
      <svg className="w-4 h-4 hidden group-hover:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </a>

    
    <div className="absolute left-0 top-10 mt-2 w-[350px] gap-[27px] bg-white rounded-md shadow-lg p-4 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50">
      <div>
        <div>Resources</div>
        <div>
      <div className="flex items-start space-x-3 py-3">
      <span><img src="pages-line.svg" alt="Chat" className="w-5 h-5" /></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">Blog</p>
        <p className="text-gray-500 text-xs">Latest updates and insights from our team</p>
      </div>
      </div>

<div className="flex items-start space-x-3 py-4">
      <span><img src="file-line.svg" alt="Chat" className="w-5 h-5" /></span>
      <div>
        <p className="font-semibold text-[#1E1E1E]">Documentation</p>
        <p className="text-gray-500 text-xs">Latest updates and insights from our team</p>
      </div>
      </div>


        </div>
      </div>
      
    </div>
  </div>
  
</nav>


  <button className="inline-flex items-center bg-[#BF56FF] border-1 border-white py-1 px-3 focus:outline-none text-white font-medium rounded-[10px] text-base mt-0 md:mt-0 shadow-[0_4px_8px_0_rgba(220, 220, 220, 1)] hidden lg:inline-flex transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] " >Get Started</button>

  <div className="block lg:hidden">
      <button  onClick={() => setMenuOpen(!menuOpen)} id="menu-toggle" className="text-black focus:outline-none">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>

  </div>

   <div id="mobile-nav" className="lg:hidden hidden p-4">
     <nav className="flex flex-col space-y-4">
      
      <a href="#" className="text-black hover:text-[#BF56FF]">Platform</a>
      <a href="#" className="text-black hover:text-[#BF56FF]">Integrations</a>
      <a href="#" className="text-black hover:text-[#BF56FF]">Solutions</a>
      <a href="#" className="text-black hover:text-[#BF56FF]">Affiliates</a>
      <a href="#" className="text-black hover:text-[#BF56FF]">Pricing</a>
      <a href="#" className="text-black hover:text-[#BF56FF]">Resources</a>
      <button className="inline-flex items-center bg-[#BF56FF] border-0 py-1 px-3 focus:outline-none text-white font-medium rounded text-base shadow-[0_4px_8px_0_rgba(220, 220, 220, 1)] w-full">Get Started</button>
    </nav>
   </div>
</header>


    );
}
