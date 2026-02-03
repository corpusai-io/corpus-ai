'use client';
import Link from 'next/link';

export default function WebsitePages() {
  return (
    <>
      <div className="bg-[#F9F0FF] px-4 py-6">
        <h2 className="text-center font-bold text-2xl sm:text-3xl mb-10 pt-6">
          Add a Chatbot to Your Website
        </h2>

        <div className="flex flex-col lg:flex-row gap-7 items-center justify-between max-w-7xl mx-auto">
          {/* Left Section - Chatbot Setup Card */}
          <div className="pb-5 w-full lg:max-w-2xl bg-white pt-4 px-4 text-[10px] rounded-[20px] shadow-lg border border-[#F2F2F2]">
            <h2 className="font-bold">Create Chatbot</h2>
            <p className="text-[#7A7A7A] mb-4">
              Create a Chatbot from different sources.
            </p>

            <div className="flex flex-col md:flex-row gap-1">
              {/* Tabs */}
              <ul className="space-y-2 font-medium">
                <li>
                  <button className=" text-left px-4 py-2 rounded-[14px] bg-gray-200 text-purple-600 font-semibold flex items-center gap-2">
                    <img
                      src="/website-assets/chatbot-docs-pages-icons/Website chatbot/Browser-icon.svg"
                      alt=""
                      className="w-4 h-4"
                    />
                    Web
                  </button>
                </li>
                <li>
                  <button
                    disabled
                    className="w-full text-left px-4 py-2 rounded-md text-gray-400 flex items-center gap-2 cursor-not-allowed"
                  >
                    <img
                      src="/website-assets/chatbot-docs-pages-icons/Website chatbot/File-icon.svg"
                      alt=""
                      className="w-4 h-4"
                    />
                    File
                  </button>
                </li>
              </ul>

              {/* Web Content Form */}
              <div className="flex-1 border border-[#F4F4F4] p-4 rounded-[20px] ">
                <div className="space-y-2">
                  <h4 className="font-bold">Website</h4>
                  <p className="text-[#7A7A7A]">
                    Enter the URL of the website you want to build a chatbot for.
                  </p>

                  <div>
                    <h4 className="font-semibold">URL</h4>
                    <input
                      type="text"
                      value="https://Corpusai.io"
                      readOnly
                      className="bg-[#F5E4FF] border border-[#E7C0FF] outline-0 font-medium rounded-[5px] p-2 w-full cursor-pointer"
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold">Language</h4>
                    <div className="bg-white flex justify-between items-center border border-[#E9E9E9] rounded-[5px] py-1 px-3 w-35 max-w-xs">
                      English
                      <img src="/website-assets/Arrow Down.svg" alt="" className='cursor-pointer'/>
                    </div>
                    <p className="text-[#7A7A7A] text-sm mt-2 cursor-pointer">
                      Select language of source website
                    </p>
                  </div>

                  <button className="bg-[#BF56FF] text-white px-4 py-2 rounded-[5px] mt-2 cursor-pointer">
                    Build Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Info Section */}
          <div className="lg:w-120 w-full lg:max-w-md space-y-2 text-sm pr-4">
            <p className="text-[#BF56FF]">Setup</p>
            <h2 className="font-bold text-[22px] ">
              Provide Your Website <br/> Domain
            </h2>
            <p className="text-[#7F7A7A] text-justify">
              Simply input your website's domain or subdomain. Corpus AI chatbot
              will crawl all publicly accessible pages to create a comprehensive
              knowledge base of your web's content.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
