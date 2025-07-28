import EducationFeatureCard from '@/app/components/EducationFeatureCard';
import B2BReasonCard from '@/app/components/B2BReasonCard';

import SolutionFAQ from '@/app/components/SolutionFAQ';
const features = [
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap size-6 text-primary" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
    ),
    title: 'Streamline Admin Tasks',
    description: 'From new student registration to course scheduling, educational chatbots can automate and simplify a wide range of administrative processes.',
    highlight: false,
  },
  {
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-headphones size-6 text-primary" aria-hidden="true"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"></path></svg>
    ),
    title: 'Enhance Student Support',
    description: 'Education chatbot acts as a reliable platform for students, assisting with document submissions, requirement requests, and other administrative tasks.',
    highlight: true,
  },
  {
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-graduation-cap size-6 text-primary" aria-hidden="true"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path><path d="M22 10v6"></path><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path></svg>
    ),
    title: 'Improve Employee Training',
    description: 'With engaging, interactive training materials, education AI chatbots simplify onboarding and training for new employees. They boost knowledge retention and make training more effective and enjoyable.',
    highlight: false,
  },
];

const reasons = [
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-6 w-6 text-purple-500" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>
    ),
    title: 'AI Educational Support',
    description: 'Advanced RAG technology and GPT-4 to help educational institutions improve teaching and services with accurate, interactive AI assistance.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings h-6 w-6 text-[#BF56FF]" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    ),
    title: 'Full Control Over Data',
    description: 'Institutions have complete control over their training data. Corpus AI chat learns from provided data while ensuring privacy and security.'
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap size-6 text-primary" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
    ),
    title: 'Smart, Natural Interaction',
    description: "CorpusAI's bots understand natural language and provide context-aware responses, making interactions smooth and intuitive."
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-line h-6 w-6 text-purple-400" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
    ),
    title: 'Customizable AI',
    description: "CorpusAI's chatbot for education can be tailored to match your school's name, logo, and branding for a unique and professional look."
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings h-6 w-6 text-purple-400" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    ),
    title: 'Improved Accessibility',
    description: 'Students, parents, and faculty can quickly find answers about enrollment, financial aid, course offerings, schedules, and more'
  },
  {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rocket h-6 w-6 text-purple-400" aria-hidden="true"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>
    ),
    title: 'Cut Costs',
    description: 'By taking on repetitive administrative and support tasks, chatbots help institutions reduce labor and resource costs.'
  },
];

const EducationFAQ = [
  {
    question: "What is an education chatbot?",
    answer: "AI (Artificial Intelligence) is a technology that allows machines to think, learn, and perform tasks that usually require human intelligence, like understanding language, making decisions, or recognizing patterns. Powered by AI, chatbot solutions can answer questions in natural languages. People use AI chatbot solutions for customer service, answering FAQs, booking appointments, and more, helping businesses save time and cost.",
  },
  {
    question: "Why do educational institutions need chatbots?",
    answer: "AI chatbots for education provide instant support, reduce the workload for educators and staff, and enhance student learning experiences while improving institutional efficiency.",
  },
  {
    question: "How can schools start using Corpus Chat?",
    answer: "Schools can create a Denser Chat by providing a website URL or uploading a collection of documents. Once built, the chatbot can be deployed either publicly or internally with just a few lines of code.",
  },
  {
    question: "How do education AI chatbots support teachers and staff?",
    answer: "They automate responses to FAQs, help organize course materials, provide smart teaching suggestions, and generate feedback on student queries to improve engagement.",
  },
  {
    question: "How can an AI chatbot improve school administration?",
    answer: "It can handle admissions inquiries, guide users through the application process, and act as a digital campus assistant, ready to handle student and staff inquiries.",
  },
];

