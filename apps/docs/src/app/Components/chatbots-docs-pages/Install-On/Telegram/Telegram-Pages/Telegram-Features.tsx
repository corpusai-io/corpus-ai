'use client';
import Link from 'next/link';

export default function WebsiteReasons() {
  return (
    <>
    <div className="bg-white py-10 mt-6">
        <h1 className="font-bold text-[30px] px-5 b-10 lg:text-center text-left">Key Integration Features</h1>
        <div className="grid mt-10 lg:grid-cols-3 grid-cols-1 col-start-1 col-end-7 gap-4 mx-[30px]">
            {/* Card 1 Code start here */}
            <div className="space-y-4 border-1 border-[#EEEEEE] rounded-[10px] p-4 hover:text-[#BF56FF] hover:border-[#BF56FF] cursor-pointer hover:shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                <div className="w-8 bg-[#F6E7FF] border border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                <img src="/Website Assets/chatbot-docs-pages-icons/Telegram Icons/Brain-icon.svg" alt="" />
                </div>
                <div className='space-y-1'>
                    <h3 className='font-bold'>Multi-Chat Management</h3>
                    <p className='text-[#7D7D7D] text-[13px]'>
                        Easily link your bot to multiple Telegram chats or communities and manage all interactions from one central dashboard.
                    </p>
                </div>
            </div>
            {/* Card 1 Code END here */}

            {/* Card 2 Code start here */}
              <div className="space-y-4 border-1 border-[#EEEEEE] rounded-[10px] p-4 hover:text-[#BF56FF] hover:border-[#BF56FF] cursor-pointer hover:shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                <div className="w-7 bg-[#F6E7FF] border-1 border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                <img src="/Website Assets/chatbot-docs-pages-icons/Telegram Icons/Setting-icon.svg" alt="" />
                </div>
                <div className='space-y-2'>
                    <h3 className='font-bold'>Seamless Interactions</h3>
                    <p className='text-[#7D7D7D] text-[13px]'>
                        Integrated directly into Telegram groups, your bot joins the conversation naturally—answering questions or guiding users
                    </p>
                </div>
            </div>
            {/* Card 2 Code END here */}

            {/* Card 3 Code start here */}
              <div className="space-y-4 border-1 border-[#EEEEEE] rounded-[10px] p-4 hover:text-[#BF56FF] hover:border-[#BF56FF] cursor-pointer hover:shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                <div className="w-8 bg-[#F6E7FF] border-1 border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                <img src="/Website Assets/chatbot-docs-pages-icons/Telegram Icons/Chat-icon.svg" alt="" />
                </div>
                <div className='space-y-2'>
                    <h3 className='font-bold'>Secure Permissions</h3>
                    <p className='text-[#7D7D7D] text-[13px]'>
                        Telegram integration requires only basic access to function—keeping user data safe and your privacy protected.
                    </p>
                </div>
            </div>
            {/* Card 3 Code END here */}

            {/* Card 4 Code start here */}
              <div className="space-y-4 border-1 border-[#EEEEEE] rounded-[10px] p-4 hover:text-[#BF56FF] hover:border-[#BF56FF] cursor-pointer hover:shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                <div className="w-8 bg-[#F6E7FF] border-1 border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                <img src="/Website Assets/chatbot-docs-pages-icons/Telegram Icons/People-Icon.svg" alt="" />
                </div>
                <div className='space-y-2'>
                    <h3 className='font-bold'>Instant Personal Replies</h3>
                    <p className='text-[#7D7D7D] text-[13px]'>
                        Your Telegram bot can respond directly in private chats, offering fast and focused support without the noise of public channels.
                    </p>
                </div>
            </div>
            {/* Card 4 Code END here */}
            
            {/* Card 5 Code start here */}
              <div className="space-y-4 border-1 border-[#EEEEEE] rounded-[10px] p-4 hover:text-[#BF56FF] hover:border-[#BF56FF] cursor-pointer hover:shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                <div className="w-8 bg-[#F6E7FF] border-1 border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                <img src="/Website Assets/chatbot-docs-pages-icons/Telegram Icons/Share-icon.svg" alt="" />
                </div>
                <div className='space-y-2'>
                    <h3 className='font-bold'>Structured Answers</h3>
                    <p className='text-[#7D7D7D] text-[13px]'>
                       CorpusAI’s Telegram replies are concise, contextual, and easy to follow—making knowledge instantly accessible across your conversations.
                    </p>
                </div>
            </div>
            {/* Card 5 Code END here */}

            {/* Card 6 Code start here */}
              <div className="space-y-4 border-1 border-[#EEEEEE] rounded-[10px] p-4 hover:text-[#BF56FF] hover:border-[#BF56FF] cursor-pointer hover:shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                <div className="w-8 bg-[#F6E7FF] border-1 border-[#F0D7FF] p-1.5 rounded-[8px] shadow-[0_0_25px_rgba(127,17,224,0.2)]">
                <img src="/Website Assets/chatbot-docs-pages-icons/Telegram Icons/Bell-Icon.svg" alt="" />
                </div>
                <div className='space-y-2'>
                    <h3 className='font-bold'>Easy Updates</h3>
                    <p className='text-[#7D7D7D] text-[13px]'>
                        Automatic plugin updates through WordPress ensure you always have the latest features and security improvements.
                    </p>
                </div>
            </div>
            {/* Card 6 Code END here */}
            
    </div>
    </div>

    </>
  );
}
