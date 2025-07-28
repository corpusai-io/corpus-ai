import B2BFeatureCard from '@/app/components/B2BFeatureCard';
import B2BReasonCard from '@/app/components/B2BReasonCard';
import CustomerCareFAQ from '@/app/components/CustomerCareFAQ';
import SolutionFAQ from '@/app/components/SolutionFAQ';

const features = [
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain size-6 text-primary" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>
    ),
    title: 'Powerful AI Chat Tools',
    description: 'Let AI help you read smarter and more productively. By summarizing documents, answering your questions, and extracting key information in seconds, it transforms how you interact with content—saving time, boosting comprehension, and enhancing decision-making across all your reading tasks.'
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text size-6 text-primary" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
    ),
    title: 'Multi-docs Support',
    description: 'Learn from a wide range of document formats, including PDFs, Text, Word (DOC, DOCX), PowerPoint (PPT, PPTX), Excel (XLS, XLSX), and more. Easily upload and process diverse files to extract insights and streamline workflows across multiple content types.'
    
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-search size-6 text-primary" aria-hidden="true"><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"></path><path d="m9 18-1.5-1.5"></path><circle cx="5" cy="14" r="3"></circle></svg>
    ),
    title: 'Smart Summary',
    description: 'Generate quick summaries of long documents, capturing key points without spending too much time on reading. So you can access more information, work efficiently, save time, and do more creative work with ease and confidence.'
    
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-question size-6 text-primary" aria-hidden="true"><path d="M12 17h.01"></path><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"></path><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3"></path></svg>
    ),
    title: 'Enhanced Navigation',
    description: 'Utilize intelligent AI to quickly access specific sections, headings, or indexes, significantly speeding up the review of large documents. CorpusAI chat doc also provides a comprehensive AI experience, enhancing productivity and making document navigation effortless and more efficient.'
   
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-messages-square size-6 text-primary" aria-hidden="true"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"></path><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path></svg>
    ),
    title: 'Context-Aware Insights',
    description: 'Powered by ChatGPT-4, it analyzes the context of your queries to deliver highly relevant and accurate responses from your documents. It supports seamless communication in over 80 languages, making it ideal for global users and diverse content.'
   
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search h-6 w-6 text-purple-400" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
    ),
    title: 'Advanced Keyword Search',
    description: 'Perform keyword-based searches across multiple documents at once, instantly locating specific information with greater precision and efficiency, saving time and improving your overall document analysis workflow.'
    
  },
];

