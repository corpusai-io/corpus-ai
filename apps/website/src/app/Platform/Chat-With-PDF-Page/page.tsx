import B2BFeatureCard from '@/app/components/B2BFeatureCard';
import CustomerCareFAQ from '@/app/components/CustomerCareFAQ';
import SolutionFAQ from '@/app/components/SolutionFAQ';
const features = [
    {
      icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap size-6 text-primary" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
      ),
      title: 'AI Power',
      description: 'Corpus Chat transforms how you interact with PDF documents. It integrates seamlessly with your favorite platforms, allowing you to quickly break down complex concepts, highlight key takeaways, and gain a clear understanding of dense information—saving you time and effort in your daily work.',
      highlight: false,
    },
    {
      icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text size-6 text-primary" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      ),
      title: 'Summarize PDFs',
      description: 'Easily analyze and summarize academic papers, research articles, or reports. PDF Chat saves you from endless scrolling by letting you ask questions, get clear summaries, and quickly find the information you need—all in one place.',
      highlight: true,
    },
    {
      icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe size-6 text-primary" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
      ),
      title: 'Language Support',
      description: 'Support for 80+ languages, anytime you need it. Upload PDFs in any language and chat in the language youre most comfortable with. You can even upload a document in one language and ask questions in another—perfect for international research, cross-border collaboration, or multilingual study.',
      highlight: false,
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase size-6 text-primary" aria-hidden="true"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect></svg>
      ),
      title: 'Versatile Applications',
      description: 'Perfect for documents in education, healthcare, legal, finance, and business. PDF Chat quickly extracts key insights, helping professionals access important information without the hassle of manual review. It streamlines workflows and saves valuable time.',
      highlight: false,
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-messages-square size-6 text-primary" aria-hidden="true"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"></path><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path></svg>
      ),
      title: 'Multi-File Chats',
      description: 'Extract key data and insights quickly and efficiently. DenserAI chat supports PDFs, Text, Word (DOC, DOCX), PowerPoint (PPT, PPTX), Excel (XLS, XLSX), etc. Keep your study materials, papers, or project files in one conversation.',
      highlight: false,
    },
    {
      icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search size-6 text-primary" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      ),
      title: 'Highlight Sources',
      description: 'Get each answer backed by specific references from the PDF, ensuring you receive reliable, source-backed information every time. You can also easily trace the exact source of the answer directly from the highlighted section within the document for full transparency and verification.',
      highlight: false,
    },
  ];

  const chatWithPdfFaq = [
  {
    question: "How does AI chat work for PDFs?",
    answer: "Our chat with PDF tool can assist with various tasks like answers, explanations, analysis, and even providing creative suggestions. It's ideal for learning, quick information retrieval, problem-solving, and expert insight.",
  },
  {
    question: "Is my conversation data private and secure?",
    answer: "Yes, your privacy is our top priority. All conversations are encrypted, and we never share your data with third parties. Your documents and chats are processed securely in isolated environments and automatically deleted after analysis, ensuring complete confidentiality.",
  },
  {
    question: "How accurate are the AI PDF chat's responses?",
    answer: "Our AI delivers precise and contextually accurate responses, thanks to its advanced training on a wide range of data. DenserAI's Chat with PDF provides transparency by citing sources directly from your document for every response. While the AI is highly reliable, we recommend verifying critical information with authoritative sources.",
  },
  {
    question: "Can I use the PDF chat assistant in different languages?",
    answer: "Absolutely! DenserChat PDF chat supports multiple languages, enabling you to generate conversations in various languages with ease. Try DenserAI PDF chat today, reading is not more a difficult thing.",
  },
  {
    question: "Is CorpusAI PDF chat free to use?",
    answer: "Yes, CorpusAI PDF chat is free to use, offering its features and benefits without any subscription fees or hidden charges. If you have more PDFs to uphold and read, you can also pay for a higher level.",
  },
];
export default function ChatWithPdfPage(){
    return(
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent px-2 sm:px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-10 md:gap-16">
          {/* Left Section */}
          <div className="flex-1 flex flex-col items-start justify-center text-left max-w-lg">
            <span className="mb-4 px-4 py-1 rounded-full bg-purple-100 text-purple-500 border text-sm font-medium inline-block">PDF Assistant</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 text-zinc-900">
              Chat with<br />
              any <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">PDF</span>
            </h1>
            <p className="text-zinc-500 mb-8 text-base sm:text-lg">
              Welcome to our AI-powered chatbot! It streamlines inquiries, offers personalized support, and uses advanced NLP for a seamless, human-like experience.
            </p>
            <button className="bg-purple-500 text-white rounded-full px-6 py-3 text-base font-semibold shadow-md hover:bg-purple-600 transition">Get Started</button>
          </div>
          {/* Right Section: Chat Card */}
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
                <div data-aos="fade-up" data-aos-duration="200" className="self-end bg-purple-100 rounded-lg px-4 py-2 text-sm max-w-[80%]">Analyze this research paper for me</div>
                <div data-aos="fade-up" data-aos-duration="400" className="self-start bg-zinc-100 text-zinc-700 rounded-lg px-4 py-2 text-sm max-w-[80%]">I'll analyze the paper and provide a summary. The key findings are:</div>
                <div data-aos="fade-up" data-aos-duration="600" className="self-start bg-white border border-zinc-100 text-zinc-700 rounded-lg px-4 py-2 text-sm max-w-[90%] shadow-sm">
                  [Page 3] The study demonstrates a 40% improvement in efficiency<br/>
                  [Page 5] New methodology reduces error rates by 60%<br/>
                  [Page 8] Results are validated across multiple datasets
                </div>
                <div data-aos="fade-up" data-aos-duration="700" className="self-end bg-purple-100 rounded-lg px-4 py-2 text-sm max-w-[80%]">Thanks a lot!</div>
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-10">Elevate Your Customer Service<br className='hidden sm:block'/> with AI Chatbot</h2>
          <div className="w-full grid grid-cols-1  md:grid-cols-3 md:flex-row items-stretch justify-center max-w-5xl mx-auto">
            {features.map((f, i) => (
              <B2BFeatureCard key={i} icon={f.icon} title={f.title} description={f.description} />
            ))}
          </div>
        </section>
  
        {/* 3 Steps Section */}
        <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-12">How to chat with PDF</h2>
          <div className="flex flex-col lg:flex-row md:justify-between items-center justify-center w-full  gap-10 px-2 sm:px-4">
            {/* Left: Card with Tabs and Form */}
            <img className='order-3' src="/assets/ChatWithPdf.svg" alt="" />
            {/* Right: Setup Info */}
            <div className="flex-1 flex order-1 flex-col items-start justify-center max-w-lg mt-10 lg:mt-0">
              <span className="mb-2 px-2 py-1 rounded-full bg-purple-50 text-purple-500 text-sm font-medium inline-block">Upload</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Upload your PDF or <br /> <span>Document</span></h3>
              <p className="text-zinc-500 text-base sm:text-lg">SImply upload your PDFs, and Word files, or paste your website URL to start. With our user-friendly platform, you can easily understand key information with AI.</p>
            </div>
          </div>
        </section>
  
        {/* Analyze Section */}
        <section data-aos="fade-left" data-aos-duration="500" className="w-full overflow-x-hidden flex flex-col lg:flex-row items-center justify-center mt-2 mb-10 max-w-7xl mx-auto">
          {/* Left: Text */}
          <div className="flex-1 flex flex-col items-start justify-center mb-10 lg:mb-0">
            <span className="mb-2 px-2 py-1 rounded-full bg-purple-50 text-purple-500 text-sm font-medium inline-block">Analyze</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Analyze Your PDF</h3>
            <p className="text-zinc-500 text-base sm:text-lg">Get instant answers, summaries, and extract key information directly from your uploaded content. CorpusChat PDF chat makes it easy to extract important details, enhancing comprehension and enabling faster, more informed decision-making.</p>
          </div>
          {/* Right: Image Card */}
          <div className="flex-1 flex items-center justify-center w-full">
            <img src="/assets/summarizeImg.svg" alt="Summarize Example" className="w-full max-w-xl rounded-2xl shadow-xl border border-white/40 bg-white/70" />
          </div>
        </section>
  
        {/* Chat Section */}
        <section data-aos="fade-right" data-aos-duration="200" className="w-full flex flex-col gap-8 lg:flex-row items-center  justify-center mt-20 mb-10 max-w-7xl mx-auto">
          {/* Left: Image */}
          <div className="flex-1 order-2 flex items-center justify-center w-full mb-10 lg:mb-0">
            <img src="/assets/summarizeFeature.svg" alt="Chatting with PDF" className="w-full max-w-xl rounded-2xl shadow-xl border border-white/40 bg-white/70" />
          </div>
          {/* Right: Text */}
          <div className="flex-1 order-1 flex flex-col items-start justify-center">
            <span className="mb-2 px-2 py-1 rounded-full bg-purple-50 text-purple-500 text-sm font-medium inline-block">Chat</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Start Chatting with PDF</h3>
            <p className="text-zinc-500 text-base sm:text-lg">Start conversations with multiple PDFs—ask questions naturally, receive instant answers, and understand complex information. Easily manage and organize all your documents—create your own document library.</p>
          </div>
        </section>
  <section>
        <SolutionFAQ faqs={chatWithPdfFaq} title='FAQ' subtitle='Chat with PDF FAQ'/>
        </section>
       
        <section className="text-center px-4 pt-[56px] pb-16 bg-white">
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
    )
}