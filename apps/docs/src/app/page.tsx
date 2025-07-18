'use client';
import Link from 'next/link';
import { ThemeProvider, useTheme } from '../LighMode';

export default function Welcome() {
  const { darkMode } = useTheme();

  return (
    <>
   
<p className="text-sm">
  Mode: {darkMode ? '🌙 Dark' : '☀️ Light'}
</p>
<p className="text-sm">
  Mode: {darkMode ? '🌙 Dark:bg-black' : '☀️ Light:bg-white'}
</p>

<div className="bg-white dark:bg-blac p-4">
  Dark mode test
</div>



      <div className="flex-1 mt-7 lg:ml-1 lg:mr-5 sm:ml-auto">
        <h1 className="font-bold text-[25px] lg:text-left md:text-left text-center">Welcome to CorpusAI&apos;s documentation</h1>

        {/* Welcome Page Cards */}

        <div className="grid grid-cols-2 gap-4 mt-12  ">
          <div className="group bg-white px-4 py-4 rounded-[10px] border-1 border-[#DFDFDF] shadow-[0_4px_8px_rgba(216,216,216,0.25)] hover:shadow-[0_4px_15px_rgba(255,255,255,0.25)] hover:bg-[#FAFAFA] cursor-pointer">
            <div className="rounded">
              <div className="w-8 bg-[#F8F8F8] group-hover:bg-[#FFFFFF] border-1 border-[#DDDDDD] p-1.5 rounded-[5px]">
                <img src="/Website Assets/Robot.svg" alt="" />
              </div>

              <h3 className="pt-3 text-[#1E1E1E] font-medium">Chatbot</h3>
              <p className="text-[#7F7F7F]">Learn how to create a chatbot with CorpusAI</p>
            </div>
          </div>

         <div className="group bg-white dark:bg-red-500  px-4 py-4 rounded-[10px] border-1 border-[#DFDFDF] shadow-[0_4px_8px_rgba(216,216,216,0.25)] hover:shadow-[0_4px_15px_rgba(255,255,255,0.25)] hover:bg-[#FAFAFA] cursor-pointer">
            <div className="rounded">
              <div className="w-8 bg-[#F8F8F8] group-hover:bg-[#FFFFFF] border-1 border-[#DDDDDD] p-1.5 rounded-[5px]">
                <img src="/Website Assets/Setting.svg" alt="" />
              </div>
              <h3 className="pt-3 text-[#1E1E1E] font-medium">Integration</h3>
              <p className="text-gray-500">Integrate CorpusAI with your favorite tools</p>
            </div>
          </div>
         <div className="group bg-white px-4 py-4 rounded-[10px] border-1 border-[#DFDFDF] shadow-[0_4px_8px_rgba(216,216,216,0.25)] hover:shadow-[0_4px_15px_rgba(255,255,255,0.25)] hover:bg-[#FAFAFA] cursor-pointer">
            <div className="rounded">
              <div className="w-8 bg-[#F8F8F8] group-hover:bg-[#FFFFFF] border-1 border-[#DDDDDD] p-1.5 rounded-[5px]">
                <img src="/Website Assets/Dollar.svg" alt="" />
              </div>
              <h3 className="pt-3 text-[#1E1E1E] font-medium">Billing</h3>
              <p className="text-gray-500">Understand how billing works in CorpusAI</p>
            </div>
          </div>
          <div className="group bg-white px-4 py-4 rounded-[10px] border-1 border-[#DFDFDF] shadow-[0_4px_8px_rgba(216,216,216,0.25)] hover:shadow-[0_4px_15px_rgba(255,255,255,0.25)]  hover:bg-[#FAFAFA] cursor-pointer">
            <div className="rounded">
              <div className="w-8 bg-[#F8F8F8] group-hover:bg-[#FFFFFF] border-1 border-[#DDDDDD] p-1.5 rounded-[5px]">
                <img src="/Website Assets/Question Mark.svg" alt="" />
              </div>
              <h3 className="pt-3 text-[#1E1E1E] font-medium">FAQ</h3>
              <p className="text-gray-500">Find answers to frequently asked questions</p>
            </div>
          </div>
        </div>
        <div className="lg:mt-30 md:mt-24 mt-13 text-right">
          {/* Top horizontal line */}
          <hr className="border-gray-200" />

          {/* Flex container */}
          <div className="flex justify-end">
            <div className="mt-1 p-3 w-[300px] bg-white sticky lg:right-[20px] rounded-[10px] sm:relative sm:left-0 sm:right-auto border-1 border-[#DFDFDF] shadow-[0_4px_8px_rgba(216,216,216,0.25)] hover:shadow-[0_4px_15px_rgba(255,255,255,0.25)]  hover:bg-[#FAFAFA] cursor-pointer">

              {/* Text and Arrow */}
              <div className="flex items-center justify-end text-[#7E7E7E]">
                <span className="mr-2">Next</span>
                <img src="/Website Assets/Arrow Left.svg" alt="" className="w-4 h-4" />
              </div>

              {/* Link */}
              <Link href="/Components/chatbots-docs-pages/Website-Chatbot/" className="block mt-2 text-right">
                Website Chatbot
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-64 pt-13 fixed right-0 top-0 lg:block sm:hidden hidden">
        <div className="flex items-center gap-2 text-gray-400 font-medium mb-2">
          <img src="/Website Assets/Sidebar-Alighment.svg" alt="" />

          <span>On this page</span>
        </div>

        <ul className="ml-2 border-l-4 mt-2 border-[#BF56FF] pl-4 text-[#BF56FF]">
          <li>
            <Link href="/">
              Welcome to Corpus AI&apos;s Documentation
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}