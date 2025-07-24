'use client';
import Link from 'next/link';

export default function TelegramFeatures() {
    return (
        <>
            <div className="bg-white py-10 mt-6">
                <p className="text-[#BF56FF] text-center">Features</p>
                <h1 className="font-bold text-[30px] px-5 b-10 lg:text-center text-left">Benefits of Corpus AI Telegram Integration</h1>
                <div className="grid mt-10 lg:grid-cols-3 grid-cols-1 col-start-1 col-end-7 gap-4 lg:gap-0  mx-[30px]">
                    {/* Card 1 Code start here */}
                    <div className="relative cursor-pointer space-y-4 border border-[#EEEEEE] border-t-0 border-b-0 p-4 group hover:bg-gradient-to-t from-[#F9F5FE] to-[#fff] hover:text-[#BF56FF]">
                        <div className='bg-[#BF56FF] py-[2px] w-4 rounded-t-[5px] absolute rotate-90 ml-[-24px] mt-[57px] transition-all duration-300 group-hover:w-8 group-hover:ml-[-31px] '>


                        </div>
                        <div className="w-8 bg-[#F6E7FF] border border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                            <img src="/Website Assets/chatbot-docs-pages-icons/Telegram Icons/Flashlight-icon.svg" alt="" />
                        </div>
                        <div className='space-y-1'>
                            <h3 className='font-bold'>Fast, Frictionless Setup</h3>
                            <p className='text-[#7D7D7D] text-[13px]'>
                                Get started in just a few steps — no developer needed. With lightweight permissions and intuitive setup, your chatbot can be live on Telegram in minutes.
                            </p>
                        </div>
                    </div>
                    {/* Card 1 Code END here */}

                    {/* Card 2 Code start here */}
                    <div className="relative cursor-pointer space-y-4 border border-[#EEEEEE] border-t-0 border-b-0 p-4 group hover:bg-gradient-to-t from-[#F9F5FE] to-[#fff] hover:text-[#BF56FF]">
                        <div className='bg-[#BF56FF] py-[2px] w-4 rounded-t-[5px] absolute rotate-90 ml-[-24px] mt-[57px] transition-all duration-300 group-hover:w-8 group-hover:ml-[-31px] '>


                        </div>
                        <div className="w-8 bg-[#F6E7FF] border border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                            <img src="/Website Assets/chatbot-docs-pages-icons/Telegram Icons/Doublechat-icon.svg" alt="" />
                        </div>
                        <div className='space-y-1'>
                            <h3 className='font-bold'>Instant Chat Engagement</h3>
                            <p className='text-[#7D7D7D] text-[13px]'>
                                Let users interact with your chatbot directly in Telegram — no need for extra platforms or logins. Your bot responds instantly to questions in group chats or DMs, providing a seamless support experience.
                            </p>
                        </div>
                    </div>
                    {/* Card 2 Code END here */}

                    {/* Card 3 Code start here */}
                    <div className="relative cursor-pointer space-y-4 border border-[#EEEEEE] border-t-0 border-b-0 p-4 group hover:bg-gradient-to-t from-[#F9F5FE] to-[#fff] hover:text-[#BF56FF]">
                        <div className='bg-[#BF56FF] py-[2px] w-4 rounded-t-[5px] absolute rotate-90 ml-[-24px] mt-[57px] transition-all duration-300 group-hover:w-8 group-hover:ml-[-31px] '>


                        </div>
                        <div className="w-8 bg-[#F6E7FF] border border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                            <img src="/Website Assets/chatbot-docs-pages-icons/Telegram Icons/File-icon.svg" alt="" />
                        </div>
                        <div className='space-y-1'>
                            <h3 className='font-bold'>Knowledge Access</h3>
                            <p className='text-[#7D7D7D] text-[13px]'>
                                Let users interact with your chatbot directly in Telegram — no need for extra platforms or logins. Your bot responds instantly to questions in group chats or DMs, providing a seamless support experience.
                            </p>
                        </div>
                    </div>
                    {/* Card 3 Code END here */}
                </div>
            </div>

        </>
    );
}
