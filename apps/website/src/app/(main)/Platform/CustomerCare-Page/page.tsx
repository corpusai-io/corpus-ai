import B2BFeatureCard from '@/app/components/B2BFeatureCard';
import B2BReasonCard from '@/app/components/B2BReasonCard';


import SolutionFAQ from '@/app/components/SolutionFAQ';
const features = [
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap size-6 text-primary" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
    ),
    title: 'Customer Satisfaction',
    description: 'CorpusAI chatbot is designed to deliver faster, more responsive customer services. Less wait time, more consistent answers across multiple channels. Enhance the seamless customer experience with our AI chatbot, delivering timely and accurate support that boosts customer satisfaction and loyalty.',
    highlight: false,
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users size-6 text-primary" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
    ),
    title: 'Empower Live Agents',
    description: 'Free up your agents to deliver exceptional customer service with AI chatbot. By handling routine inquiries, CorpusAI chatbot allows your agents to concentrate on more complex and critical issues, and ensures a more personalized experience for customers when they need expert assistance.',
    highlight: true,
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe size-6 text-primary" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
    ),
    title: 'Instant Multilingual Support',
    description: 'CorpusAI chatbot expands your reach by offering instant multilingual support, enabling customers to communicate in their preferred language. This eliminates the need for expensive translation tools, maintains clear and effective communication with customer worldwide through our AI-powered chatbot.',
    highlight: false,
  },
];

const reasons = [
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-6 w-6 text-purple-500" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>
    ),
    title: 'Contextual Memory',
    description: 'The chatbot remembers past interactions, avoiding repetition and ensuring a smoother, more personalized experience.'
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    title: '24/7 Availability',
    description: 'Our AI-powered chatbot is available 24/7, ensuring your customers get reliable support anytime—day or night.'
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap size-6 text-primary" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
    ),
    title: 'Instant Customer Support',
    description: 'Get real-time responses without hold times or digging through FAQs—our chatbot ensures fast, efficient support.'
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-line h-6 w-6 text-purple-400" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
    ),
    title: 'Enhance Efficiency',
    description: 'The chatbot quickly understands customers and resolves common issues, reducing back-and-forth and speeding up support.'
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings h-6 w-6 text-purple-400" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    ),
    title: 'Gather Customer Feedback',
    description: 'Corpus AI chatbot collects feedback after each chat, helping B2B businesses boost efficiency and improve customer experience.'
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rocket h-6 w-6 text-purple-400" aria-hidden="true"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>
    ),
    title: 'Scalable Support',
    description: 'Whether helping one or thousands, our chatbot scales easily to deliver prompt, consistent support at any volume.'
  },
];

const faq = [
  {
    question: "What is a customer service chatbot and how does it work?",
    answer: "AI (Artificial Intelligence) is a technology that allows machines to think, learn, and perform tasks that usually require human intelligence, like understanding language, making decisions, or recognizing patterns. Powered by AI, chatbot solutions can answer questions in natural languages. People use AI chatbot solutions for customer service, answering FAQs, booking appointments, and more, helping businesses save time and cost.",
  },
  {
    question: "Who can benefit from using AI-powered customer service chatbots?",
    answer: "AI-powered chatbot can be customized for businesses across any industry, like e-commerce, finance, healthcare, and education. The chatbot can reduce operational costs, boost efficiency, and improve the overall customer experience.",
  },
  {
    question: "How can AI chatbots improve customer service?",
    answer: "AI chatbots enhance customer service by automating responses to frequently asked questions and managing repetitive tasks. This automation allows agents to focus on more complex and nuanced issues. Plus, AI chatbots provide customer support around the clock, ensuring customers receive reliable information whenever they need it.",
  },
  {
    question: "Can I create my own customer service chatbot?",
    answer: "Yes, you can create a customer service chatbot tailored to your business needs. DenserAI allows you to design and deploy a bot without needing extensive coding knowledge. With our user-friendly platform, you can quickly implement a chatbot that automates customer support tasks, enhances service efficiency, and aligns with your brand&apos;s unique requirements.",
  },
  {
    question: "Can the chatbot for customer service handle complex issues?",
answer: "Our customer service chatbot excels at managing common and repetitive inquiries efficiently. For more complex issues, it intelligently transfers the conversation to the right agent. By combining automation with personalized human support, the DenserAI chatbot ensures that all customer inquiries are addressed thoroughly."
  },
];

