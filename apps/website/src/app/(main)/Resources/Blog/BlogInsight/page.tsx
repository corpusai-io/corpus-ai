

import Image from "next/image";
import Link from "next/link";

export default function BlogInsight() {
  return (
    <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto mt-20 mb-20 px-4">
      {/* Main Content */}
      <div className="flex-1 min-w-0 mt-3 md:mt-7">
        <Link className="text-[#7F7A7A] flex gap-2 hover:text-black" href = "/Resources/Blog">
        <p>&lt;</p>
        <p>Back to Blog</p>
        </Link>
        <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-6 text-black leading-tight mt-5 md:mt-9">
          20 B2B Chatbot Benefits<br />For Business Efficiency<br />And Buyer Trust
        </h1>
        <div className="flex items-center gap-4 text-sm text-[#7F7A7A] mb-8">
          
            {/* Placeholder for author avatar */}
            <Image src="/profile.png" width={30} height={30} alt="profile"></Image>
          
          <span className="">Yousaf Hassan</span>
          <span className="mx-2 text-2xl text-gray-400">•</span>
          <span>Jun 14 2025</span>
          <span className="mx-2 text-2xl text-gray-400">•</span>
          <span>18 min read</span>
        </div>
        <div className="prose max-w-none text-[#7F7A7A] mt-8">
            <div className="contain flex flex-col gap-3 md:pr-8">
          <p>
            With high buyer expectations and complex customer behavior, staying fast and efficient isn&apos;t easy for many businesses. Teams often struggle to keep up, and that&apos;s where implementing chatbots makes a difference.
          </p>
          <p>
            Chatbots help you connect with potential customers in real-time, guide conversations across messaging apps, and keep leads engaged even when your team is offline.
          </p>
          <p>
            
            They simplify support operations, improve user interactions, and collect valuable data to better understand your audience and enhance customer engagement.
          </p>
          <p>
            
            In this article, we&apos;ll break down how B2B chatbots streamline communication, improve customer support, and serve as a cost-effective solution for scaling your business. You&apos;ll also see how smart data collection and access to customer data can lead to better decisions and better results.
          </p>
          </div>
          <h2 className="font-semibold text-2xl mt-12 mb-4 text-black">The Value of Response Speed in B2B</h2>
          <div className="cont flex flex-col gap-4">
          <p className="leading-relaxed">
            In B2B (business-to-business) sales, speed often determines who wins the deal.
          </p>
          <p className="leading-relaxed">
            When a potential client lands on your site, they are likely evaluating solutions. Every hour they wait for a response is a window of opportunity for your competitors.
          </p >
          <p className="leading-relaxed">
            Research shows that 50% of B2B buyers will choose the vendor that responds first. A prompt response builds confidence early in complex or high-value deals where trust plays a big role.
          </p>
          <p className="leading-relaxed">
            On the other hand, slow replies can quietly signal that you&apos;re hard to reach or not as organized. And in many cases, that impression sticks even if your solution is a great fit.
          </p>
          </div>
          <h2 className="font-semibold text-2xl mt-10 mb-4 text-black">How Chatbots Help You Stay Responsive</h2>
          <p className="leading-relaxed">
            Whether a prospect is evaluating your pricing or a client has a time-sensitive question, being available when they reach out matters. AI chatbots let you respond instantly, even when your team is offline or focused on high-touch requests, and it&apos;s a great fit.
          </p>
        </div>
        <div className="flex my-10">
        <Image src={"/assets/blogChatBotImage.svg"} height={400} width={400} alt="imgae"></Image>
        </div>
        <p className="text-[#7F7A7A]">Denser is built with this responsiveness in mind. It gives your business the power to engage leads, answer detailed product questions, and qualify opportunities the moment they arrive without human intervention. <br /> <br />

It pulls answers from your documentation, FAQs, or knowledge base so replies remain accurate and relevant. <br /> <br />

Responsiveness also means handling more volume without slowing down. With Denser, you can manage hundreds of chats across time zones while maintaining the tone and consistency your brand is known for.
<br /> <br />

Your customers get the help they need right away, your team stays focused on deeper conversations, and your business maintains a responsive presence around the clock.
<br /> <br />
Ready to make your business more responsive? See how Corpus B2B chatbot works and start engaging your leads in real-time.

</p>
      </div>
      {/* Sidebar */}
      <aside className="w-full hidden md:block lg:w-80 flex-shrink-0 md:mt-24">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4 text-[#7F7A7A]">ON THIS PAGE</h3>
          <ul className="text-[#7F7A7A] text-base space-y-2">
            <li>The Value of Response Speed in B2B</li>
            <li>How Chatbots Help You Stay Responsive</li>
            <li>Benefits of Chatbot for Individuals</li>
            <li>Benefits of Chatbot for Businesses</li>
            <li>Chatbot Benefits by Industry</li>
            <li>Why Choose Corpus for B2B Chatbot Solutions</li>
            <li>FAQs about B2B Chatbot Solutions</li>
          </ul>
        </div>
        <div className="flex flex-col gap-2 text-[#7F7A7A] text-sm mt-3">
          <span>Share File Via</span>
          <span className="flex gap-2">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground size-9 opacity-60 hover:opacity-100" aria-label="Share on Twitter"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="black" className="remixicon "><path d="M10.4883 14.651L15.25 21H22.25L14.3917 10.5223L20.9308 3H18.2808L13.1643 8.88578L8.75 3H1.75L9.26086 13.0145L2.31915 21H4.96917L10.4883 14.651ZM16.25 19L5.75 5H7.75L18.25 19H16.25Z"></path></svg></button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground size-9 opacity-60 hover:opacity-100" aria-label="Share on LinkedIn"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="black" className="remixicon "><path d="M6.94048 4.99993C6.94011 5.81424 6.44608 6.54702 5.69134 6.85273C4.9366 7.15845 4.07187 6.97605 3.5049 6.39155C2.93793 5.80704 2.78195 4.93715 3.1105 4.19207C3.43906 3.44699 4.18654 2.9755 5.00048 2.99993C6.08155 3.03238 6.94097 3.91837 6.94048 4.99993ZM7.00048 8.47993H3.00048V20.9999H7.00048V8.47993ZM13.3205 8.47993H9.34048V20.9999H13.2805V14.4299C13.2805 10.7699 18.0505 10.4299 18.0505 14.4299V20.9999H22.0005V13.0699C22.0005 6.89993 14.9405 7.12993 13.2805 10.1599L13.3205 8.47993Z"></path></svg></button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground size-9 opacity-60 hover:opacity-100" aria-label="Share on Facebook"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="black" className="remixicon "><path d="M14 13.5H16.5L17.5 9.5H14V7.5C14 6.47062 14 5.5 16 5.5H17.5V2.1401C17.1743 2.09685 15.943 2 14.6429 2C11.9284 2 10 3.65686 10 6.69971V9.5H7V13.5H10V22H14V13.5Z"></path></svg></button>
          </span>
        </div>
      </aside>
    
    </div>
  );
}