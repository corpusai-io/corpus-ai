import React from "react";
import Image from "next/image";
interface HeroRightSide {
  logo: string;
  msg1: string;
  msg2: string;
  msg3: string;
}
const HeroRightSide:React.FC<HeroRightSide>=({logo, msg1, msg2, msg3}) =>{
    return(
        <div className="flex-1 bg-[#FCF6FF] p-4 md:p-12 rounded-2xl border border-purple-200 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-4 w-full max-w-md border border-white/40">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white border border-zinc-200 rounded-md p-2 flex items-center justify-center text-2xl">
              <Image src={`/integration-images/${logo}`} alt="Slack Logo" width={24} height={24} />
            </div>
            <div className="wrap flex gap-2 items-center">
              <span className="font-semibold text-[#1E1E1E] text-lg">AI Assistant</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-4 text-purple-500" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
            </div>
          </div>
          {/* Chat Bubbles */}
          <div className="flex flex-col gap-2 mb-4">
            <div data-aos="fade-up" data-aos-duration="600"   className="self-start bg-zinc-100 text-[#1E1E1E] rounded-lg px-4 py-2 text-sm max-w-[80%]">
             {msg1}
            </div>
            <div data-aos="fade-up" data-aos-duration="500" data-aos-delay="700" className="self-end bg-gradient-to-b from-[#FDFCFF] to-[#F1E6FF] rounded-lg text-[#1E1E1E] px-4 py-2 text-sm max-w-[80%]">
             {msg2}
            </div>
            <p data-aos="fade-up" data-aos-duration="600" data-aos-delay="1200" dangerouslySetInnerHTML={{ __html: msg3 }} className="self-start bg-white border border-zinc-100 text-zinc-700 rounded-lg px-4 py-2 text-sm max-w-[90%] shadow-sm" />
            
          </div>
          {/* Input Box */}
          <div className="flex items-center gap-2 mt-2">
            <input disabled
              type="text"
              className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/80 placeholder-zinc-400"
              placeholder="Ask about anything"
            />
            <button className="bg-[#BF56FF] hover:bg-purple-600 text-white rounded-md py-2 px-3 transition flex items-center justify-center">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M5 12h14m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    )
}

export default HeroRightSide;