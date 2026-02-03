'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const sections = [
  { id: "Doploy_Chatbot", text: "How can i deploy my Corpus Chatbot" },
  { id: "Application_Chat", text: "What are the applications of Corpus Chat" },
  { id: "Queries", text: "What Kind of Queries should i ask?" },
  { id: "Benifits", text: "What are the key benefits of using a Corpus Chatbot" },
  { id: "experienced", text: "How experienced is the team at corpusai.io" },
];

export default function WebsiteChatbot() {
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


  return (
    <>

      <main className="flex-1 flex">
        <div className="w-full max-w-auto pt-[1px] pl-[10px]  overflow-x-hidden"  id="Doploy_Chatbot">

            <div  id="Doploy_Chatbot">
                <h2 className="font-bold mt-4 text-[30px]">FAQ</h2>
              <div id="Doploy_Chatbot">
                <h2  className="font-bold mt-8 text-[20px]">How can I deploy Corpus chatbots?</h2>
                <p  className="text-[#777777] mt-2 text-justify">Deploying Corpus chatbots is easy and programming-free. All you need to do is provide your website URL or files to build and deploy the chatbot.</p>
                </div>

                <div id="Application_Chat">
                <h2  className="font-bold mt-8 text-[20px]">How can I deploy Corpus chatbots?</h2>
                <div className="text-[#777777] mt-2 text-justify space-y-4">
                <p >
                  Technical Support: Corpus chatbots can analyze documents for detailed tech support and problem-solving.
                 </p>
                 <p>
                    Customer Service: Corpus chatbots power smart customer service systems, quickly addressing common queries to enhance efficiency.
                  </p>
                  <p>
                    Finance Analysis: Corpus chatbots can analyze revenue trends, identify driving factors, and offer financial advice.
                   </p>
                  <p>
                    Legal Assistant: Corpus chatbots analyze legal documents and provide advice by accessing legal databases.
                    </p>
                  <p>
                    Educational Assistance: Corpus chatbots act as teaching aids, pulling information from educational resources.
                 </p>
                  </div>
                  </div>
                  <div id="Queries">
                 <h2  className="font-bold mt-8 text-[20px]">What kind of queries should I ask?</h2>
                 <p className="text-[#777777] mt-2 text-justify">You can inquire about anything linked to your data (website or uploaded files). The questions can be diverse, from simple factual queries to more complex text generation tasks such as:
                      </p>
                      <div className="space-y-3 text-[#777777] mt-2 text-justify">
                      <p>
                      <li>Instructions for connecting to my cloud workspace,</li>
                      </p>
                      <p>
                      <li>Summarizing the provided document</li>
                       </p>
                       <p>
                      <li>Crafting a content marketing blog for our latest product</li>
                      </p>
                      </div>
                   
            </div>              

</div>


        </div>
      </main>

      {/*  Fixed Right Sidebar */}
      <aside className=" w-64 fixed top-0 right-[20px] h-full p-4 pt-[30px] z-0 lg:block sm:hidden hidden">
        <div className="flex items-center gap-2 text-gray-400 font-medium mb-2">
          <img src="/website-assets/Sidebar-Alighment.svg" alt="" />
          <span>On this page</span>
        </div>
        <ul className="text-[14px] space-y-3.5 ml-[4px] border-l-1 border-l-[#D8D8D8]">
          {sections.map((item, index) => (
            <li
              key={index}
              className={`ml-[-1px] pl-3 transition-all duration-200 border-l-2 hover:border-[#BF56FF]  ${activeId === item.id
                  ? 'border-[#BF56FF]'
                  : 'border-transparent'
                }`}
            >
              <Link
                href={`#${item.id}`}
                className={`block transition-all duration-200 ${activeId === item.id
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