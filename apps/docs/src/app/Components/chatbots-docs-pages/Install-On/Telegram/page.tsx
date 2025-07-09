'use client'; 
import Link from 'next/link';
import { useEffect, useState } from 'react';

const sections = [
  { id: "Telegram", text: "Create a Telegram Page" },
  { id: "Link_Telegram", text: "Link your Chatbot to Telegram" },
  { id: "Test_Telegram", text: "Test your Telegram Integration" },
  { id: "Add_To_Channel", text: "Optional: Add your Bot to a Telegram Channel" },
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
            <div id="Telegram" className="flex-1 mt-[30px] ml-15 mr-5">

           {/* Create a Telegram Page Start Here*/}
             <p className="flex items-center text-[#7F7F7F] text-[14px]" >Integration
               <img src="/Website Assets/Arrow Left.svg" alt="" className="w-4 h-4"/>
               Install On</p>

               <h1  className="font-bold  mt-3 text-2xl " >Telegram</h1>

              <p className="text-[#7F7F7F] mt-1">
                Integrate your chatbot with Telegram. Ask your chatbot questions from a Telegram channel <br/> and receive responses as Telegram messages.
              </p>
              
              <div className="bg-[#fff] p-5 mt-2 w-[640px] rounded-[10px] shadow">
                 <div className="flex item-center gap-3">
                    
                      <img src="/Website Assets/chatbot-docs-pages-icons/Telegram Icons/i.svg" alt=""  className="bg-[#BF56FF] p-1 mt-1 rounded-[24px] w-4 h-4"/>
                      {/* <img src="/Website Assets/chatbot-docs-pages-icons/Telegram Icons/telegram-!-icon.svg" alt=""  className="absolute left-88 top-42.5"/> */}
                   
                    
                    <p className="text-[14px] text-[#7F7F7F]">This guide assumes you already have a chatbot at Denser.ai. If not, follow one of these <br/> guides to create your chatbot by feeding it documents about your products:</p>
              </div> 
               <div className="text-[14px] pl-8 pt-2">
                  <div className="flex gap-3">
                      <img src="/Website Assets/chatbot-docs-pages-icons/Telegram Icons/Dot-icon.svg" alt="" />
                      Website Chatbot
                  </div>
                  <div className="flex gap-3">
                      <img src="/Website Assets/chatbot-docs-pages-icons/Telegram Icons/Dot-icon.svg" alt="" />
                      File Chatbot
                  </div>
                </div>
            </div>
            <p className="text-[#777777] mt-[20px] mb-[20px]">
            If your chatbot has not been integrated with Telegram before, you'll need to create a new <br/> Telegram   Bot first.  
            </p>   
              <img src="/Website Assets/chatbot-docs-pages-icons/Telegram Icons/Telegram-chat.svg" alt="" className="bg-[#3B2563] p-[15px] mt-2 w-[640px] h-[350px] pb-[40px] pt-[30px]" />
              <p className="text-[#777777] mt-[20px] mb-[20px]">
                Type <b className="text-[#000]">/newbot</b> to trigger the new bot command. Follow the instructions and note down your <br/> API Token. 
              </p>
        {/* Create a Telegram Page End Here*/}

        {/* Link your Chatbot to telegram Start Here*/}
          <h1 id="Link_Telegram">Link your Chatbot to telegram</h1>
        {/* Link your Chatbot to telegram End Here*/}

        {/* Test your Telegram Integration Start Here*/}
           <h1 id="Test_Telegram" className="mt-[300px]">Test your Telegram Integration</h1> 
        {/* Test your Telegram Integration End Here*/}

        {/* Optional: Add your Bot to a Telegram Channel Start Here*/}
           <h1 id="Optional_BOT">Optional: Add your Bot to a Telegram Channel</h1>
        {/* Optional: Add your Bot to a Telegram Channel End Here */}

        {/* Revoke Telegram Integration Start Here*/}
          <h1 id="Revoke_Telegram">Revoke Telegram Integration</h1>
        {/* Revoke Telegram Integration End Here */}
        
       
       
        </div>
  </main>


<div className="w-64 pt-13 fixed top-0 right-0 overflow-y-auto">
  <div className="flex items-center gap-2 text-gray-400 font-medium mb-2">
    <img src="/Website Assets/Sidebar-Alighment.svg" alt="" />
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