export default function Education(){
    
    return (
    
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent px-2 sm:px-4 py-20">
          <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-10 md:gap-16">
            {/* Left Section */}
            <div className="flex-1 flex flex-col items-start justify-center text-left max-w-lg">
              <span className="mb-4 px-4 py-1 rounded-full bg-purple-100 text-purple-500 border text-sm font-medium inline-block">Education Integration</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-4 text-zinc-900">
                All-In-One 
<br />
        Conversational
 <br />AI Chatbot for <br/>
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF56FF] via-[#D0A8E9] to-[#BF56FF]">Education
</span>
              </h1>
              <p className="text-[#7F7A7A] mb-8 text-base sm:text-lg">
                Corpus Chat uses AI to automate student support, admissions, and admin tasks across K–12 and universities, processing thousands of pages at scale.
              </p>
              <button className="bg-[#BF56FF] text-white rounded-full px-6 py-3 text-base font-medium shadow-md  ">Get Started</button>
            </div>
            {/* Right Section: Chat Card */}
            <div className="flex-1 bg-[#FCF6FF]  p-4 md:p-12 rounded-2xl border border-purple-200 flex items-center justify-center w-full">
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
          <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 lg:mt-32 mb-10">
            <div className="text-center mb-2 text-purple-400 font-semibold">Features</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-10">Why Should Educational Institutions Adopt<br className='hidden sm:block'/>  Chatbots?</h2>
            <div className="w-full flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-5xl mx-auto">
              {features.map((f, i) => (
                <EducationFeatureCard key={i} icon={f.icon} title={f.title} description={f.description}  />
              ))}
            </div>
          </section>
    
         
         <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center mt-20 mb-10 max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-black text-center mb-12">Why Choose Corpus Chat for Education?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {reasons.map((r, i) => (
                <B2BReasonCard key={i} icon={r.icon} title={r.title} description={r.description} />
              ))}
            </div>
          </section>
    
          
          
          <div className='bg-[#F9F0FF] mt-10 lg:mt-20 px-4 pb-7 md:pb-10'>
        <section data-aos="fade-up" data-aos-duration="500" className="w-full flex flex-col items-center pl-7 pr-2 justify-center  mt-20 mb-10 mx-auto max-w-7xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-12">Add Chatbot to Your Website</h2>
          <div className="flex flex-col lg:flex-row md:justify-between items-center justify-center w-full  gap-10">
            {/* Left: Card with Tabs and Form */}
            <img className='order-2 lg:order-1 lg:w-1/2' src="/assets/Group 1321315402.png" alt="" />
            {/* Right: Setup Info */}
            <div className="flex-1 flex flex-col items-start justify-center mb-10 lg:mb-0 order-1">
              <span className="mb-2 px-2 py-1 rounded-full  text-purple-500 text-sm font-medium inline-block">Step 1</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Ingest</h3>
              <p className="text-zinc-500 text-base sm:text-lg">The Corpus Chat collaborates with your institution to gather and parse relevant documents, web pages, and PDFs—including course catalogs, admissions FAQs, policy manuals, and more.</p>
            </div>
          </div>
        </section>
  
        {/* Analyze Section */}
        <section data-aos="fade-left" data-aos-duration="500" className="w-full overflow-x-hidden pl-7 pr-2 flex flex-col lg:flex-row items-center justify-center mt-2 mb-10 max-w-7xl mx-auto">
          {/* Left: Text */}
          <div className="flex-1 flex flex-col items-start justify-center mb-10 lg:mb-0">
            <span className="mb-2 px-2 py-1 rounded-full text-purple-500 text-sm font-medium inline-block">Step 2</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Deploy</h3>
            <p className="text-zinc-500 text-base sm:text-lg">After ingesting the knowledge, you can deploy Corpus Chat to your website—whether internally or externally—with just a few lines of code.
</p>
          </div>
          {/* Right: Image Card */}
          <div className="flex-1 flex items-center justify-center">
            <img src="/assets/Group 1321315412.png" alt="Chatbot Build Status" className="w-full" />
          </div>
        </section>
  
        {/* Chat Section */}
      <section
  data-aos="fade-right"
  data-aos-duration="500"
  className="w-full flex flex-col-reverse lg:flex-row gap-8 px-6 items-center justify-between mt-20 mb-10 max-w-7xl mx-auto"
>
   <img
    src="/assets/Group 1321315410.png"
    alt="Is Corpusbot Free?"
    className="mb-10 lg:mb-0 lg:w-1/2"
  />
  {/* Text first in DOM */}
  <div className="flex-1 flex flex-col items-start justify-center mb-10 lg:mb-0">
    <span className="mb-2 px-2 py-1 rounded-full text-purple-500 text-sm font-medium inline-block">Step 3</span>
    <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">Ask Away</h3>
    <p className="text-zinc-500 text-base sm:text-lg">
      Students, parents, and faculty simply type their questions—Corpus Chat delivers precise, authoritative answers in real-time.
    </p>
  </div>

  {/* Image second in DOM */}
 
</section>
          </div>
            <section>
                <div>
             <SolutionFAQ
              faqs={EducationFAQ}
              title="FAQ"
              subtitle="Education Chatbot FAQ"/>
          </div>

        </section>
          
          
         
          <section className="text-center px-4 pt-[56px] pb-16 bg-white">
        <h1 className="text-xl sm:text-2xl md:text-5xl font-medium text-[#1E1E1E] leading-tight">
         Ready to Transform <br/><span className="bg-gradient-to-r from-[#DAC0FF] to-[#BF56FF] bg-clip-text text-transparent"> Your Educational Portal?</span>
        </h1>
        <p className="mt-4 text-[#8D8D8D] mx-auto text-base font-medium sm:text-lg">
          Contact us today to discover how Corpus Chat can revolutionize your student & staff engagement <br/>and support services.
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