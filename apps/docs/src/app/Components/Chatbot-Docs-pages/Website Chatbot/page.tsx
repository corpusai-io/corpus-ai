'use client'; 
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faAngleRight,
    faBarsStaggered,
    faCircleQuestion,
    faRobot
}          
from '@fortawesome/free-solid-svg-icons';

export default function Welcome(){
    return(
        <>
       <div className="flex-1 mt-14 ml-11 mr-5">
              <h1 className="font-bold text-[25px]">Website Chatbot</h1>
              
              {/* Welcome Page Cards */}
              
              <div className="grid grid-cols-2 gap-4 mt-12  ">
                <div className="bg-white pl-3 pt-3 rounded-[10px] border-1 border-gray-200 shadow">
                    <div className="rounded">
                        <FontAwesomeIcon icon={faRobot} className="text-gray-500 bg-gray-100 border-1 border-gray-300 p-1.5 rounded-[5px]"/>
                        <h3 className="pt-3">Chatbot</h3>
                        <p className="text-gray-500">Learn how to create a chatbot with CorpusAI</p>
                    </div>
                </div>
               <div className="bg-white pl-3 pt-3 rounded-[10px] border-1 border-gray-200 shadow">
                    <div className="mb-4 rounded">
                        <div className="p-2 rounded w-8 text-gray-500 bg-gray-100 border-1 border-gray-300 p-1.5 rounded-[5px]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                       </div> 
                        <h3 className="pt-3">Integration</h3>
                        <p className="text-gray-500">Integrate CorpusAI with your favorite tools</p>
                    </div>
                </div>
                <div className="bg-white pl-3 pt-3 rounded-[10px] border-1 border-gray-200 shadow">
                    <div className="mb-4 border-gray-400 rounded">
                     <div className=" p-2 rounded w-8 text-gray-500 bg-gray-100 border-1 border-gray-300 p-1.5 rounded-[5px]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                       </svg>
                       </div>                
                        <h3 className="pt-3">Billing</h3>
                        <p className="text-gray-500">Understand how billing works in CorpusAI</p>
                    </div>
                </div>
                <div className="bg-white pl-3 pt-3 rounded-[10px] border-1 border-gray-200 shadow">
                    <div className="mb-4 border-gray-500 rounded">
                        <FontAwesomeIcon icon={faCircleQuestion} className="text-gray-500 bg-gray-100 border-1 border-gray-300 p-1.5 rounded-[5px]"/>
                        <h3 className="pt-3">FAQ</h3>
                        <p className="text-gray-500">Find answere to frequently asked questions</p>
                    </div>
                </div>
              </div>
        <div className="mt-35">
            <hr className="border-gray-200"/>
            <div className="flex space-y-7">
            <div className="mt-2 p-3 w-70 bg-white text-right absolute right-70 rounded-[10px] shadow">
                <p>Next 
                    <FontAwesomeIcon icon={faAngleRight} className="pl-2"/>
                </p>
                <Link href="../Welcome-page/page" className="block font-bold">Website Chatbot</Link>
            </div>
            </div>
        </div>
          </div>
        
    <div className="w-64 pt-13">
  <div className="flex items-center gap-2 text-gray-400 font-medium mb-2">
    <FontAwesomeIcon icon={faBarsStaggered} />
    <span>On this page</span>
  </div>

  <ul className="ml-1 border-l-4 mt-2 border-purple-500 pl-4 text-purple-500">
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