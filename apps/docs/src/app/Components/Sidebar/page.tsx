'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

export default function Page() {
  const [search, setSearch] = useState("");
  const [activeItem, setActiveItem] = useState("");
  const [showInstall, setShowInstall] = useState(false);
  const router = useRouter();

  const itemRoutes: Record<string, string> = {
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

  const installItems: string[] = [
    "Telegram", "Slack", "Shopify", "Wordpress", "Your Website", "Zapier", "Zapier with Lead Generation",
  ];

  useEffect(() => {
    const savedItem = localStorage.getItem("activeItem");
    const savedRoute = localStorage.getItem("activeRoute");
    const savedShowInstall = localStorage.getItem("showInstall");

    if (window.location.pathname === "/") {
      setActiveItem("");
      localStorage.removeItem("activeItem");
      localStorage.removeItem("activeRoute");
      localStorage.removeItem("showInstall");
      setShowInstall(false);
      return;
    }

    if (savedItem) setActiveItem(savedItem);
    if (savedShowInstall === "true") setShowInstall(true);

    if (savedRoute && savedRoute !== "/" && savedRoute !== window.location.pathname) {
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

  const handleClick = (itemName: string) => {
    setActiveItem(itemName);
    setShowInstall(installItems.includes(itemName));
  };

  const navLink = (name: string, display: React.ReactNode = null) => (
    <Link href={itemRoutes[name] || "/"} key={name} onClick={() => handleClick(name)}>
      <div
        className={`block pl-2 ml-3 py-1 rounded-md cursor-pointer transition ${
          activeItem === name
            ? "bg-[#F4E2FF] text-[#BF56FF]"
            : activeItem
            ? "text-[#7E7E7E] hover:bg-[#F2F2F2] hover:text-[#1E1E1E]"
            : "text-[#7E7E7E]"
        }`}
      >
        {display ?? name}
      </div>
    </Link>
  );

  return (
    <div className="h-screen bg-white flex flex-col overflow-y-hidden">
      <header className="sticky top-0 z-10 bg-white">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <Image src="/Website Assets/Logo.svg" alt="Logo" width={24} height={24} />
            <Image src="/Website Assets/Corpus AI logo.svg" alt="Corpus AI" width={24} height={24} />
            <Image src="/Website Assets/Docs.svg" alt="Docs" width={24} height={24} />
          </div>
          <Image src="/Website Assets/Dots Sidebar.svg" alt="Menu" width={24} height={24} />
        </div>
        <hr className="ml-1 mr-1 border-gray-200" />
        <form className="mt-3 bg-[#F8F8F8] rounded py-1 pl-2 ml-1.5 mr-2 relative">
          <Image src="/Website Assets/Search.svg" alt="Search" width={16} height={16} className="absolute top-2 left-2" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-7 outline-0 bg-[#F8F8F8] w-full"
          />
        </form>
      </header>

      <div className={`flex-1 px-3 text-sm list-none text-gray-700 mt-4 ${showInstall ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        <li>
          <div className="flex items-center gap-2">
            <Image src="/Website Assets/Robot.svg" alt="Chatbot" width={20} height={20} />
            <div className="flex justify-between items-center gap-28">
              <span>Chatbot</span>
              <Image src="/Website Assets/Arrow Down.svg" alt="Expand" width={12} height={12} />
            </div>
          </div>
          <div className="border-l border-gray-300 text-gray-500 ml-3">
            {navLink("Website Chatbot")}
            {navLink("File Chatbot")}
            {navLink("Chatbot Data Store")}
            {navLink("Chatbot Query Logs")}
            {navLink("Chatbot Customization")}
            {navLink("Use Documents From Google", <>Use Documents From Google <br /> Drive</>)}
          </div>
        </li>

        <li>
          <div className="flex items-center gap-2">
            <Image src="/Website Assets/Setting.svg" alt="Integration" width={20} height={20} />
            <span>Integration</span>
          </div>
          <div className="text-gray-500 pr-3 border-l border-gray-300 ml-3">
            <span
              className="flex justify-between cursor-pointer pl-2 ml-3 py-1 rounded-md hover:bg-[#F2F2F2] hover:text-[#1E1E1E]"
              onClick={() => setShowInstall(prev => !prev)}
            >
              Install On
              <Image src="/Website Assets/Arrow Left.svg" alt="" width={12} height={12} />
            </span>
            {showInstall && (
              <ul>
                {installItems.map((item) => navLink(item))}
              </ul>
            )}
            <div className="flex justify-between cursor-pointer mx rounded-md hover:bg-[#F2F2F2] hover:text-[#1E1E1E]">
              {navLink("Connect")}
              <Image src="/Website Assets/Arrow Left.svg" alt="" width={12} height={12} />
            </div>
            <div className="flex justify-between cursor-pointer">
              {navLink("RESTful API")}
              <Image src="/Website Assets/Arrow Left.svg" alt="" width={12} height={12} />
            </div>
          </div>
        </li>

        <li>
          <div
            onClick={() => handleClick("Access Settings")}
            className={`py-1 rounded-md flex items-center gap-2 hover:bg-[#F2F2F2] hover:text-[#1E1E1E] ${activeItem === "Access Settings" ? "bg-[#F4E2FF] text-[#BF56FF]" : "text-gray-700"}`}
          >
            <Image src="/Website Assets/Sheild Plus.svg" alt="" width={20} height={20} />
            <Link href={itemRoutes["Access Settings"]}>Access Settings</Link>
          </div>
        </li>

        <li>
          <div className="flex items-center gap-2">
            <Image src="/Website Assets/Dollar.svg" alt="Billing" width={20} height={20} />
            <span>Billing</span>
          </div>
          <div className="border-l border-gray-300 text-gray-500 space-y-2 ml-3">
            {navLink("Upgrade Plan")}
            {navLink("AWS Marketplace")}
          </div>
        </li>

        <li>
          <div
            onClick={() => handleClick("FAQ")}
            className={`flex items-center gap-2 mb-2 py-1 rounded-md cursor-pointer transition ${
              activeItem === "FAQ"
                ? "bg-[#F4E2FF] text-[#BF56FF]"
                : "text-[#7E7E7E] hover:bg-[#F2F2F2] hover:text-[#1E1E1E]"
            }`}
          >
            <Image src="/Website Assets/Question Mark.svg" alt="FAQ" width={20} height={20} />
            <Link href="/FAQ">
              <span>FAQ</span>
            </Link>
          </div>
        </li>

        {showInstall && (
          <div className="fixed bottom-14 left-0 w-60 h-8 bg-white/65 z-50 pointer-events-none"></div>
        )}
      </div>

      <footer className="sticky bottom-0 bg-white border-t border-gray-300">
        <div className="ml-3 mr-5 mt-1 flex justify-between text-gray-500 py-2">
          <div className="flex gap-2 p-0.5 pl-3 pr-3 rounded-3xl border border-gray-200">
            <Image src="/Website Assets/Brightness.svg" alt="" width={16} height={16} />
            <Image src="/Website Assets/Moon.svg" alt="" width={16} height={16} />
          </div>
          <Image src="/Website Assets/Sidebar-Flip.svg" alt="" width={24} height={24} />
        </div>
      </footer>
    </div>
  );
}
