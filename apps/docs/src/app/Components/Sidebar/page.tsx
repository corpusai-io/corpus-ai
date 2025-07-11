'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

export default function Page() {
  const [search, setSearch] = useState("");
  const [activeItem, setActiveItem] = useState("");
  const [showInstall, setShowInstall] = useState(false);
  const router = useRouter();

  const itemRoutes = {
    "Website Chatbot": "/Components/chatbots-docs-pages/Website-Chatbot",
    "File Chatbot": "/Components/chatbots-docs-pages/File-Chatbot",
    "Chatbot Data Store": "/ChatbotDatastore",
    "Chatbot Query Logs": "/ChatbotQueryLogs",
    "Chatbot Customization": "/ChatbotCustomization",
    "Use Documents From Google": "/Google-Drive-Docs",
    "Telegram": "/Components/chatbots-docs-pages/Install-On/Telegram",
    "Slack": "/Components/chatbots-docs-pages/Install-On/Slack",
    "Shopify": "/Install-ON",
    "Wordpress": "/Install-ON",
    "Your Website": "/Install-ON",
    "Zapier": "/Install-ON",
    "Zapier with Lead Generation": "/Install-ON",
    "Connect": "/Connect",
    "RESTful API": "/Rest",
    "Access Settings": "/Components/chatbots-docs-pages/Access_Setting",
    "Upgrade Plan": "/Up",
    "AWS Marketplace": "/AWS",
    "FAQ": "/FAQ",
  };

  const installItems = [
    "Telegram", "Slack", "Shopify", "Wordpress", "Your Website", "Zapier", "Zapier with Lead Generation",
  ];

  useEffect(() => {
    const savedItem = localStorage.getItem("activeItem");
    const savedRoute = localStorage.getItem("activeRoute");
    const savedShowInstall = localStorage.getItem("showInstall");

    // ✅ If on Home Page "/", clear all stored values & stop redirect
    if (window.location.pathname === "/") {
      setActiveItem("");
      localStorage.removeItem("activeItem");
      localStorage.removeItem("activeRoute");
      localStorage.removeItem("showInstall");
      setShowInstall(false);
      return;
    }

    // ✅ Restore state for other pages
    if (savedItem) setActiveItem(savedItem);
    if (savedShowInstall === "true") setShowInstall(true);

    if (
      savedRoute &&
      savedRoute !== "/" &&
      savedRoute !== window.location.pathname
    ) {
      router.push(savedRoute);
    }
  }, []);

  useEffect(() => {
    if (activeItem) {
      localStorage.setItem("activeItem", activeItem);
      const route = itemRoutes[activeItem];
      if (route) {
        localStorage.setItem("activeRoute", route);
      }

      const isInstallItem = installItems.includes(activeItem);
      setShowInstall(isInstallItem);
      localStorage.setItem("showInstall", isInstallItem ? "true" : "false");
    }
  }, [activeItem]);

  const handleClick = (itemName) => {
    setActiveItem(itemName);
    setShowInstall(installItems.includes(itemName));
  };

  const navLink = (name, display = null) => (
    <Link href={itemRoutes[name] || "/"} onClick={() => handleClick(name)}>
      <div
        className={`block pl-2 ml-3 py-1 rounded-md cursor-pointer transition ${
          activeItem === name
            ? "bg-[#F4E2FF] text-[#BF56FF]"
            : activeItem
            ? "text-[#7E7E7E] hover:bg-[#F2F2F2] hover:text-[#1E1E1E]"
            : "text-[#7E7E7E]"
        }`}
      >
        {typeof display === "string" ? display : display ?? name}
      </div>
    </Link>
  );

  return (
    <div className="h-screen bg-white flex flex-col overflow-y-hidden">
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
        <form className="mt-3 bg-[#F8F8F8] rounded py-1 pl-2 ml-1.5 mr-2">
          <span className="absolute">
            <img src="/Website Assets/Search.svg" alt="" />
          </span>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-7 outline-0 bg-[#F8F8F8] w-full"
            required
          />
        </form>
      </header>

      <div className={`flex-1 px-3 text-sm list-none text-gray-700 mt-4  ${showInstall ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        {/* Section: Chatbot */}
        <li>
          <div className="flex items-center gap-2">
            <img src="/Website Assets/Robot.svg" alt="" />
          < div className="flex justify-between items-center gap-28">
            <span>Chatbot</span>
            <img src="/Website Assets/Arrow Down.svg" alt="" />
          </div>
          </div>
          <div className="border-l border-gray-300 text-gray-500 ml-3">
            {navLink("Website Chatbot")}
            {navLink("File Chatbot")}
            {navLink("Chatbot Data Store")}
            {navLink("Chatbot Query Logs")}
            {navLink("Chatbot Customization")}
            <div>
            {navLink("Use Documents From Google", (
              <>
                Use Documents From Google <br /> Drive
              </>
            ))}
            
            </div>
           
          </div>
        </li>

        {/* Section: Integration */}
        <li>
          <div className="flex items-center gap-2">
            <img src="/Website Assets/Setting.svg" alt="" />
            <span>Integration</span>
          </div>
          <div className="text-gray-500 pr-3 border-l border-gray-300 ml-3">
            <span
              className="flex justify-between cursor-pointer pl-2 ml-3 py-1 rounded-md hover:bg-[#F2F2F2] hover:text-[#1E1E1E]"
              onClick={() => setShowInstall(prev => !prev)}
            >
              Install On
              <img src="/Website Assets/Arrow Left.svg" alt="" />
            </span>
            {showInstall && (
              <ul>
                {installItems.map((item) => navLink(item))}
              </ul>
            )}
           <div className="flex justify-between cursor-pointer mx rounded-md hover:bg-[#F2F2F2] hover:text-[#1E1E1E]">
            {navLink("Connect")}
            <img src="/Website Assets/Arrow Left.svg"  alt="" />
            </div>
            <div className="flex justify-between cursor-pointer ">
            {navLink("RESTful API")}
            <img src="/Website Assets/Arrow Left.svg" alt="" />
            </div>
            </div>


        </li>

        {/* Section: Access Settings */}
        <li>
          <div
            onClick={() => handleClick("Access Settings")}
            className={`py-1 rounded-md flex items-center gap-2 hover:bg-[#F2F2F2] hover:text-[#1E1E1E] ${activeItem === "Access Settings" ? "bg-[#F4E2FF] text-[#BF56FF]" : "text-gray-700"}`}
          >
            <img src="/Website Assets/Sheild Plus.svg" alt="" />
            <Link href="/Components/chatbots-docs-pages/Access_Setting">Access Settings</Link>
          </div>
        </li>

        {/* Section: Billing */}
        <li>
          <div className="flex items-center gap-2">
            <img src="/Website Assets/Dollar.svg" alt="" />
            <span>Billing</span>
          </div>
          <div className="border-l border-gray-300 text-gray-500 space-y-2 ml-3 ">
            {navLink("Upgrade Plan")}
            {navLink("AWS Marketplace")}
          </div>
        </li>

        {/* Section: FAQ */}
     <li>
  <div
    onClick={() => handleClick("FAQ")}
    className={`flex items-center gap-2 mb-2 py-1 rounded-md cursor-pointer transition ${
      activeItem === "FAQ"
        ? "bg-[#F4E2FF] text-[#BF56FF]"
        : "text-[#7E7E7E] hover:bg-[#F2F2F2] hover:text-[#1E1E1E]"
    }`}
  >
    <img src="/Website Assets/Question Mark.svg" alt="" />
    <Link href="/FAQ">{/* Link inside the styled div */}
      <span>{'FAQ'}</span>
    </Link>
  </div>
</li>

        {showInstall && (
          <div className="fixed bottom-14 left-0 w-60 h-8 bg-white/65 z-50 pointer-events-none"></div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-300">
        <div className="ml-3 mr-5 mt-1 flex justify-between text-gray-500 py-2">
          <div className="flex gap-2 p-0.5 pl-3 pr-3 rounded-3xl border border-gray-200">
            <img src="/Website Assets/Brightness.svg" alt="" />
            <img src="/Website Assets/Moon.svg" alt="" />
          </div>
          <img src="/Website Assets/Sidebar-Flip.svg" alt="" />
        </div>
      </div>
    </div> 
  );
}
