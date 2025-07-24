'use client';
import Link from 'next/link';

export default function WebsiteFeatures() {
    return (
        <>
            <div className="bg-white py-10 mt-6">
                <p className="text-[#BF56FF] text-center pt-2">Features</p>
                <h1 className="font-bold text-[30px] px-5 b-10 lg:text-center text-left">Smart CorpusAI Chatbot on Your Website</h1>
                <div className="grid mt-10 lg:grid-cols-3 grid-cols-1 col-start-1 col-end-7 gap-4 lg:gap-0  mx-[30px]">
                    {/* Card 1 Code start here */}
                    <div className="relative cursor-pointer space-y-4 border border-[#EEEEEE] border-t-0 border-b-0 p-4 group hover:bg-gradient-to-t from-[#F9F5FE] to-[#fff] hover:text-[#BF56FF]">
                        <div className='bg-[#BF56FF] py-[2px] w-4 rounded-t-[5px] absolute rotate-90 ml-[-24px] mt-[57px] transition-all duration-300 group-hover:w-8 group-hover:ml-[-31px] '>

                        </div>
                        <div className="w-8 bg-[#F6E7FF] border border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                            <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/Flashlight-icon.svg" alt="" />
                        </div>
                        <div className='space-y-1'>
                            <h3 className='font-bold'>Powerful AI Chat Tools</h3>
                            <p className='text-[#7D7D7D] text-[13px]'>
                                Let AI help you read smarter and more productively. By summarizing documents, answering your questions, and extracting key information in seconds, it transforms how you interact with content—saving time, boosting comprehension, and enhancing decision-making across all your reading tasks.
                            </p>
                        </div>
                    </div>
                    {/* Card 1 Code END here */}

                    {/* Card 2 Code start here */}
                    <div className="relative cursor-pointer space-y-4 border border-[#EEEEEE] border-t-0 border-b-0 p-4 group hover:bg-gradient-to-t from-[#F9F5FE] to-[#fff] hover:text-[#BF56FF]">
                        <div className='bg-[#BF56FF] py-[2px] w-4 rounded-t-[5px] absolute rotate-90 ml-[-24px] mt-[57px] transition-all duration-300 group-hover:w-8 group-hover:ml-[-31px] '>


                        </div>
                        <div className="w-8 bg-[#F6E7FF] border border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                            <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/File-icon-2.svg" alt="" />
                        </div>
                        <div className='space-y-1'>
                            <h3 className='font-bold'>Multi-docs Support</h3>
                            <p className='text-[#7D7D7D] text-[13px]'>
                                Learn from a wide range of document formats, including PDFs, Text, Word (DOC, DOCX), PowerPoint (PPT, PPTX), Excel (XLS, XLSX), and more. Easily upload and process diverse files to extract insights and streamline workflows across multiple content types.
                            </p>
                        </div>
                    </div>
                    {/* Card 2 Code END here */}

                    {/* Card 3 Code start here */}
                    <div className="relative cursor-pointer space-y-4 border border-[#EEEEEE] border-t-0 border-b-0 p-4 group hover:bg-gradient-to-t from-[#F9F5FE] to-[#fff] hover:text-[#BF56FF]">
                        <div className='bg-[#BF56FF] py-[2px] w-4 rounded-t-[5px] absolute rotate-90 ml-[-24px] mt-[57px] transition-all duration-300 group-hover:w-8 group-hover:ml-[-31px] '>


                        </div>
                        <div className="w-8 bg-[#F6E7FF] border border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                            <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/Search-Icon-3.svg" alt="" />
                        </div>
                        <div className='space-y-1'>
                            <h3 className='font-bold'>Smart Summary</h3>
                            <p className='text-[#7D7D7D] text-[13px]'>
                                Generate quick summaries of long documents, capturing key points without spending too much time on reading. So you can access more information, work efficiently, save time, and do more creative work with ease and confidence.
                            </p>
                        </div>
                    </div>
                    {/* Card 3 Code END here */}

                      {/* Card 4 Code start here */}
                    <div className="relative cursor-pointer space-y-4 border border-[#EEEEEE] border-b-0 p-4 group hover:bg-gradient-to-t from-[#F9F5FE] to-[#fff] hover:text-[#BF56FF]">
                        <div className='bg-[#BF56FF] py-[2px] w-4 rounded-t-[5px] absolute rotate-90 ml-[-24px] mt-[57px] transition-all duration-300 group-hover:w-8 group-hover:ml-[-31px] '>


                        </div>
                        <div className="w-8 bg-[#F6E7FF] border border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                            <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/Question-Mark-icon.svg" alt="" />
                        </div>
                        <div className='space-y-1'>
                            <h3 className='font-bold'>Enhanced Navigation</h3>
                            <p className='text-[#7D7D7D] text-[13px]'>
                                Utilize intelligent AI to quickly access specific sections, headings, or indexes, significantly speeding up the review of large documents. CorpusAI chat doc also provides a comprehensive AI experience, enhancing productivity and making document navigation effortless and more efficient.
                            </p>
                        </div>
                    </div>
                    {/* Card 4 Code END here */}
                     
                       {/* Card 5 Code start here */}
                    <div className="relative cursor-pointer space-y-4 border border-[#EEEEEE] border-b-0 p-4 group hover:bg-gradient-to-t from-[#F9F5FE] to-[#fff] hover:text-[#BF56FF]">
                        <div className='bg-[#BF56FF] py-[2px] w-4 rounded-t-[5px] absolute rotate-90 ml-[-24px] mt-[57px] transition-all duration-300 group-hover:w-8 group-hover:ml-[-31px] '>


                        </div>
                        <div className="w-8 bg-[#F6E7FF] border border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                            <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/Double-chat-icon.svg" alt="" />
                        </div>
                        <div className='space-y-1'>
                            <h3 className='font-bold'>Context-Aware Insights</h3>
                            <p className='text-[#7D7D7D] text-[13px]'>
                                Powered by ChatGPT-4, it analyzes the context of your queries to deliver highly relevant and accurate responses from your documents. It supports seamless communication in over 80 languages, making it ideal for global users and diverse content.
                            </p>
                        </div>
                    </div>
                    {/* Card 5 Code END here */}

                      {/* Card 6 Code start here */}
                    <div className="relative cursor-pointer space-y-4 border border-[#EEEEEE] border-b-0 p-4 group hover:bg-gradient-to-t from-[#F9F5FE] to-[#fff] hover:text-[#BF56FF]">
                        <div className='bg-[#BF56FF] py-[2px] w-4 rounded-t-[5px] absolute rotate-90 ml-[-24px] mt-[57px] transition-all duration-300 group-hover:w-8 group-hover:ml-[-31px] '>


                        </div>
                        <div className="w-8 bg-[#F6E7FF] border border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                            <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/Search-icon-2.svg" alt="" />
                        </div>
                        <div className='space-y-1'>
                            <h3 className='font-bold'>Advanced Keyword Search</h3>
                            <p className='text-[#7D7D7D] text-[13px]'>
                               Perform keyword-based searches across multiple documents at once, instantly locating specific information with greater precision and efficiency, saving time and improving your overall document analysis workflow
                            </p>
                        </div>
                    </div>
                    {/* Card 6 Code END here */}

                </div>
            </div>

        </>
    );
}
