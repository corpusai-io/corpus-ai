'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useTheme } from "../../../LighMode";

interface PageProps {
  setIsMobileSidebarOpen: (value: boolean) => void;
  setIsSidebarVisible: (value: boolean) => void;
}

export default function Page({
  setIsMobileSidebarOpen,
  setIsSidebarVisible,
}: PageProps) {

  const [search, setSearch] = useState("");
  const { darkMode, toggleDarkMode } = useTheme();
  const pathname = usePathname();
  const [showInstall, setShowInstall] = useState(false);
  const router = useRouter();
  const [activeItem, setActiveItem] = useState(() => {
    const saved = localStorage.getItem("activeItem");
    return saved || "";
  });



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
    "Connect": "/Comp",
    "RESTful API": "/Rest",
    "Access Settings": "/Components/chatbots-docs-pages/Access_Setting",
    "Upgrade Plan": "/Components/chatbots-docs-pages/Update-Plan",
    "AWS Marketplace": "/AWS",
    "FAQ": "/Components/chatbots-docs-pages/FAQ",
  };

  const installItems = [
    "Telegram", "Slack", "Shopify", "Wordpress", "Your Website", "Zapier", "Zapier with Lead Generation",
  ];

  useEffect(() => {
    const savedItem = localStorage.getItem("activeItem");
    const savedRoute = localStorage.getItem("activeRoute");
    const savedShowInstall = localStorage.getItem("showInstall");

    const currentPath = window.location.pathname;

    // Clear everything if on home page
    if (currentPath === "/") {
      setActiveItem("");
      localStorage.removeItem("activeItem");
      localStorage.removeItem("activeRoute");
      localStorage.removeItem("showInstall");
      setShowInstall(false);
      return;
    }

    // Restore saved state only if currentPath matches savedRoute
    if (savedRoute && savedRoute !== "/" && savedRoute === currentPath) {
      if (savedItem) setActiveItem(savedItem);
      if (savedShowInstall === "true") setShowInstall(true);
    }


    if (
      savedRoute &&
      savedRoute !== "/" &&
      savedRoute !== currentPath &&
      !activeItem
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

  const handleClick = (itemName: string) => {
    setActiveItem(itemName);
    setShowInstall(installItems.includes(itemName));

    // 👇 Close both on mobile
    if (typeof setIsMobileSidebarOpen === 'function') {
      setIsMobileSidebarOpen(false);
    }
    if (typeof setIsSidebarVisible === 'function') {
      setIsSidebarVisible(false);
    }
  };

  const navLink = (name, display = null, showArrow = false) => {
    const isActive = pathname === itemRoutes[name];

    return (
      <Link href={itemRoutes[name] || "/"} onClick={() => handleClick(name)}>
        <div
          className={`flex justify-between items-center py-[3px] pl-2 pr-2 rounded-md cursor-pointer transition
          ${isActive ? "bg-[#F4E2FF] text-[#BF56FF]" : "text-[#7E7E7E] hover:bg-[#F2F2F2] hover:text-[#1E1E1E]"}
        `}
        >
          <span >{typeof display === "string" ? display : display ?? name}</span>
          {showArrow && <img src="/Website Assets/Arrow Left.svg" alt="" className="pl-10" />}
        </div>
      </Link>
    );
  };

  return (
    <>
    <div className="h-screen bg-white dark:bg-[#202020] flex flex-col overflow-y-hidden ">
      <header className="sticky top-0 z-10 bg-white lg:block sm:hidden hidden dark:bg-[#202020]">
        <div className="flex items-center justify-between p-3">
      <div className="flex items-center space-x-2">
        <img src="/Website Assets/Logo.svg" alt="Main Logo" />
{/* Darkmode & lightmode images start */}
  <img
    src="/Website Assets/Corpus AI logo.svg"
    alt="Docs Icon"
    className="block dark:hidden"
  /> 

  {/* Dark mode image */}
  <img
    src="/Website Assets/corpus-ai-white-logo.svg"
    alt="Docs Icon"
    className="hidden dark:block"
  />      
        
  <img
    src="/Website Assets/Docs.svg"
    alt="Docs Icon"
    className="block dark:hidden"
  />

  {/* Dark mode image */}
  <img
    src="/Website Assets/Docs-white.svg"
    alt="Docs Icon"
    className="hidden dark:block"
  />
        
      </div>
       <img
    src="/Website Assets/Dots Sidebar.svg"
    alt="Docs Icon"
    className="block dark:hidden"
  />

  {/* Dark mode image */}
  <img
    src="/Website Assets/icon-white.svg"
    alt="Docs Icon"
    className="hidden dark:block"
  />
  {/* Darkmode & lightmode images end */}
  </div>
        <hr className="ml-1 mr-1 border-[#E5E5E5] dark:border-[#2C2C2C]" />
        <form className="mt-3 bg-[#F8F8F8] rounded py-1 pl-2 ml-1.5 mr-2 dark:bg-[#1E1E1E] dark:border-1 dark:border-[#2C2C2C]">
          <span className="absolute">
            <img src="/Website Assets/Search.svg" alt="" className="mt-0.5"/>
          </span>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-7 outline-0 bg-[#F8F8F8] w-full dark:bg-[#1E1E1E] placeholder:text-[#7E7E7E] dark:text-white"
            required
          />
        </form>
      </header>

      <div className={`flex-1 px-3 text-sm list-none text-[#7E7E7E] lg:mt-3 mt-20  ${showInstall ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        {/* Section: Chatbot */}
        <li>
          <div className="flex items-start gap-2">
            <img src="/Website Assets/Robot.svg" alt="" />
            <span>Chatbot</span>
            <div className="ml-[100px]">
              <img src="/Website Assets/Arrow Down.svg" alt="" />
            </div>
          </div>
          <div className="border-l border-[#D8D8D8] dark:border-[#2C2C2C] text-[#7E7E7E] ml-3">
            <div className="px-3">
              {navLink("Website Chatbot")}
              {navLink("File Chatbot")}
              {navLink("Chatbot Data Store")}
              {navLink("Chatbot Query Logs")}
              {navLink("Chatbot Customization")}
              {navLink("Use Documents From Google Drive")}
            </div>

          </div>
        </li>

        {/* Section: Integration */}
        <li>
          <div className="flex items-center gap-2">
            <img src="/Website Assets/Setting.svg" alt="" />
            <span>Integration</span>
          </div>
          <div className="text-[#7E7E7E] pr-3 border-l border-[#D8D8D8] dark:border-[#2C2C2C] ml-3">
            <span
              className="flex justify-between cursor-pointer pl-2 ml-3 py-[2px] rounded-md hover:bg-[#F2F2F2] hover:text-[#1E1E1E]"
              onClick={() => setShowInstall(prev => !prev)}
            >
              Install On
              <img src="/Website Assets/Arrow Left.svg" alt="" className="pr-2" />
            </span>
            {showInstall && (
              <ul className="ml-3 ">
                {installItems.map((item) => navLink(item))}
              </ul>
            )}
            <div className="cursor-pointer rounded-md ml-3 hover:bg-[#F2F2F2] hover:text-[#1E1E1E]">
              {navLink("Connect", null, true)}

            </div>
            <div className="cursor-pointer ml-3 rounded-md my-2  hover:bg-[#F2F2F2] hover:text-[#1E1E1E]">
              {navLink("RESTful API", null, true)}
            </div>
          </div>


        </li>

        {/* Section: Access Settings */}
        <li>
          <Link href="/Components/chatbots-docs-pages/Access_Setting" onClick={() => handleClick("Access Settings")}>
            <div
              className={`py-1 rounded-md flex items-center gap-2 hover:bg-[#F2F2F2] hover:text-[#1E1E1E] ${pathname === "/Components/chatbots-docs-pages/Access_Setting" ? "bg-[#F4E2FF] text-[#BF56FF]" : "text-[#7E7E7E]"}`}
            >
              <img src="/Website Assets/Sheild Plus.svg" alt="" />
              Access Settings
            </div>
          </Link>
        </li>

        {/* Section: Billing */}
        <li>
          <div className="flex items-center gap-2">
            <img src="/Website Assets/Dollar.svg" alt="" />
            <span>Billing</span>
          </div>
          <div className="border-l border-[#D8D8D8] dark:border-[#2C2C2C] text-[#7E7E7E] space-y-2 ml-3 ">
            <div className="px-3">
              {navLink("Upgrade Plan")}
              {navLink("AWS Marketplace")}
            </div>
          </div>
        </li>

        {/* Section: FAQ */}
        <li>
          <Link href="/Components/chatbots-docs-pages/FAQ" onClick={() => handleClick("FAQ")}>
            <div
              className={`flex items-center gap-2 mb-[23px] py-0.5 rounded-md cursor-pointer transition ${pathname === "/Components/chatbots-docs-pages/FAQ"
                  ? "bg-[#F4E2FF] text-[#BF56FF]"
                  : "text-[#7E7E7E] hover:bg-[#F2F2F2] hover:text-[#1E1E1E]"
                }`}
            >
              <img src="/Website Assets/Question Mark.svg" alt="" />
              <span>{'FAQ'}</span>
            </div>
          </Link>
        </li>

        {showInstall && (
          <div className="fixed bottom-[45px] left-0 w-60 h-7 bg-white/75 z-50 pointer-events-none hidden lg:block"></div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t ml-1 mr-1 border-[#E5E5E5] dark:border-[#2C2C2C] lg:block hidden dark:bg-[#202020]">
        <div className="ml-3 mr-5  flex justify-between text-[#7E7E7E] py-2">
          <div className="flex gap-1 p-[2px] rounded-3xl  border-1 border-[#E5E5E5] dark:border-[#2C2C2C] ">
            <img
              src="/Website Assets/Brightness.svg"
              alt="Light Mode"
              onClick={() => { if (darkMode) toggleDarkMode(); }}
              className={`w-6 h-6 p-1 rounded-full cursor-pointer text-[#7E7E7E] ${!darkMode ? 'bg-[#E9E9E9]' : ''}`}
            />

            <img
              src="/Website Assets/Moon.svg"
              alt="Dark Mode"
              onClick={() => { if (!darkMode) toggleDarkMode(); }}
              className={`w-6 h-6 p-1 rounded-full cursor-pointer ${darkMode ? 'bg-[#303030]' : ''}`}
            />
          </div>
          <img src="/Website Assets/Sidebar-Flip.svg" alt="" />
        </div>
      </div>
    </div>
</>
  );
}