export default function CustomerCarePage(){
    
    return (
    
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent px-2 sm:px-4 py-8">
          <div className="flex mt-8 lg:mt-12 flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-10 md:gap-16">
            {/* Left Section */}
            <div className="flex-1 flex flex-col items-start justify-center text-left max-w-lg">
              <span className="mb-4 px-4 py-1 rounded-full bg-purple-100 text-purple-500 border text-sm font-medium inline-block">Customer Support</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 text-zinc-900">
                AI Chatbot for<br />
                Customer <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Service</span>
              </h1>
              <p className="text-zinc-500 mb-8 text-base sm:text-lg">
                Welcome to our AI-powered chatbot! It streamlines inquiries, offers personalized support, and uses advanced NLP for a seamless, human-like experience.
              </p>
              <button className="bg-purple-500 text-white rounded-full px-6 py-3 text-base font-semibold shadow-md hover:bg-purple-600 transition">Get Started</button>
            </div>
            {/* Right Section: Chat Card */}
            <div className="flex-1 bg-[#FCF6FF] p-4 md:p-12 rounded-2xl border border-purple-200 flex items-center justify-center w-full">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md border border-white/40">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500 text-white rounded-md p-2 flex items-center justify-center text-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot w-4 h-4 text-white" aria-hidden="true"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
                  </div>
                  <div className="wrap flex gap-2 items-center">
                  <span className="font-semibold text-zinc-800 text-lg">AI Assistant</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-4 text-purple-500" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
                  </div>
                </div>
                {/* Chat Bubbles */}
                <div className="flex flex-col gap-2 mb-4">
                  <div data-aos="fade-up" data-aos-duration="200" className="self-start bg-zinc-100 text-zinc-700 rounded-lg px-4 py-2 text-sm max-w-[80%]">Hi! How can I help you today?</div>
                  <div data-aos="fade-up" data-aos-duration="400" className="self-end bg-gradient-to-b from-[#FDFCFF] to-[#F1E6FF] rounded-lg px-4 py-2 text-sm max-w-[80%]">I need help with my recent order.</div>
                  <div data-aos="fade-up" data-aos-duration="600" className="self-start bg-white border border-zinc-100 text-zinc-700 rounded-lg px-4 py-2 text-sm max-w-[90%] shadow-sm">
                    I'll be happy to help! Could you please provide your order number?
                  </div>
                </div>
                {/* Input Box */}
                <div className="flex items-center gap-2 mt-20">
                  <input disabled
                    type="text"
                    className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/80 placeholder-zinc-400"
                    placeholder="Ask about anything"
                  />
                  <button className="bg-purple-500 hover:bg-purple-600 text-white rounded-md py-2 px-3 transition flex items-center justify-center">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M5 12h14m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Features Section */}
          <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-[150px] mb-[130px]">
            <div className="text-center mb-2 text-purple-400 font-semibold">Features</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-10">Elevate Your Customer Service<br className='hidden sm:block'/> with AI Chatbot</h2>
            <div className="w-full flex flex-col md:flex-row items-center justify-center  gap-6 max-w-5xl mx-auto">
              {features.map((f, i) => (
                <B2BFeatureCard key={i} icon={f.icon} title={f.title} description={f.description}  />
              ))}
            </div>
          </section>
    
          {/* 3 Steps Section */}
          <section data-aos="fade" data-aos-duration="600" className="w-full flex flex-col items-center pt-[80px] pb-[63px] bg-[#F9F0FF]">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-12">How to Build a Chatbot for Your Customer</h2>
            <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl gap-10 px-2 sm:px-4 md:px-7">
              {/* Left: Card with Tabs and Form */}
              <img src="/assets/addChatBotImage.svg" alt="" width={668} height={421}/>
              {/* Right: Setup Info */}
               <div className="flex-1 flex flex-col items-start justify-center max-w-lg px-4">
                <span className="mb-2 px-2 py-1 rounded-full text-purple-500 text-sm font-medium inline-block">Documentation</span>
                <h3 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3">Upload Information & Product Documents</h3>
                <p className="text-zinc-500 text-base sm:text-lg">Upload all relevant documents, including detailed product information, frequently asked questions (FAQs), and company policies. CorpusAI chatbot analyzes these files and build a comprehensive knowledge base, provide accurate and informed responses to customer.</p>
              </div>
            </div>
          </section>
    
          {/* Customize Section */}
          <div className='bg-[#F9F0FF] w-full'>
          <section data-aos="fade-left" data-aos-duration="500" className="w-full flex flex-col lg:flex-row items-center justify-center px-12 pb-10 max-w-7xl mx-auto">
            {/* Left: Text */}
            <div className="flex-1 flex flex-col items-start justify-center max-w-lg mb-10 lg:mb-0">
              <span className="mb-2 px-2 py-1 rounded-full text-purple-500 text-sm font-medium inline-block">Customize</span>
              <h3 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3">Design Your Bot</h3>
              <p className="text-zinc-500 text-base sm:text-lg">Integrate or embed the customer service chatbot seamlessly into your website, mobile app, or preferred platform. Customize its appearance, tone, and response style to match your brand identity and meet your customer's specific needs.</p>
            </div>
            {/* Right: Glass Card with Form and Chat Preview */}
            <img  src="/assets/custom.svg" alt="" width={620} height={421}/>
          </section>
          </div>
    
          {/* Deploy & Scale Section */}
          <div className='bg-[#F9F0FF] w-full'>
          <section data-aos="fade-right" data-aos-duration="600" className="w-full md:px-4 flex flex-col gap-4 md:gap-8 lg:justify-between  lg:flex-row items-center justify-center pt-[63px] pb-[150px] max-w-7xl mx-auto ">
            {/* Left: Integrations Card */}
            <img src="/assets/integration.svg" alt="" width={668} height={421}/>
            {/* Right: Text */}
            <div className="flex-1 flex flex-col items-start justify-center max-w-lg px-4">
              <span className="mb-2 px-2 py-1 rounded-full  text-purple-500 text-sm font-medium inline-block">Launch</span>
              <h3 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3">Begin Smart Customer Service</h3>
              <p className="text-zinc-500 text-base sm:text-lg">Once set up, your chatbot is ready to handle customer interactions immediately. It delivers instant answers to common questions and allows customers to leave messages for follow-up when necessary. This ensures continuous support, reduces response times, and enhances overall customer satisfaction.</p>
            </div>
          </section>
          </div>
    
          {/* Why Choose Section */}
          <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-[150px] mb-10 max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-zinc-900 text-center mb-12 leading-tight">Why Choose CorpusAI Customer <br/>Service Chatbot</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto place-items-center">
              {reasons.map((r, i) => (
                <B2BReasonCard key={i} icon={r.icon} title={r.title} description={r.description} />
              ))}
            </div>
          </section>
          <div className='mt-[100px]'>
          <SolutionFAQ faqs={faq} title='FAQ' subtitle='Customer Service Chatbot FAQ'/>
          </div>
          <section className="text-center px-4 mt-[56px] lg:mt-32  pb-16 bg-white">
        <h1 className="text-xl sm:text-2xl md:text-5xl font-medium text-[#1E1E1E] leading-tight">
         Trustworthy Chat with<span className="bg-gradient-to-r from-[#DAC0FF] to-[#BF56FF] bg-clip-text text-transparent"> Your Data</span>
        </h1>
        <p className="mt-4 text-[#8D8D8D] mx-auto text-base sm:text-lg">
          Verifiable answers from PDFs, websites, and beyond with source highlights.
        </p>

        
        <div className="mt-[24px] flex flex-col sm:flex-row justify-center items-center gap-4">
          <a
            href="#"
            className="hover:bg-gradient-to-r from-[#FC5990] to-[#AC5DE6]  text-black  border-[#E0E0E0] shadow font-medium px-6 py-2 border rounded-[15px] w-full sm:w-auto "
          >
            Get Started for Free
          </a>
        </div>
      </section>
        </div>
      );
}