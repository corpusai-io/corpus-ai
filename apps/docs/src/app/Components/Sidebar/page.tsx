'use client';
import Link from "next/link";
import { useState } from "react";

export default function Page() {
  const [search, setSearch] = useState("");
  const [showInstall, setShowInstall] = useState(false); // Install On toggle
  const [activeSection, setActiveSection] = useState("");


  return (
    <div className="w-70 h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <img src="/Website Assets/Logo.svg" alt="" />
            <img src="/Website Assets/Corpus AI logo.svg" alt="" />
            <img src="/Website Assets/Docs.svg" alt="" />
          </div>
          <img src="/Website Assets/Dots Sidebar.svg" alt="" />
        </div>
        <hr className="ml-1 mr-1 border-gray-200" />
        <form className="mt-3 bg-gray-200 rounded py-1 pl-2 ml-1.5 mr-2">
          <span className="absolute"><img src="/Website Assets/Search.svg" alt="" /></span>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-7 outline-0 bg-gray-200 w-full"
            required
          />
        </form>
      </header>
      
      {/* Scrollable Menu Area */}
      <div className={`flex-1 px-3 space-y-2 text-sm list-none text-gray-700 mt-2 ${showInstall ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        {/* Chatbot Section */}
        <li>
          <div className="flex items-center justify-between pr-3">
            <div className="flex items-center gap-2">
              <img src="/Website Assets/Robot.svg" alt="" />
              <span>Chatbot</span>
            </div>
            <img src="/Website Assets/Arrow Down.svg" alt="" />
          </div>
          <div className="pl-6 mt-1 border-l border-gray-300 text-gray-500 space-y-2 ml-3">
            <Link href="/Components/chatbots-docs-pages/Website-Chatbot" className="block"
            
            
            >Website Chatbot</Link>
            <Link href="/Components/chatbots-docs-pages/File-Chatbot" className="block">File Chatbot</Link>
            <Link href="/ChatbotDatastore" className="block">Chatbot Data Store</Link>
            <Link href="/ChatbotQueryLogs" className="block">Chatbot Query Logs</Link>
            <Link href="/ChatbotCustomization" className="block">Chatbot Customization</Link>
            <Link href="/Google-Drive-Docs" className="block">Use Documents From Google <br />Drive</Link>
          </div>
        </li>

        {/* Integration Section */}
        <li>
          <div className="flex items-center justify-between pr-3">
            <div className="flex items-center gap-2">
              <img src="/Website Assets/Setting.svg" alt="" />
              <span>Integration</span>
            </div>
            <img src="/Website Assets/Arrow Down.svg" alt="" />
          </div>

         
            <div className="pl-6 border-l border-gray-300 text-gray-500 space-y-1 pr-3 ml-3">
              <span className="flex justify-between cursor-pointer"  onClick={() => setShowInstall(!showInstall)}>Install On <img src="/Website Assets/Arrow Left.svg" alt="" /></span>
              {showInstall && (
              <ul className="space-y-1.5">
                <li><Link href="/Install-ON">Telegram</Link></li>
                <li><Link href="/Install-ON">Slack</Link></li>
                <li><Link href="/Install-ON">Shopify</Link></li>
                <li><Link href="/Install-ON">Wordpress</Link></li>
                <li><Link href="/Install-ON">Your Website</Link></li>
                <li><Link href="/Install-ON">Zapier</Link></li>
                <li><Link href="/Install-ON">Zapier with Lead Generation</Link></li>
              </ul>
                  )}
              <Link href="/Connect" className="flex justify-between">Connect <img src="/Website Assets/Arrow Left.svg" alt="" /></Link>
              <Link href="/RestFull API" className="flex justify-between">RESTful API <img src="/Website Assets/Arrow Left.svg" alt="" /></Link>
            </div>
        </li>

        {/* Access Settings */}
        <li>
          <div className="flex items-center gap-2">
            <img src="/Website Assets/Sheild Plus.svg" alt="" />
            <Link href="/Access Setting">Access Settings</Link>
          </div>
        </li>

        {/* Billing Section */}
        <li>
          <div className="flex items-center gap-2">
            <img src="/Website Assets/Dollar.svg" alt="" />
            <span>Billing</span>
          </div>
          <div className="pl-6 border-l border-gray-300 text-gray-500 space-y-2 ml-3">
            <Link href="/" className="block" >Upgrade Plan</Link>
            <Link href="/" >AWS Marketplace</Link>
          </div>
        </li>

        {/* FAQ */}
        <li>
          <div className="flex items-center gap-2 mb-2">
            <img src="/Website Assets/Question Mark.svg" alt="" />
            <Link href="/">FAQ</Link>
          </div>
        </li>
        {showInstall &&(
        <div className="fixed bottom-14 left-0 w-60 h-8  bg-white/65 z-50 pointer-events-none">
        </div>
        )}
      </div>

      {/* Footer Bottom Fixed */}
      <div className="sticky bottom-0 bg-white border-t border-gray-300">
        <div className="ml-3 mr-5 mt-2 flex justify-between text-gray-500 py-2">
          <div className="flex gap-2 p-1.5 pl-3 pr-3 rounded-3xl border border-gray-200">
            <img src="/Website Assets/Brightness.svg" alt="" />
            <img src="/Website Assets/Moon.svg" alt="" />
          </div>
          <img src="/Website Assets/Sidebar-Flip.svg" alt="" />
        </div>
      </div>
    </div>
  );
}
