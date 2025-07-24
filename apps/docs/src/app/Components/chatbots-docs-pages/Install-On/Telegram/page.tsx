'use client'; 
import Link from 'next/link';
import { useEffect, useState } from 'react';
import TelegramStep1 from "./Telegram-Pages/Telegram-setup-1";
import TelegramStep2 from "./Telegram-Pages/Telegram-Step-2";
import TelegramStep3 from "./Telegram-Pages/Telegram-Step-3";
import TelegramFeatures from './Telegram-Pages/Telegram-Benefits-Features';
import TelegramBenefitsFeatures from "./Telegram-Pages/Telegram-Features";
import TelegramFAQ from "./Telegram-Pages/Telegram-FAQ";
import AnimatedSection from './AnimatedSection';


const sections = [
  { id: "Telegram", text: "Create a Telegram Page" },
  { id: "Link_Telegram", text: "Link your Chatbot to Telegram" },
  { id: "Test_Telegram", text: "Test your Telegram Integration" },
  { id: "Optional_BOT", text: "Optional: Add your Bot to a Telegram Channel" },
  { id: "Revoke_Telegram", text: "Revoke Telegram Integration" },
];

export default function WebsiteChatbot(){
  const [activeSection, setActiveSection] = useState<'web' | 'file'>('web');

  // Simulate file content (you can replace with actual logic)
  const [fileContent, setFileContent] = useState('');

  // Disable File tab if content is empty or only whitespace
  const fileTabLocked = fileContent.trim() === '';

  const [activeId, setActiveId] = useState(sections[0].id); // First section active by default

  useEffect(() => {
    const handleScroll = () => {
      let found = false;
      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= -100 && rect.top < window.innerHeight / 2) {
            setActiveId(sections[i].id);
            found = true;
            break;
          }
        }
      }
      if (!found) setActiveId(sections[0].id);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // trigger once on load

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

    return(
        <>
        <main className="flex-1 flex">
        <div id="Telegram" className="w-full max-w-auto overflow-x-hidden">

           {/* Create a Telegram Page Start Here*/}
             <p className="flex items-center text-[#7F7F7F]" >Integration
               <img src="/website-assets/Arrow Left.svg" alt="" className="w-4 h-4"/>
               Install On</p>

               <h1  className="font-bold mt-2 text-2xl">Telegram</h1>

              <p className="text-[#7F7F7F] mt-1">
                Integrate your chatbot with Telegram. Ask your chatbot questions from a Telegram channel and receive responses as Telegram messages.
              </p>
              
              <div className="bg-[#fff] p-5 mt-2 max-w-auto rounded-[10px] shadow">
                 <div className="flex item-center gap-3">
                    
                      <img src="/website-assets/chatbot-docs-pages-icons/Telegram Icons/i.svg" alt=""  className="bg-[#BF56FF] p-1 mt-1 rounded-[24px] w-4 h-4"/>
                      {/* <img src="/website-assets/chatbot-docs-pages-icons/Telegram Icons/telegram-!-icon.svg" alt=""  className="absolute left-88 top-42.5"/> */}
                   
                    
                    <p className=" text-[#7F7F7F]">This guide assumes you already have a chatbot at Denser.ai. If not, follow one of these  guides to create your chatbot by feeding it documents about your products:</p>
              </div> 
               <div className="text-[14px] pl-8 pt-2">
                  <div className="flex gap-3">
                      <img src="/website-assets/chatbot-docs-pages-icons/Telegram Icons/Dot-icon.svg" alt="" />
                      Website Chatbot
                  </div>
                  <div className="flex gap-3">
                      <img src="/website-assets/chatbot-docs-pages-icons/Telegram Icons/Dot-icon.svg" alt="" />
                      File Chatbot
                  </div>
                </div>
            </div>
            <p className="text-[#777777] mt-[15px] mb-[15px] ">
            If your chatbot has not been integrated with Telegram before, you'll need to create a new Telegram Bot first.  
            </p> 
           <div className="bg-[#3B2563] flex items-center justify-center p-[15px] mt-4 w-full h-auto pb-[40px] pt-[30px]">
  <img 
    src="/website-assets/chatbot-docs-pages-icons/Telegram Icons/Telegram-chat.svg" 
    alt="Telegram Chat Icon" 
    className="" 
  />
</div>

              <p className="text-[#777777] mt-[20px] mb-[20px]">
                Type <b className="text-[#000]">/newbot</b> to trigger the new bot command. Follow the instructions and note down your API Token. 
              </p>
        {/* Create a Telegram Page End Here*/}
        <main className='overflow-y-hidden'>
        {/* Link your Chatbot to telegram Start Here*/}
          <div id="Link_Telegram">
            <AnimatedSection ><TelegramStep1 /></AnimatedSection>
          </div>
        {/* Link your Chatbot to telegram End Here*/}

        {/* Test your Telegram Integration Start Here*/}
           <div id="Test_Telegram">
              <AnimatedSection ><TelegramStep2 /></AnimatedSection>
            </div> 
        {/* Test your Telegram Integration End Here*/}

        {/* Optional: Add your Bot to a Telegram Channel Start Here*/}
           <div id="Optional_BOT">
            
              <AnimatedSection ><TelegramStep3 /></AnimatedSection>
           </div>
        {/* Optional: Add your Bot to a Telegram Channel End Here */}

        {/* Revoke Telegram Integration Start Here*/}
          <div id="Revoke_Telegram">

          </div>
        {/* Revoke Telegram Integration End Here */}

        {/* Telegram Benefits Start Here */}
        <AnimatedSection ><TelegramBenefitsFeatures/></AnimatedSection>
        {/* Telegram Benefits Features END Here */}

        {/* Telegram Features Start Here */}
              <AnimatedSection ><TelegramFeatures /></AnimatedSection>
        {/* Telegram Features END Here */}
        
        {/* Telegram FAQ Start Here */}
        <AnimatedSection ><TelegramFAQ /></AnimatedSection>
        {/* Telegram FAQ END Here */}

        </main>
        </div>
  </main>


<div className="w-64 pt-13 fixed top-0 right-0 overflow-y-auto lg:block sm:hidden hidden">
  <div className="flex items-center gap-2 text-gray-400 font-medium mb-2">
    <img src="/website-assets/Sidebar-Alighment.svg" alt="" />
    <span>On this page</span>
  </div>

<ul className="text-[14px] space-y-3.5 ml-[4px] border-l-1 border-l-[#D8D8D8]">
  {sections.map((item, index) => (
    <li
      key={index}
      className={`ml-[-1px] pl-3 transition-all duration-200 border-l-2 hover:border-[#BF56FF]  ${
        activeId === item.id
          ? 'border-[#BF56FF]'
          : 'border-transparent'
      }`}
    >
      <Link
        href={`#${item.id}`}
        className={`block transition-all duration-200 ${
          activeId === item.id
            ? 'text-[#BF56FF]'
            : 'text-[#777777] hover:text-[#BF56FF]'
        }`}
      >
        {item.text}
      </Link>
    </li>
  ))}
</ul>
</div>



        
        </>
    );
}