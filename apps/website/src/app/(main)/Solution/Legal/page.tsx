import EducationFeatureCard from '@/app/components/EducationFeatureCard';
import B2BReasonCard from '@/app/components/B2BReasonCard';

import SolutionFAQ from '@/app/components/SolutionFAQ';

const features = [
  {
    icon: (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-chart-line h-6 w-6 text-[#BF56FF]" >
 <path d="M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M16 18.5L14.5 17M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2ZM15.5 14.5C15.5 16.433 13.933 18 12 18C10.067 18 8.5 16.433 8.5 14.5C8.5 12.567 10.067 11 12 11C13.933 11 15.5 12.567 15.5 14.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
    ),
    title: 'Automated Legal Research',
    description: 'Quickly search through case law, statutes, and legal documents to uncover relevant precedents and citations. Save hours of manual research time with powerful AI-driven search and legal analysis tools.',
    highlight: false,
  },
  {
    icon: (
       <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-chart-line h-6 w-6 text-[#BF56FF]">
 <path d="M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M16 13H8M16 17H8M10 9H8M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
    ),
    title: 'Doc Analysis & Review',
    description: `Automatically analyze contracts, pleadings, and legal documents to identify key clauses, flag potential issues, and ensure compliance with regulatory requirements. Streamline your workflow and reduce document review time by up to 80%.`,
    highlight: true,
  },
  {
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-6 w-6 text-[#BF56FF]" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>
    ),
    title: 'Case Law Analysis',
    description: 'Compare current cases with historical precedents, identify relevant statutes and legal principles, and generate clear, detailed case summaries. Quickly gain critical insights to strengthen your legal arguments and strategy.',
    highlight: false,
  },
 
];

const reasons = [
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-6 w-6 text-[#BF56FF]" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>
    ),
    title: 'Knowledge Leverage',
    description: `Instantly access your firm’s knowledge. Find precedents, documents, and insights to support your case.`
  },
  {
   icon: (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-chart-line h-6 w-6 text-[#BF56FF]">
 <path d="M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M16 13H8M16 17H8M10 9H8M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
    ),
    title: 'Document Intelligence',
    description: 'Analyze contracts and legal documents at scale to identify risks, extract key information, and ensure consistency across documents.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings h-6 w-6 text-[#BF56FF]" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>

    ),
    title: 'Workflow Integration',
    description: "Seamlessly integrate with your existing legal tools and processes enhancing  your current workflow without disrupting established practices."
  },
  {
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe size-6 text-primary" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
    ),
    title: 'Time Efficiency',
    description: "Cut hours on legal research and document review. Focus on strategy and client relationships, not repetitive tasks."
  },
  {
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-chart-line h-6 w-6 text-[#BF56FF]">
 <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
    ),
    title: 'Research Precision',
    description: 'Get accurate, relevant legal research results quickly. Find specific precedents, statutes, and citations that strengthen your case.'
  },
  {
    icon: (
       <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-globe size-6 text-primary">
 <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
    ),
    title: 'Due Diligence Automation',
    description: 'Streamline due diligence by automatically reviewing, summarizing documents, identifying risks, and flagging key information.'
  },
];


const EducationFAQ = [
  {
    question: "How does Corpus Chat improve legal professional productivity?",
    answer: "AI (Artificial Intelligence) is a technology that allows machines to think, learn, and perform tasks that usually require human intelligence, like understanding language, making decisions, or recognizing patterns. Powered by AI, chatbot solutions can answer questions in natural languages. People use AI chatbot solutions for customer service, answering FAQs, booking appointments, and more, helping businesses save time and cost.",
  },
  {
    question:"What types of legal documents can the system process?",
    answer: "The system can analyze a wide range of legal documents including contracts, pleadings, briefs, statutes, case law, regulatory filings, and internal legal memoranda. It handles multiple formats including PDF, Word, and text files.",
  },
  {
    question: "How does the AI assistant maintain confidentiality?",
    answer: "We implement strict security measures including access controls and private cloud deployment options. All processing adheres to legal professional privilege and client confidentiality requirements.",
  },
  {
    question: "How accurate is the legal research and analysis?",
    answer: "The AI provides highly accurate results by using advanced RAG technology to analyze your firm's documents, legal databases, and case law. However, it's designed to assist legal professionals, not replace their judgment. All AI-generated research and analysis should be reviewed by qualified legal professionals.",
  },
  
];

