'use client'; 
import Link from 'next/link';

export default function Welcome(){
    return(
        <>
       <div className="flex-1 mt-11 ml-11 mr-5">
              <h1 className="font-bold text-[25px]">Welcome to CorpusAI&apos;s documentation</h1>

              
              {/* Welcome Page Cards */}
              
              <div className="grid grid-cols-2 gap-4 mt-12  ">
                <div className="bg-white pl-3 pt-3 rounded-[10px] border-1 border-gray-200 shadow">
                    <div className="rounded">
                        <img src="/Website Assets/Robot.svg" alt="" />
                        <h3 className="pt-3">Chatbot</h3>
                        <p className="text-gray-500">Learn how to create a chatbot with CorpusAI</p>
                    </div>
                </div>
               <div className="bg-white pl-3 pt-3 rounded-[10px] border-1 border-gray-200 shadow">
                    <div className="mb-4 rounded">
                        <div className="p-2 rounded w-8 text-gray-500 bg-gray-100 border-1 border-gray-300 p-1.5 rounded-[5px]">
                        <img src="/Website Assets/Setting.svg" alt="" />
                       </div> 
                        <h3 className="pt-3">Integration</h3>
                        <p className="text-gray-500">Integrate CorpusAI with your favorite tools</p>
                    </div>
                </div>
                <div className="bg-white pl-3 pt-3 rounded-[10px] border-1 border-gray-200 shadow">
                    <div className="mb-4 border-gray-400 rounded">
                     <div className=" p-2 rounded w-8 text-gray-500 bg-gray-100 border-1 border-gray-300 p-1.5 rounded-[5px]">
                     <img src="/Website Assets/Dollar.svg" alt="" />
                     </div>                
                        <h3 className="pt-3">Billing</h3>
                        <p className="text-gray-500">Understand how billing works in CorpusAI</p>
                    </div>
                </div>
                <div className="bg-white pl-3 pt-3 rounded-[10px] border-1 border-gray-200 shadow">
                    <div className="mb-4 border-gray-500 rounded">
                        <img src="/Website Assets/Question Mark.svg" alt="" />
                        <h3 className="pt-3">FAQ</h3>
                        <p className="text-gray-500">Find answere to frequently asked questions</p>
                    </div>
                </div>
              </div>
            <div className="mt-35 text-right">
            <hr className="border-gray-200"/>
            <div className="flex">
            <div className="mt-2 p-3 w-[300px]  bg-white absolute right-[270px] rounded-[10px] shadow">
                <div className="flex items-center pl-56 text-[#7E7E7E]">
                    <span>Next</span> 
                <img src="/Website Assets/Arrow Left.svg" alt="" className="w-4 h-4"/>
                </div>
                <Link href="/Components/chatbots-docs-pages/Website-Chatbot/" className="block  mt-2">
                    Website Chatbot
                </Link>
            </div>
            </div>
        </div>
          </div>
        
    <div className="w-64 pt-13">
  <div className="flex items-center gap-2 text-gray-400 font-medium mb-2">
    <img src="/Website Assets/Sidebar-Alighment.svg" alt="" />
    
    <span>On this page</span>
  </div>

  <ul className="ml-2 border-l-4 mt-2 border-[#BF56FF] pl-4 text-[#BF56FF]">
    <li>
      <Link href="/">
        Welcome to Corpus AI's Documentation
      </Link>
    </li>
  </ul>
</div>
        </>
    );
}