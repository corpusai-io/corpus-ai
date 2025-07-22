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
                            <h3 className='font-bold'>Powerful Integrations</h3>
                            <p className='text-[#7D7D7D] text-[13px]'>
                                Our AI helps to Seamlessly integrate with platforms like WordPress, Slack, and Zapier. Additionally, the Corpus AI chatbot supports a variety of document formats including PDF, TXT, PowerPoint, and more, making it easier to handle diverse content types.
                            </p>
                        </div>
                    </div>
                    {/* Card 1 Code END here */}

                    {/* Card 2 Code start here */}
                    <div className="relative cursor-pointer space-y-4 border border-[#EEEEEE] border-t-0 border-b-0 p-4 group hover:bg-gradient-to-t from-[#F9F5FE] to-[#fff] hover:text-[#BF56FF]">
                        <div className='bg-[#BF56FF] py-[2px] w-4 rounded-t-[5px] absolute rotate-90 ml-[-24px] mt-[57px] transition-all duration-300 group-hover:w-8 group-hover:ml-[-31px] '>


                        </div>
                        <div className="w-8 bg-[#F6E7FF] border border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                            <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/People-icon.svg" alt="" />
                        </div>
                        <div className='space-y-1'>
                            <h3 className='font-bold'>User-Friendly Setup</h3>
                            <p className='text-[#7D7D7D] text-[13px]'>
                                Add and create your chatbot to your website or any existing system easily. With an intuitive drag-and-drop builder and point-and-click interface, customize your chatbot's appearance, colors, and name in minutes, without technical experience to support.
                            </p>
                        </div>
                    </div>
                    {/* Card 2 Code END here */}

                    {/* Card 3 Code start here */}
                    <div className="relative cursor-pointer space-y-4 border border-[#EEEEEE] border-t-0 border-b-0 p-4 group hover:bg-gradient-to-t from-[#F9F5FE] to-[#fff] hover:text-[#BF56FF]">
                        <div className='bg-[#BF56FF] py-[2px] w-4 rounded-t-[5px] absolute rotate-90 ml-[-24px] mt-[57px] transition-all duration-300 group-hover:w-8 group-hover:ml-[-31px] '>


                        </div>
                        <div className="w-8 bg-[#F6E7FF] border border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                            <img src="/Website Assets/chatbot-docs-pages-icons/Website chatbot/Browser-icon.svg" alt="" />
                        </div>
                        <div className='space-y-1'>
                            <h3 className='font-bold'>No Language Barrier</h3>
                            <p className='text-[#7D7D7D] text-[13px]'>
                                Support for 80+ languages, anytime you need it. Upload PDFs in any language and chat in the language you're most comfortable with. You can even upload a document in one language and ask questions in another—perfect for international research, cross-border collaboration, or multilingual study.
                            </p>
                        </div>
                    </div>
                    {/* Card 3 Code END here */}
                </div>
            </div>

        </>
    );
}
