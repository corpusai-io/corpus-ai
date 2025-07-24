'use client'; 
import Link from 'next/link';
import { useEffect, useState } from 'react';

const sections = [
  { id: "Free Trial", text: "Free Trial" },
  { id: "Starter", text: "Starter" },
  { id: "Standard", text: "Standard" },
  { id: "Business", text: "Business" }
];

export default function WebsiteChatbot(){
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
              <div className="w-full max-w-auto pt-[1px] pl-[10px]  overflow-x-hidden">

               <h3 className="text-[#7F7F7F]">Billing</h3>
                <h2 className="font-bold text-[22px] text-[#1E1E1E]">Upgrade Plans</h2>
                
                <p className="text-[#777777] mt-2 text-justify">
                    We offer four different subscription plans: <b>Free Trial, Starter, Standard, and Business.</b> Below are the features included in each plan, such as the number of Corpus chatbots, maximum allowed queries, document/webpage limits, and storage capacity.
                </p>

                <div id="Free Trial" className="mt-[30px]">
                    <h2 className="font-bold text-[22px] text-[#1E1E1E]">Free Trial</h2>
                    
                    <div className="text-[#1E1E1E] space-y-1 mt-3">
                        <div><b>Price:</b> $0</div>
                        <div><b>Chatbots:</b> 1</div>
                        <div><b>Queries:</b> Up to 200/month</div>
                        <div><b>Docs/Page Limit:</b> Up to 100/chatbot</div>
                        <div><b>Storage Limit:</b> Up to 50M doc storage</div>
                    </div>
                </div>
                  <div id="Starter" className="mt-[30px]">
                    <h2 className="font-bold text-[22px] text-[#1E1E1E]">Starter</h2>
                    
                    <div className="text-[#1E1E1E] space-y-1 mt-3">
                        <div><b>Price:</b> $19</div>
                        <div><b>Chatbots:</b> 2</div>
                        <div><b>Queries:</b> Up to 1500/month</div>
                        <div><b>Docs/Page Limit:</b> Up to 100/chatbot</div>
                        <div><b>Storage Limit:</b> Up to 50M doc storage/chatbot</div>
                        <div><b>REST API:</b> Yes</div>
                    </div>
                </div>
                  <div id="Standard" className="mt-[30px]">
                    <h2 className="font-bold text-[22px] text-[#1E1E1E]">Standard</h2>
                    
                    <div className="text-[#1E1E1E] space-y-1 mt-3">
                        <div><b>Price:</b> $89</div>
                        <div><b>Chatbots:</b> 1</div>
                        <div><b>Queries:</b> Up to 200/month</div>
                        <div><b>Docs/Page Limit:</b> Up to 100/chatbot</div>
                        <div><b>Storage Limit:</b> Up to 50M doc storage</div>
                    </div>
                </div>

                  <div id="Business" className="mt-[30px]">
                    <h2 className="font-bold text-[22px] text-[#1E1E1E]">Business</h2>
                    
                    <div className="text-[#1E1E1E] space-y-1 mt-3">
                        <div><b>Price:</b> $89</div>
                        <div><b>Chatbots:</b> 1</div>
                        <div><b>Queries:</b> Up to 200/month</div>
                        <div><b>Docs/Page Limit:</b> Up to 100/chatbot</div>
                        <div><b>Storage Limit:</b> Up to 50M doc storage</div>
                    </div>
                </div>
        </div>
  </main>

   {/*  Fixed Right Sidebar */}
          <aside className=" w-64 fixed top-0 right-[20px] h-full p-4 pt-[30px] z-0">
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
        className={`lg:block transition-all duration-200 sm:hidden hidden ${
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
          </aside>   

        </>
    );
}