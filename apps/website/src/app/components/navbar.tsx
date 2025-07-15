"use client";
import { ClientPageRoot } from 'next/dist/client/components/client-page';
import Link from 'next/link';
import { use, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
export default function Navbar(){
 const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsVisible(!isVisible);
  const closeDropdown = () => setIsVisible(false);
    return(

<header className="sticky z-20 text-gray-600 max-w-6xl body-font border-1 bg-white border-[#ECECEC] outline-0 rounded-[10px] shadow-[0_8px_16px_0_rgba(194,194,194,0.15)] w-[94%] mx-auto mt-[55px]">
  <div className="container-fluid p-2 flex  flex-wrap items-center justify-between">
    <div className='flex justify-between  w-auto gap-10'>
    <Link href="/" className="flex title-font font-medium text-center items-center text-black  md:mb-0"><img src="/logo.svg" alt="Corpus AI Logo" className="ml-3 h-6 w-auto"/>
    </Link>
    <nav id="nav-menu" className="hidden lg:flex flex-wrap items-center text-base justify-center gap-x-[30px] w-full lg:w-auto">
  
  <div className="relative group">
    
    <a onMouseEnter={()=>{setIsVisible(true)}} className="hover:text-[#BF56FF] flex items-center gap-1 cursor-pointer" >
      Platform
      
      <svg className="w-4 h-4 group-hover:hidden" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
      
      <svg className="w-4 h-4 hidden group-hover:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </a>

    {isVisible && (
    <div  className={`absolute left-0 top-10 mt-2 w-[941px] bg-white rounded-md shadow-lg p-4 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50 grid grid-cols-3 gap-[31px]`}>
      <div className="block text-gray-700 hover:text-[#BF56FF] py-1">
        <span className='pl-[35px] text-[#8D8D8D]'>Products</span>
        
         <Link href='/Platform/Corpus-ChatPage' onClick={closeDropdown}> <div className="flex items-start gap-[9px] mt-[27px] hover:bg-gray-100 p-2 rounded-md pl-[35px]" >
      <span><Image src="/Vector.svg" alt="Chat" height={24} width={24} /></span>
      <div>
        <p className="font-medium  text-[#1E1E1E]">Corpus Chat</p>
        <p className="text-[#747474]  text-base">AI chatbot for your website</p>
      </div>
    </div></Link>
        
        </div>
      <div className="block text-gray-700 hover:text-[#BF56FF] py-1 p">
        <span className='text-[#8D8D8D]'>Use Cases</span>
       <Link href="/Platform/B2B-ChatBot" onClick={closeDropdown}> <div className="flex items-start space-x-3 mt-[27px] hover:bg-gray-100 p-2 rounded-md ">
      <span><Image src="/Vector(1).svg" alt="B2B" width={24} height={24}/></span>
      <div>
        <p className="font-medium text-[#1E1E1E]">B2B Chatbot</p>
        <p className="text-[#747474]  text-base">Specialized chatbot for business interactions</p>
      </div>
    </div></Link>

    <Link href="/Platform/CustomerCare-Page" onClick={closeDropdown}><div className="flex items-start space-x-3 mt-[27px] hover:bg-gray-100 p-2 rounded-md ">
      <span><Image src="/customer-service-line.svg" alt="B2B" width={24} height={24}/></span>
      <div>
        <p className="font-medium text-[#1E1E1E]">Customer Care Chatbot</p>
        <p className="text-[#747474]  text-base">AI powered customer support automation</p>
      </div>
    </div></Link>
</div>
      
      <div className="block text-gray-700 hover:text-[#BF56FF] py-1">
        <span className='text-[#8D8D8D]'>Features</span>
       <Link href="/Platform/Chat-With-PDF-Page" onClick={closeDropdown}><div className="flex items-start space-x-3 mt-[27px] hover:bg-gray-100 p-2 rounded-md ">
      <span><Image src="/file-pdf-2-line-2 2.svg" alt="B2B" height={24} width={24}/></span>
      <div>
        <p className="font-medium text-[#1E1E1E]">Chat with PDF</p>
        <p className="text-[#747474]  text-base">Interactive conversations with your PDF document</p>
      </div>
    </div></Link>

    <Link href="/Platform/ChatBot-On-WebPage" onClick={closeDropdown}><div className="flex items-start space-x-3 mt-[27px] hover:bg-gray-100 p-2 rounded-md ">
      <span><Image src="/global-line.svg" alt="B2B" width={24} height={24}/></span>
      <div>
        <p className="font-medium text-[#1E1E1E]">Chatbot on Website</p>
        <p className="text-[#747474]  text-base">Embed AI chatbot on your website</p>
      </div>
    </div></Link>

    <Link href= "/Platform/Chat-With-Bot-Page" onClick={closeDropdown}>
    <div className="flex items-start space-x-3 mt-[27px] hover:bg-gray-100 p-2 rounded-md ">
      <span><Image src="/wechat-line.svg" alt="B2B" width={24} height={24} /></span>
      <div>
        <p className="font-medium text-[#1E1E1E]">Chat with Bot</p>
        <p className="text-[#747474]  text-base">Engage with your documents intelligently</p>
      </div>
    </div>
    </Link>
        </div>
    </div>

      )}
        </div>

  
  <div className="relative group">
    
    <a onMouseEnter={()=>{setIsVisible(true)}}  className="hover:text-[#BF56FF] flex items-center gap-1 cursor-pointer">
      Integrations
      
      <svg className="w-4 h-4 group-hover:hidden" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
      
      <svg className="w-4 h-4 hidden group-hover:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </a>

    {isVisible && (
    <div className="absolute left-0 top-10 mt-2 w-[602px] bg-white rounded-md shadow-lg p-4 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50s">
      <div className="block text-gray-700 hover:text-[#BF56FF] ">
        <span className='pl-[35px] mt-[23px] text-[#8D8D8D]'>Integrations</span></div>
        <div className="grid grid-cols-2 gap-[31px]">
          <div className='flex flex-col gap-4'>
      <div className="flex items-center pl-[33px] gap-[9px] mt-[27px] hover:bg-gray-100 p-2 rounded-md " onClick={closeDropdown}>
      <span><Image src="/socials-icons/Slack.svg" alt="Chat" width={24} height={24} /></span>
      <Link href="/Integrations/Slack"><div>
        <p className="font-medium text-[#1E1E1E]">Slack</p>
        <p className="text-[#747474]  text-base">Connect with slack</p>
      </div>
      </Link>
      </div>

      <div className="flex items-center pl-[33px] gap-[8px]  hover:bg-gray-100 p-2 rounded-md " onClick={closeDropdown}>
      <span><Image src="/socials-icons/wordpress-icon.svg" alt="Chat" width={24} height={24} /></span>
      <Link href="/Integrations/Wordpress"><div>
        <p className="font-medium text-[#1E1E1E]">WordPress</p>
        <p className="text-[#747474]  text-base">Connect with WordPress</p>
      </div>
      </Link>
      </div>

      <div className="flex items-center pl-[33px] gap-[8px]  hover:bg-gray-100 p-2 rounded-md " onClick={closeDropdown}>
      <span><Image src="/socials-icons/zapier.svg" alt="Chat" width={24} height={24} /></span>
      <Link href="/Integrations/Zapier"><div>
        <p className="font-medium text-[#1E1E1E]">Zapier</p>
        <p className="text-[#747474]  text-base">Connect with Zapier</p>
      </div>
      </Link>
      </div>

      <div className="flex items-center pl-[33px] gap-[9px] hover:bg-gray-100 p-2 rounded-md " onClick={closeDropdown}>
      <span><Image src="/socials-icons/telegram-1 1.svg" alt="Chat" width={24} height={24} /></span>
     <Link href="/Integrations/Telegram"><div>
        <p className="font-medium text-[#1E1E1E]">Telegram</p>
        <p className="text-[#747474]  text-base">Connect with Telegram</p>
      </div>
      </Link>
      </div>
      <div className="flex items-center pl-[33px] gap-[9px]  hover:bg-gray-100 p-2 rounded-md " onClick={closeDropdown}>
      <span><Image src="/socials-icons/whatsapp.svg" alt="Chat" width={24} height={24} /></span>
      <Link href="/Integrations/Whatsapp"><div>
        <p className="font-medium text-[#1E1E1E]">WhatsApp</p>
        <p className="text-[#747474]  text-base">Connect with WhatsApp</p>
      </div>
      </Link>
      </div>
    </div>
    <div className="pl-2">
    <div className="w-[256px] h-[132px] bg-purple-400 rounded-[20px] bg-gradient-to-r from-[#F1E7FF] via-[#D9A1FF] to-[#BF56FF] flex justify-center items-center font-bold text-3xl text-white">CORPUS AI</div>
    <h2 className="py-3 text-[#BF56FF]"><a href="#">Integrations</a></h2>
    <p className="text-base text-[#7E7E7E]">Need a custom integration? We can help you build the perfect solution for your specific needs.</p>
    <h2 className="py-3 text-[#BF56FF]"><a href="#">Contact us<span>↗</span></a></h2>
    </div>
    
    </div>
    </div>
    )}
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

    
    <div className="absolute left-0 top-10 mt-2 bg-white rounded-md shadow-lg pl-[35px] opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50 w-[616px]">
      <div>
        <div className=" mt-[23px] text-[#8D8D8D]">Solutions</div>
        <div className="grid grid-cols-2 gap-[31px]">
          <div>

             <div className="flex items-start space-x-3 py-4">
      <span><Image src="/education.svg" alt="Chat" width={24} height={24} /></span>
     <Link href='/Solution/Education'><div>
        <p className="font-medium text-[#1E1E1E]">Education</p>
        <p className="text-[#747474]  ">AI solutions for Educational Institutions</p>
      </div>
      </Link>
      </div>

       <div className="flex items-start space-x-3 py-4">
      <span><Image src="/healthcare.svg" alt="Chat" width={24} height={24} /></span>
      
      <Link href='/Solution/Healthcare'><div>
        <p className="font-medium text-[#1E1E1E]">Healthcare</p>
        <p className="text-[#747474]  ">AI solutions for Health Care Providers</p>
      </div>
      </Link>
      </div>

       <div className="flex items-start space-x-3 py-4">
      <span><Image src="/workspace.svg" alt="Chat" width={24} height={24} /></span>
      <Link href='/Solution/Workplace'><div>
        <p className="font-medium text-[#1E1E1E]">Workplace</p>
        <p className="text-[#747474]  text-base">AI solutions for Workplace operations</p>
      </div>
      </Link>
      </div>

          </div>
          <div>

             <div className="flex items-start space-x-3 py-4">
      <span><Image src="/government.svg" alt="Chat" width={24} height={24} /></span>
     <Link href='/Solution/Government'><div>
        <p className="font-medium text-[#1E1E1E]">Government</p>
        <p className="text-[#747474]  text-base">Public section solutions for Government</p>
      </div>
      </Link>
      </div>

      <Link href='/Solution/Legal'>  <div className="flex items-start space-x-3 py-4">
      <span><Image src="/legal.svg" alt="Chat" width={24} height={24} /></span>
     <div>
        <p className="font-medium text-[#1E1E1E]">Legal</p>
        <p className="text-[#747474]  text-base">AI solutions for Legal Practioners</p>
      </div>
      </div></Link>

          </div>
        </div>
      </div>
      
    </div>
  </div>

<a className="hover:text-[#BF56FF] flex items-center gap-1 cursor-pointer">
      Affiliates
    </a>

<Link href= "/Pricing" onClick={closeDropdown} className="hover:text-[#BF56FF] flex items-center gap-1 cursor-pointer">
      Pricing
    </Link>


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

    
    <div className="absolute left-0 top-10 mt-2 w-[350px] gap-[27px] bg-white pl-[26px] rounded-md shadow-lg  opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50">
      <div className='w-[245px]'>
        <div className='mt-[23px] text-[#8D8D8D]'>Resources</div>
        <div>
     <Link href="/Resources/Blog"><div className="flex items-start space-x-3 py-3">
      <span><Image src="/pages-line.svg" alt="Chat" width={24} height={24} /></span>
      <div>
        <p className="font-medium text-[#1E1E1E]">Blog</p>
        <p className="text-[#747474] text-base">Latest updates and insights from our team</p>
      </div>
      </div> </Link>

<div className="flex items-start space-x-3 py-4">
      <span><Image src="/file-line.svg" alt="Chat" width={24} height={24} /></span>
      <div>
        <p className="font-medium text-[#1E1E1E]">Documentation</p>
        <p className="text-[#747474]  text-base">Latest updates and insights from our team</p>
      </div>
      </div>


        </div>
      </div>
      
    </div>
  </div>
  
</nav>
    </div>
   
  


<div className='flex items-center '>


  <button className="inline-flex items-center mr-3 self-end bg-[#BF56FF] border-1 border-white py-1 px-3 focus:outline-none text-white font-medium rounded-[10px] text-base mt-0 md:mt-0 shadow-[0_4px_8px_0_rgba(220, 220, 220, 1)] lg:inline-flex hidden transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] " >Get Started</button>
            <button
        onClick={() => setMenuOpen(!menuOpen)}
        id="menu-toggle"
        className="text-black focus:outline-none lg:hidden"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>
   </div>
   </div>
  <div className="flex items-center">
    
        
        <div
        id="mobile-nav"
        className={`lg:hidden p-4 w-full ${menuOpen ? "" : "hidden"}`}
      >
        <nav className="flex flex-col  space-y-4">
          <a href="#" className="text-black hover:text-[#BF56FF]">
            Platform
          </a>
          <a href="#" className="text-black hover:text-[#BF56FF]">
            Integrations
          </a>
          <a href="#" className="text-black hover:text-[#BF56FF]">
            Solutions
          </a>
          <a href="#" className="text-black hover:text-[#BF56FF]">
            Affiliates
          </a>
          <a href="#" className="text-black hover:text-[#BF56FF]">
            Pricing
          </a>
          <a href="#" className="text-black hover:text-[#BF56FF]">
            Resources
          </a>
          <button className="inline-flex items-center mr-3 self-center bg-[#BF56FF] border-1 border-white py-1 px-3 focus:outline-none text-white font-medium rounded-[10px] text-base mt-0 md:mt-0 shadow-[0_4px_8px_0_rgba(220, 220, 220, 1)] lg:inline-flex hidden transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] " >Get Started</button>
        </nav>
      </div>
      </div>
    

 

   
</header>


    );
}
