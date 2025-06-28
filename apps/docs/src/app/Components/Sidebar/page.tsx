'use client'; 
import Link from "next/link";
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, 
         faMagnifyingGlass, 
         faRobot,
         faShield, 
         faCircleQuestion, 
         faAngleDown,
         faAngleRight,
         faSun,
         faMoon,
         faSliders}          
from '@fortawesome/free-solid-svg-icons';

export default function Page() {
  const [search, setSearch] = useState("");
  
  return (
    <>
    <html lang="en">
      <head>
          <title>CORPUS AI | DOCS</title>
      </head>
      <body>
    <div className="w-70 h-screen bg-white">
      <nav  >
        <header >
          <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold bg-purple-300 pl-2.5 pr-2.5 rounded">C</span>
            <h1 className="font-bold">CORPUS AI Docs</h1>
          </div>
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </div>
          <hr className=" ml-1 mr-1 border-gray-200"/>
          <form className="mt-3 bg-gray-200 rounded py-1 pl-2 ml-1.5 mr-2">
            <span className="absolute"><FontAwesomeIcon icon={faMagnifyingGlass} /></span>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-7 outline-0"
              required
            />
          </form>
        </header>

       <ul className="mt-4 ml-3 space-y-2 text-sm text-gray-700">
  
  {/* Chatbot Section */}
  <li>
    <div className="flex items-center justify-between pr-3">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faRobot} />
        <span>Chatbot</span>
      </div>
      <FontAwesomeIcon icon={faAngleDown} />
    </div>
    <div className="pl-6 mt-1 border-l  border-gray-300 text-gray-500 space-y-2 ml-1.5">
      <Link href="../Website Chatbot/page.tsx" className="block">Website Chatbot</Link>
      <Link href="/File Chatbot" className="block">File Chatbot</Link>
      <Link href="/ChatbotDatastore" className="block">Chatbot Data Store</Link>
      <Link href="/ChatbotQueryLogs" className="block">Chatbot Query Logs</Link>
      <Link href="/ChatbotCustomization" className="block">Chatbot Customization</Link>
      <Link href="/Google-Drive-Docs" className="block">Use Documents From Google <br/ >Drive</Link>
    </div>
  </li>

  {/* Integration Section */}
  <li>
    <div className="flex items-center justify-between pr-3">
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>

        <span>Integration</span>
      </div>
      <FontAwesomeIcon icon={faAngleDown} />
    </div>
    <div className="pl-6 mt-1 border-l border-gray-300 text-gray-500 space-y-2 pr-3 ml-1.5">
      <Link href="/Install-ON" className="flex justify-between">Install On <FontAwesomeIcon icon={faAngleRight} /></Link>
      <Link href="/Connect" className="flex justify-between">Connect <FontAwesomeIcon icon={faAngleRight} /></Link>
      <Link href="/RestFull API" className="flex justify-between">RESTful API <FontAwesomeIcon icon={faAngleRight} /></Link>
    </div>
  </li>

  {/* Access Settings */}
  <li>
    <div className="flex items-center gap-2">
      <FontAwesomeIcon icon={faShield} /> 
      <Link href="/Access Setting">Access Settings</Link>
    </div>
  </li>

  {/* Billing Section */}
  <li>
    <div className="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>

      <span>Billing</span>
    </div>
    <div className="pl-6 mt-1 border-l border-gray-300 text-gray-500 space-y-2 ml-1.5">
      <Link href="/" className="block">Upgrade Plan</Link>
      <Link href="/" className="block">AWS Marketplace</Link>
    </div>
  </li>

  {/* FAQ Section */}
  <li>
    <div className="flex items-center gap-2">
      <FontAwesomeIcon icon={faCircleQuestion} />
      <Link href="/">FAQ</Link>
    </div>
  </li>
</ul>

<div className=" mb-2 absolute bottom-0 w-70">
<hr className=" ml-1 mr-1 border-gray-300"/>

<div className="ml-3 mr-5 mt-2 flex text-center justify-between text-gray-500">
<div className="space-x-2 pl-3 pr-3 rounded-3xl border-1 border-gray-200">
<FontAwesomeIcon icon={faSun} />
<FontAwesomeIcon icon={faMoon} />
</div>
<FontAwesomeIcon icon={faSliders} />
</div>
</div>
      </nav>
    </div>
    </body>
    </html>
    </>
  );
}