export default function legal(){
   
    return (
    
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent px-2 sm:px-4 py-20">
          <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-10 md:gap-16">
            {/* Left Section */}
            <div className="flex-1 flex flex-col items-start justify-center text-left max-w-lg">
              <span className="mb-4 px-4 py-1 rounded-full bg-purple-100 text-purple-500 border text-sm font-medium inline-block">Legal Solutions</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-4 text-[#000000]">
                AI Assistant<br/>for<span className="text-transparent bg-clip-text font-semibold bg-gradient-to-r from-[#BF56FF] via-[#D0A8E9] to-[#BF56FF]"> Lawyers & Paralegals</span>
              </h1>
              <p className="text-[#7F7A7A] mb-8 text-base sm:text-lg">
               Streamline your legal practice with our AI assistant that automates research, document review, and case analysis—helping legal professionals focus on high-value work while reducing repetitive tasks.
              </p>
              <button className="bg-[#BF56FF] text-white rounded-full px-6 py-3 text-base font-medium shadow-md  ">Get Started</button>
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
                  <div data-aos="fade-up" data-aos-duration="200" className="self-start bg-zinc-100 text-[#1E1E1E] rounded-lg px-4 py-2 text-sm max-w-[80%]">How can I assist you with workplace operations today?</div>
                  <div data-aos="fade-up" data-aos-duration="400" className="self-end bg-gradient-to-b from-[#FDFCFF] to-[#F1E6FF] text-[#1E1E1E] rounded-lg px-4 py-2 text-sm max-w-[80%]">I need help accessing the employee vacation policy.</div>
                  <div data-aos="fade-up" data-aos-duration="600" className="self-start bg-[#F0F0F0] border border-zinc-100 text-[#1E1E1E] rounded-lg px-4 py-2 text-sm max-w-[90%] shadow-sm">
                    <span className='font-medium'>I'll help you find the vacation policy document:</span><br/>
                    <br/>• Retrieving policy from knowledge base<br/>• You can access it at the HR portal?<br/> • Would you like me to summarize the key points
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
          <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 mb-20">
            <div className="text-center mb-2 text-purple-400 font-semibold">Features</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-zinc-900 text-center mb-10">How Internal Chatbots Revolutionize<br className='hidden sm:block'/>  Business Operations</h2>
            <div className="w-full grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 place-items-center gap-6 max-w-5xl mx-auto">
              {features.map((f, i) => (
                <EducationFeatureCard key={i} icon={f.icon} title={f.title} description={f.description}  />
              ))}
            </div>
          </section>
    
         
         <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 mb-20 max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-4xl font-semibold text-[#000000] text-center mb-12">Why Legal Professionals Choose Corpus Chat</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {reasons.map((r, i) => (
                <B2BReasonCard key={i} icon={r.icon} title={r.title} description={r.description} />
              ))}
            </div>
          </section>
    
        <div className='bg-[#F9F0FF] mt-10 lg:mt-20 px-4 pb-7 md:pb-10'>
        <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center pl-7 pr-2 justify-center  mt-20 mb-10 mx-auto max-w-7xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-12">How It Works</h2>
          <div className="flex flex-col lg:flex-row md:justify-between items-center justify-center w-full  gap-10">
            {/* Left: Card with Tabs and Form */}
            <img className='order-2 lg:order-1 lg:w-1/2' src="/legal/legal 1.png" alt="" />
            {/* Right: Setup Info */}
            <div className="flex-1 flex flex-col items-start justify-center mb-10 lg:mb-0 order-1">
              <span className="mb-2 px-2 py-1 rounded-full  text-purple-500 text-sm font-medium inline-block">Step 1</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Connect Your Resources</h3>
              <p className="text-zinc-500 text-base sm:text-lg">Integrate with your legal database, document management system, and case files. Our AI indexes your firm's documents, precedents, and legal resources for instant access..</p>
            </div>
          </div>
        </section>
  
        {/* Analyze Section */}
        <section data-aos="fade-left" data-aos-duration="500" className="w-full overflow-x-hidden pl-7 pr-2 flex flex-col lg:flex-row items-center justify-center mt-2 mb-10 max-w-7xl mx-auto">
          {/* Left: Text */}
          <div className="flex-1 flex flex-col items-start justify-center mb-10 lg:mb-0">
            <span className="mb-2 px-2 py-1 rounded-full text-purple-500 text-sm font-medium inline-block">Step 2</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Secure Setup</h3>
            <p className="text-zinc-500 text-base sm:text-lg">Deploy on your preferred infrastructure with enterprise-grade security. Maintain client confidentiality and comply with legal data protection requirements.</p>
          </div>
          {/* Right: Image Card */}
          <div className="flex-1 flex items-center justify-center">
            <img src="/legal/legal 2.png" alt="Chatbot Build Status" className="w-full" />
          </div>
        </section>
  
        {/* Chat Section */}
      <section
  data-aos="fade-right"
  data-aos-duration="500"
  className="w-full flex flex-col-reverse lg:flex-row gap-8 px-6 items-center justify-between mt-20 mb-10 max-w-7xl mx-auto"
>
   <img
    src="/legal/legal 3.png"
    alt="Is Corpusbot Free?"
    className="mb-10 lg:mb-0 lg:w-1/2"
  />
  {/* Text first in DOM */}
  <div className="flex-1 flex flex-col items-start justify-center mb-10 lg:mb-0">
    <span className="mb-2 px-2 py-1 rounded-full text-purple-500 text-sm font-medium inline-block">Step 3</span>
    <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Enhance Your Practice</h3>
    <p className="text-zinc-500 text-base sm:text-lg">
    Start using AI to automate research, document review, and case analysis. Free up time for strategic work and client interaction.
    </p>
  </div>

  {/* Image second in DOM */}
 
</section>
          </div>
            <section>
                <div>
      {/* Your other content */}
      <SolutionFAQ
        faqs={EducationFAQ}
        title="FAQ"
        subtitle="Legal Professional FAQ"
      />
    </div>

</section>
          {/* Why Choose Section */}
          
         
          <section className="text-center px-4 pt-[56px] pb-16 bg-white">
        <h1 className="text-xl sm:text-2xl md:text-5xl font-medium text-[#1E1E1E] leading-tight">
         Ready to Transform <br/><span className="bg-gradient-to-r from-[#DAC0FF] to-[#BF56FF] bg-clip-text text-transparent"> your Legal operations?</span>
        </h1>
        <p className="mt-4 text-[#8D8D8D] mx-auto font-medium text-base sm:text-lg">
          Contact us today to see how Corpus Chat can revolutionize legal research, document retrieval, and overall efficiency for your practice!
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