// Empowering cards data for 'We are Empowering' section
const empoweringCards = [
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-graduation-cap h-6 w-6 text-purple-400" aria-hidden="true"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path><path d="M22 10v6"></path><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path></svg>
    ),
    title: 'Students',
    description: 'Turn textbooks and notes into conversations. CorpusAI Chat helps you study exams, understand theories, and assist with assignments.'
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open h-6 w-6 text-purple-400" aria-hidden="true"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
    ),
    title: 'Researchers',
    description: 'Explore journals, studies, and literature easily. Chat with doc helps you gather data and uncover meaningful insights quickly.'
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase h-6 w-6 text-purple-400" aria-hidden="true"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect></svg>
    ),
    title: 'Professionals',
    description: 'Manage agreements, legal documents, and reports. CorpusAI doc chat helps you understand complex terms effortlessly.'
  }
];


 const faq = [
  {
    question: "Is CorpusAI  document chat tool free to use?",
    answer: "Yes! CorpusAI chat doc is free for up to 100 documents or 50MB of storage, with unlimited interactions. If you require additional storage or advanced features, our premium plans are available to suit your needs.",
  },
  {
    question: "Can CorpusAI chat doc support multiple file types?",
    answer: "Absolutely. Chat with doc supports a variety of file formats, including Word, PDF, TXT, PowerPoint, CSV, and TSV. If you need assistance with other formats, please contact our support team, and we'll be happy to help.",
  },
  {
    question: "Can I access the CorpusAI chat doc on my mobile device?",
    answer: "Yes, the CorpusAI chat doc is fully optimized for both iOS and Android, making it easy to access and interact with your documents on the go, whether you're at home or on the move.",
  },
  {
    question: "Can CorpusAI chat doc summarize long and complex documents?",
    answer: "Yes! DenserChat can quickly generate concise summaries of long and intricate documents, helping you save time and focus on the most critical information.",
  },
  {
    question: "Does CorpusAI chat with doc provide citation references for its responses?",
    answer: "Yes! Every response from DenserAI chat with doc includes source references from your document. This ensures transparency and allows you to verify the information directly within your files.",
  },

  {
    question: "How secure is my data with CorpusAI chat with doc?",
    answer: "We prioritize your privacy and security. All documents uploaded to DenserChat are encrypted and stored securely. We do not share your data with third parties, ensuring your information remains confidential.",
  },

 
];
export default function ChatWithBotPage(){
   
    return(
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent px-2 sm:px-4 py-8">
        {/* section 1 */}
        <div className="flex mt-8 lg:mt-12  flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-10 md:gap-16">
          {/* Left Section */}
          <div className="flex-1 flex flex-col items-start justify-center text-left max-w-lg">
            <span className="mb-4 px-4 py-1 rounded-full bg-purple-100 text-purple-500 border text-sm font-medium inline-block">Document Chat</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 text-zinc-900">
              Chat with<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Documents</span>
            </h1>
            <p className="text-zinc-500 mb-8 text-base sm:text-lg">
              Chat with your documents for free using CorpusAI! Instantly upload and understand complex files. Get reliable, accurate answers with citations from specific sections.
            </p>
            <button className="bg-purple-500 text-white rounded-full px-6 py-3 text-base font-semibold shadow-md hover:bg-purple-600 transition">Get Started</button>
          </div>
          
          <div className="flex-1 bg-[#FCF6FF] p-4 md:p-12 rounded-2xl border border-purple-200 flex items-center justify-center w-full">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md border border-white/40">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500 text-white rounded-md p-2 flex items-center justify-center text-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot w-4 h-4 text-white" aria-hidden="true"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
                  </div>
                  <div className="wrap flex gap-2 items-center">
                  <span className="font-semibold text-zinc-800 text-lg">AI Assistant</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-4 text-purple-500" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
                  </div>
                </div>
                {/* Chat Bubbles */}
                <div className="flex flex-col gap-2 mb-4">
                  <div data-aos="fade-up" data-aos-duration="400" className="self-end bg-gradient-to-b from-[#FDFCFF] to-[#F1E6FF] rounded-lg px-4 py-2 text-sm max-w-[80%]">Can you summarize this research paper for me?</div>
                  <div data-aos="fade-up" data-aos-duration="600" className="self-start bg-white border border-zinc-100 text-zinc-700 rounded-lg px-4 py-2 text-sm max-w-[90%] shadow-sm">
                    I'll analyze the paper and provide a comprehensive summary. The main findings are:<br />
                    <ul data-aos="fade-up" data-aos-duration="800" className="list-disc pl-5 mt-1">
                      <li>Advanced ML techniques improve accuracy by 45%</li>
                      <li>New methodology reduces processing time by 60%</li>
                      <li>Results are validated across multiple datasets</li>
                    </ul>
                  </div>
                  <div className="self-end bg-gradient-to-b from-[#FDFCFF] to-[#F1E6FF] rounded-lg px-4 py-2 text-sm max-w-[80%]">Thanks a lot!</div>
                </div>
                {/* Input Box */}
                <div className="flex items-center gap-2 mt-2">
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
        <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 lg:mt-32 mb-10">
          <div className="text-center mb-2 text-purple-400 font-semibold">Features</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-10">Smart CorpusAI Chatbot on Your Website</h2>
          <div className="w-full grid grid-cols-1  md:grid-cols-3 md:flex-row items-stretch justify-center gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <B2BFeatureCard key={i} icon={f.icon} title={f.title} description={f.description}/>
            ))}
          </div>
        </section>
  
        {/* section3 */}
        <section data-aos="fade-up" data-aos-duration="500" className="w-full section3 flex flex-col items-center mt-20 mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-12">How to Chat with Docs</h2>
          <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-10 px-2 sm:px-4">
            {/* Left: Image Card */}
            <div className="flex-1 flex items-center justify-center w-full mb-10 lg:mb-0">
              <div className="bg-white rounded-2xl shadow-xl border border-white/40 p-4 w-full max-w-xl">
                <img src="/assets/chatWithPdf.svg" alt="Create Chatbot - Upload Files" className="w-full rounded-xl" />
              </div>
            </div>
            {/* Right: Upload Info */}
            <div className="flex-1 flex flex-col items-start justify-center max-w-lg">
              <span className="mb-2 px-2 py-1 rounded-full text-purple-500 text-sm font-medium inline-block">Upload</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Upload Your PDF or Document</h3>
              <p className="text-zinc-500 text-base sm:text-lg">Simply upload your .doc, .txt, .csv, or .tsv files, or provide a URL if your content is online. Chat with Doc quickly analyzes your material, allowing you to start interacting immediately.</p>
            </div>
          </div>
        </section>
  
        {/* Chat Section */}
        <section data-aos="fade-left" data-aos-duration="500" className="w-full flex flex-col lg:flex-row items-center justify-center mt-20 mb-10 max-w-7xl mx-auto">
          {/* Left: Text */}
          <div className="flex-1 flex flex-col items-start justify-center max-w-lg mb-10 lg:mb-0">
            <span className="mb-2 px-2 py-1 rounded-full text-purple-500 text-sm font-medium inline-block">Ask</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Ask Your Question</h3>
            <p className="text-zinc-500 text-base sm:text-lg">Engage in natural, conversational queries with your document. Whether you're researching, studying, or seeking quick information, just ask and receive instant answers with the CorpusAI chat doc.</p>
          </div>
          {/* Right: Image */}
          <div className="flex-1 flex items-center justify-center w-full">
            <img src="/assets/summarizeImg.svg" alt="Summarize Example" className="w-full max-w-xl rounded-2xl shadow-xl border border-white/40 bg-white/70" />
          </div>
        </section>
        
        {/* AI-Driven Insights Section */}
        <section data-aos="fade-right" data-aos-duration="500" className="w-full flex flex-col-reverse lg:flex-row items-center justify-center mt-20 mb-10 max-w-7xl mx-auto">
          {/* Left: Image Card */}
          <div className="flex-1 flex items-center justify-center w-full mt-10 lg:mt-0">
            <div className="bg-white rounded-2xl shadow-xl border border-white/40 p-4 w-full max-w-xl">
              <img src="/assets/planWeek.svg" alt="Plan Week Example" className="w-full rounded-xl" />
            </div>
          </div>
          {/* Right: Text */}
          <div className="flex-1 flex flex-col items-start justify-center max-w-lg mb-10 lg:mb-0">
            <span className="mb-2 px-2 py-1 rounded-full text-purple-500 text-sm font-medium inline-block">Learn</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">AI-Driven Insights</h3>
            <p className="text-zinc-500 text-base sm:text-lg">CorpusAI Chat with doc delivers accurate and relevant responses based on your document's content. Our advanced AI ensures you get precise information and meaningful insights every time.</p>
          </div>
        </section>
        
  
        {/* Why Choose Section */}
        <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 mb-10 max-w-7xl mx-auto">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-12">We are Empowering</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {empoweringCards.map((item, i) => (
              <B2BReasonCard key={i} icon={item.icon} title={item.title} description={item.description}/>
            ))}
          </div>
        </section>
  <SolutionFAQ faqs={faq} title='FAQ' subtitle='Chat Doc FAQ'/>
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