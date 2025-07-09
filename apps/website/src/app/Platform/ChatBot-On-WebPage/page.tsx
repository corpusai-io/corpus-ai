import B2BReasonCard from '@/app/components/B2BReasonCard';


export default function ChatBotOnWebPage(){
    const features = [
        {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap size-6 text-primary" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
          ),
          title: 'Powerful Integrations',
          description: 'Our AI helps to seamlessly integrate with platforms like WordPress, Slack, and Zapier. Additionally, the Corpus AI chatbot supports a variety of document formats including PDF, TXT, PowerPoint, and more, making it easier to handle diverse content types.',
          highlight: false,
        },
        {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users size-6 text-primary" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
          ),
          title: 'User-Friendly Setup',
          description: 'Add and create your chatbot to your website or any existing system easily. With an intuitive drag-and-drop builder and point-and-click interface, customize your chatbots appearance, colors, and name in minutes, without technical experience to support.',
          highlight: false,
        },
        {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe size-6 text-primary" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
          ),
          title: 'No Language Barrier',
          description: 'Support for 80+ languages, anytime you need it. Upload PDFs in any language and chat in the language youre most comfortable with. You can even upload a document in one language and ask questions in another—perfect for international research, cross-border collaboration, or multilingual study.',
          highlight: false,
        },
      ];

    const reasons = [
      {
        icon: (
            
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-6 w-6 text-purple-500" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>
        ),
        title: 'Next Gen RAG Tech',
        description: 'Powered by state-of-the-art RAG models, our chatbot provides more accurate and contextual responses than traditional chatbots.'
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe h-6 w-6 text-purple-500" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
        ),
        title: 'Multi Lingual Support',
        description: 'Supports 80+ languages with auto-detection and natural responses for global websites.'
      },
      {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap size-6 text-primary" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
        
        ),
        title: 'Quick Integration',
        description: 'Get real-time responses without hold times or digging through FAQs—our chatbot ensures fast, efficient support.'
      },
      {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-line h-6 w-6 text-purple-400" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
        ),
        title: 'Performance Analytics',
        description: "Track your chatbot's performance, analyze user interactions, and gain insights to optimize your customer service strategy."
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-code-2 h-6 w-6 text-purple-500" aria-hidden="true"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        ),
        title: 'No Coding Required',
        description: 'Add our chatbot to your website with a simple copy-paste of a code snippet, or use our integrations for platforms like WordPress and Shopify.'
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell h-6 w-6 text-purple-500" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        ),
        title: 'Easy Updates',
        description: 'Automatic plugin updates through WordPress ensure you always have the latest features and security improvements.'
      },
    ];
    return(
    
      
        <div className="min-h-screen w-full flex flex-col items-center justify-center  bg-gradient-to-br from-[#E9D5FF] via-white to-[#EDE9FE]px-2 sm:px-4 py-8">
        <div className="flex  flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-10 md:gap-16">

          {/* Left Section */}
          <div className="flex-1  flex flex-col items-start justify-center text-left max-w-lg">
            <span className="mb-4 px-4 py-1 rounded-full bg-purple-100 text-purple-500 border text-sm font-medium inline-block">Website Enterprise</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 text-zinc-900">
              Transform<br />
              Visitors into <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Loyal Customers</span>
            </h1>
            <p className="text-zinc-500 mb-8 text-base sm:text-lg">
              Create an AI chatbot for your website to deliver instant accurate, and human like responses, enhancing customer experience. No manual training or coding is required.
            </p>
            <button className="bg-purple-500 text-white rounded-full px-6 py-3 text-base font-semibold shadow-md hover:bg-purple-600 transition">Get Started</button>
          </div>
          
          <div className="flex-1 p-4 md:p-12 rounded-2xl border border-purple-200 flex items-center justify-center w-full">
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
                  <div data-aos="fade-up" data-aos-duration="200" className="self-start bg-zinc-100 text-zinc-700 rounded-lg px-4 py-2 text-sm max-w-[80%]">Hi! How can I help you with your website today?</div>
                  <div data-aos="fade-up" data-aos-duration="400" className="self-end text-zinc-700 bg-purple-100 rounded-lg px-4 py-2 text-sm max-w-[80%]">I want to add a chatbot to my website. Is it difficult?</div>
                  <div data-aos="fade-up" data-aos-duration="600" className="self-start bg-white border border-zinc-100 text-zinc-700 rounded-lg px-4 py-2 text-sm max-w-[90%] shadow-sm">
                    <p>Not at all! you can add our chatbot to your website in minutes without any coding. Would you like to know how it works?</p>
                  </div>
                </div>
                {/* Input Box */}
                <div className="flex items-center gap-2 mt-20">
                  <input
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
        <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 mb-10">
          <div className="text-center mb-2 text-purple-400 font-semibold">Features</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-10">Smart CorpusAI Chatbot on Your Website</h2>
          <div className="w-full grid grid-cols-1  md:grid-cols-3 md:flex-row items-stretch justify-center gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <B2BReasonCard key={i} icon={f.icon} title={f.title} description={f.description}  />
            ))}
          </div>
        </section>
  
        {/* 3 Steps Section */}
        <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-12">Add Chatbot to Your Website</h2>
          <div className="flex flex-col lg:flex-row md:justify-between items-center justify-center w-full  gap-10 px-2 sm:px-4">
            {/* Left: Card with Tabs and Form */}
            <img className='order-1' src="/assets/addChatBotImage.svg" alt="" />
            {/* Right: Setup Info */}
            <div className="flex-1 flex order-1 flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
              <span className="mb-2 px-2 py-1 rounded-full bg-purple-50 text-purple-500 text-sm font-medium inline-block">Setup</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Provide Your Website<br /> <span>Domain</span></h3>
              <p className="text-zinc-500 text-base sm:text-lg">Simply input your website's domain or subdomain. Corpus AI chatbot will crawl all publicly accessible pages to create a comprehensive knowledge base of your web's content.</p>
            </div>
          </div>
        </section>
  
        {/* Analyze Section */}
        <section data-aos="fade-left" data-aos-duration="500" className="w-full overflow-x-hidden flex flex-col lg:flex-row items-center justify-center mt-2 mb-10 max-w-7xl mx-auto">
          {/* Left: Text */}
          <div className="flex-1 flex flex-col items-start justify-center mb-10 lg:mb-0">
            <span className="mb-2 px-2 py-1 rounded-full bg-purple-50 text-purple-500 text-sm font-medium inline-block">Process</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Analyze & Index</h3>
            <p className="text-zinc-500 text-base sm:text-lg">Corpus AI chatbots learn from every page—understanding text, images, charts, and tables—ensuring it capture all the key information. Once the process is complete, your website chatbot is ready to engage.</p>
          </div>
          {/* Right: Image Card */}
          <div className="flex-1 flex items-center justify-center w-full">
            <img src="/assets/chatBotBuild.svg" alt="Chatbot Build Status" className="w-full max-w-xl rounded-2xl shadow-xl border border-white/40 bg-white/70" />
          </div>
        </section>
  
        {/* Chat Section */}
        <section data-aos="fade-right" data-aos-duration="500" className="w-full flex flex-col gap-8 lg:flex-row items-center justify-center mt-20 mb-10 max-w-7xl mx-auto">
          {/* Left: Image */}
          <div className="flex-1 flex items-center justify-center w-full mb-10 lg:mb-0">
            <img src="/assets/corpusFree.svg" alt="Is Corpusbot Free?" className="w-full max-w-xl rounded-2xl shadow-xl border border-white/40 bg-white/70" />
          </div>
          {/* Right: Text */}
          <div className="flex-1 flex flex-col items-start justify-center max-w-lg">
            <span className="mb-2 px-2 py-1 rounded-full bg-purple-50 text-purple-500 text-sm font-medium inline-block">Launch</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Start Chatting</h3>
            <p className="text-zinc-500 text-base sm:text-lg">Deploy the chatbot on your website and answer questions in natural languages. From your products to services and policies, the AI chatbot provides full customer support on your website. Customers will receive instant, AI-powered responses with direct links to the relevant pages for more details.</p>
          </div>
        </section>
  
        {/* Why Choose Section */}
        <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 mb-10 max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 text-center mb-12">Why Choose CorpusAI Website Chatbot</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {reasons.map((r, i) => (
              <B2BReasonCard key={i} icon={r.icon} title={r.title} description={r.description} />
            ))}
          </div>
        </section>
  
        
   
        
      </div>
     
    )
}