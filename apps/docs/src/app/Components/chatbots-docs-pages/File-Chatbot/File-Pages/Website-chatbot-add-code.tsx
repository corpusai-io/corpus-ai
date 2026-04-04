'use client';
import Link from 'next/link';

export default function WebsitePages() {
  return (
    <>
      <div className="bg-[#F9F0FF] px-4 py-6">
        <h2 className="text-center font-bold text-2xl sm:text-3xl mb-10 pt-6">
          How to Chat with Docs
        </h2>

        <div className="flex flex-col lg:flex-row gap-7 items-center justify-between max-w-7xl mx-auto">
          {/* Left Section - Chatbot Setup Card */}
          <div className="pb-5 w-full lg:max-w-2xl bg-white pt-4 px-4 text-[10px] rounded-[20px] shadow-lg border border-[#F2F2F2] ">
            <h2 className="font-bold">Create Chatbot</h2>
            <p className="text-[#7A7A7A] mb-4">
              Create a Chatbot from different sources.
            </p>

            <div className="flex flex-col md:flex-row gap-1">
              {/* Tabs */}
              <ul className="space-y-2 font-medium">
                <li>
                  <button className="cursor-pointer text-left px-4 py-2 rounded-[14px] text-gray-400 font-semibold flex items-center gap-2">
                    <img
                      src="/website-assets/chatbot-docs-pages-icons/Website chatbot/Gray-Browser-icon.svg"
                      alt=""
                      className="w-4 h-4"
                    />
                    Web
                  </button>
                </li>
                <li>
                  <button
                    className="cursor-pointer w-full text-left px-4 py-2 rounded-md bg-gray-200 text-purple-600  flex items-center gap-2"
                  >
                    <img
                      src="/website-assets/chatbot-docs-pages-icons/Website chatbot/color-File-icon.svg"
                      alt=""
                      className="w-4 h-4"
                    />
                    File
                  </button>
                </li>
              </ul>

              {/* Web Content Form */}
              <div className="flex-1 border border-[#F4F4F4] p-4 rounded-[20px] border-b-0">
                <div className="space-y-1">
                  <h4 className="font-bold">Upload Files</h4>
                  <p className="text-[#7A7A7A]">
                    Upload files to build chatbot
                  </p>

                <div className="text-center my-5 py-4 bg-[#F9F0FF] border border-[#E7C0FF] rounded-[5px]">
  <div className="flex flex-col items-center justify-center space-y-2 ">
    <img
      src="/website-assets/chatbot-docs-pages-icons/Website chatbot/Arrow-Up-icon.svg"
      alt=""
      className="w-4 h-4"
    />
    <p className="font-semibold">
      Drag and drop some files here, or click to select files.
    </p>
    <p className="text-[#7A7A7A]">
      Accepts: .pdf .htm .tsv .csv .txt
    </p>
  </div>
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
            <p className="text-[#BF56FF]">Upload</p>
            <h2 className="font-bold text-[22px] ">
              Upload Your PDF or Document
            </h2>
            <p className="text-[#7F7A7A] text-justify">
              Simply upload your .doc, .txt, .csv, or .tsv files, or provide a URL if your content is online. Chat with Doc quickly analyzes your material, allowing you to start interacting immediately.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
