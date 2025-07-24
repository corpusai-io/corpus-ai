'use client';
import Link from 'next/link';

export default function WebsiteFeatures() {
    return (
        <>
            <div className="bg-white py-5 mt-6 ">
               <p className='text-[#BF56FF] text-center'>FAQ</p>
                <h2 className='font-bold text-[30px] text-center'>Website Chatbot FAQ</h2>
                
                <div className='mx-15 my-10'>
                <div className='mt-[5rem] '>
                    <div className='flex justify-between py-5 pr-5'>
                        <h2 className='font-semibold text-[#1E1E1E]'>Is any coding required to set up a chatbot on a website?</h2>
                         <img src="/website-assets/chatbot-docs-pages-icons/Website chatbot/Minus-icon.svg" alt="" className='cursor-pointer'/>
                    </div>
                    <hr className='border-[#C9C9C9] '/>
                    <p className='text-[#8D8D8D] py-5'>
                        AI (Artificial Intelligence) is a technology that allows machines to think, learn, and perform tasks that usually require human intelligence, like understanding language, making decisions, or recognizing patterns. Powered by AI, chatbot solutions can answer questions in natural languages. People use AI chatbot solutions for customer service, answering FAQs, booking appointments, and more, helping businesses save time and cost.
                    </p>
                </div>
                <div>
                    <div className='flex justify-between py-5 pr-5'>
                        <h2 className='font-semibold text-[#1E1E1E]'>Does the Corpus AI chatbot support more languages?</h2>
                         <img src="/website-assets/chatbot-docs-pages-icons/Website chatbot/Plus-icon.svg" alt="" className='cursor-pointer'/>
                    </div>
                    <hr className='border-[#C9C9C9] '/>
                </div>
                <div>
                    <div className='flex justify-between py-5 pr-5'>
                        <h2 className='font-semibold text-[#1E1E1E]'>Can I embed an AI chatbot for my website?</h2>
                         <img src="/website-assets/chatbot-docs-pages-icons/Website chatbot/Plus-icon.svg" alt="" className='cursor-pointer'/>
                    </div>
                    <hr className='border-[#C9C9C9] '/>
                    
                </div>
                 <div>
                    <div className='flex justify-between py-5 pr-5'>
                        <h2 className='font-semibold text-[#1E1E1E]'>Do you offer a free trial for adding a chatbot to a website?</h2>
                         <img src="/website-assets/chatbot-docs-pages-icons/Website chatbot/Plus-icon.svg" alt="" className='cursor-pointer'/>
                    </div>
                    <hr className='border-[#C9C9C9] '/>
                    
                </div>
                <div>
                    <div className='flex justify-between py-5 pr-5'>
                        <h2 className='font-semibold text-[#1E1E1E]'>How does CorpusAI's chatbot compare with other website chatbots?</h2>
                         <img src="/website-assets/chatbot-docs-pages-icons/Website chatbot/Plus-icon.svg" alt="" className='cursor-pointer'/>
                    </div>
                    <hr className='border-[#C9C9C9] '/>
                    
                </div>
            </div>
        </div>
        </>
    );
}
